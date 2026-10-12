# Kumiho Research-Capture Spec

**Date:** 2026-10-07 · **Status:** DESIGN ONLY — nothing written to any graph
**Author:** Hermes subagent (research-capture design)
**Audience:** Revka / Kumiho team (James reads for decisions)
**Deliverable:** the node/edge model, property contracts, idempotency keys, and the JSON payload Revka is handed per capture, so research jobs stop inventing their own shapes.

---

## 0. TL;DR

1. **Do not invent a parallel schema.** Kumiho CE already stores everything as `:Item` (generic, discriminated by `kind`) + `:Revision` (versioned, embedded content), grouped by `:Project` / `:Space`. We **extend** that model with *secondary labels* on `Item` and a small set of new edge types. No renames, no deletions.
2. A **research capture is an `Item` + `Revision` + typed edges**, written via Revka. The domain identity of an item lives in `Item.kind` and its secondary label (`:Item:Paper`, `:Item:Claim`, …).
3. Every edge carries **`source` + `confidence`** (house rule), and every claim→paper edge additionally carries **`page` + `quote` + `locator`** so a claim is auditable to a passage.
4. **Idempotency is key-based**, not id-based: every label has one deterministic lookup key; Revka `MERGE`s on it. Kumiho also has its own `:IdempotencyKey` label — see §6 and open question OQ-3.
5. "**This content came from these 5 papers**" is a 2-hop query: `Document -[:SYNTHESIZES]-> Claim -[:DERIVED_FROM]-> Paper` (§8).

---

## 1. What already exists (evidence, not assumptions)

Read-only investigation of the house conventions. Sources:

- `out/fleet/s.json` — live output of `kumiho_stack.py` (reads Neo4j directly via `~/.kumiho/server.toml` creds).
- `out/fleet/kumiho_stack.py`, `out/fleet/kumiho_probe.py` — the readers.
- `VIDIFLOW-STATUS-AND-SOLUTION-2026-10-05.md` §GAP 2 — graph state + the "every edge needs `source` + `confidence`" rule.
- `business-plan/REVKA-KUMIHO-CONTEXT-LOCK.md`, `business-plan/VIDI_AI_X_VIDIFLOW_SETUP_AND_OPERATIONS_MANUAL.md` — the engage→answer→reflect turn shape and the `DERIVED_FROM` / `source_krefs` vocabulary.
- `vidiflow/KUMIHO_REVKA_STATUS_SUMMARY.md`, `out/fleet/_smartstack_setup_plan.md` — deployment + 9Miho surface.

### 1.1 Live Kumiho labels & relationships (last read)

```
Labels:  Space  Item  Revision  Artifact  Project  ProjectName  Tenant
         User  AdminUsers  UserRole  IdempotencyKey
         ProjectDeletionGuard  ProjectDeletionReceipt
Rels:    CONTAINS  CREATED  HAS_REVISION  OWNS  RESOLVES_TO
Spaces:  /9miho/assets  /9miho/runs  /CognitiveMemory/Memory
         /CognitiveMemory/Skills  /Revka/Goals
Item:    has a `kind` property; item names are dotted slugs, e.g.
         `ten-projects-into-revka-agent-os.goal`
Project: has `project_id` (uuid), `name`, `description`, `updated_at` (UTC)
Vector:  index `revision_embedding`, 1024-dim — embeddings live on `:Revision`
```

### 1.2 What this tells us (the model we must fit)

| Layer | Node | Role |
|---|---|---|
| Container | `:Project` → `:Space` | top-level grouping; `Space.path` like `/CognitiveMemory/Research` |
| Entity | `:Item` (`kind`) | the atomic named thing; carries identity + auditable keys |
| Content | `:Revision` | versioned, embeddable text; linked `Item-[:HAS_REVISION]->Revision` |
| Blob | `:Artifact` | files (label exists, 0 nodes — see OQ-6) |
| Write-guard | `:IdempotencyKey` | Kumiho's own dedupe label (exists, 0 nodes — OQ-3) |

**Consequence:** a "Paper", a "Claim", a "Product", a "ResearchJob", a "Document" are all *kinds of `Item`*. We give each a **secondary Neo4j label** so both the Kumiho engine (`MATCH (i:Item)`) and our domain queries (`MATCH (p:Paper)`) work against the same node.

### 1.3 Naming conventions we are adopting (from the house, not invented)

- **Properties: `snake_case`** (`project_id`, `updated_at`, `firebase_uid`, `display_name`).
- **Relationship types: `UPPER_SNAKE`** (`HAS_REVISION`, `RESOLVES_TO`).
- **Constraint/index names: `lower_snake`** (`person_firebase`, `person_name`).
- **Timestamps: UTC**, ISO-8601 (`2026-10-07T14:02:11Z` / offset `+00:00`).
- **Every relationship carries `source` + `confidence`** (VIDIFLOW-STATUS §GAP 2).
- **Item names are `<slug>.<kind>`** (matches `*.goal`).
- **`DERIVED_FROM` and `source_krefs` are already the house words** for provenance — this spec adopts them rather than renaming.

> **Diff in spirit (headline):** zero lines changed in the existing schema; we add secondary labels + edge types + constraints only. Full diff in §9.

---

## 2. Design principles

1. **Atomicity.** A `Claim` is one falsifiable assertion in one sentence. If it contains "and", split it.
2. **Provenance is an edge, not a text field.** "Where did this come from" is `DERIVED_FROM` with `page`/`quote`. Never bury a citation in free text.
3. **Content-addressed identity.** Idempotency keys are hashes of *content + provenance scope*, so re-running a job over the same papers produces the same nodes, not duplicates.
4. **Single source of truth per fact.** A generated deck does **not** get its own `DERIVED_FROM` edges to papers; it rests on claims, and the claims carry the provenance. (Rejected alternative documented in §5.3.)
5. **Fail-closed on drift.** If a key can't be computed, the capture is rejected, not written under a random id.

---

## 3. Node labels & property contracts

All domain nodes below are **`:Item` + one secondary label**, except `:Revision` and `:Artifact` which are Kumiho-native. `key` = the idempotency/lookup key (§6).

### 3.1 `:Item:Paper` — `kind = "paper"`
A scientific source.

| Prop | Req | Notes |
|---|---|---|
| `paper_key` | **yes** | unique. `doi` normalized (lowercase, `https://doi.org/` stripped) if present, else `noid:<sha1(lower(title)|year|first_author_surname)>` |
| `kind` | **yes** | `"paper"` |
| `title` | **yes** | |
| `doi` | no | when present, indexed (secondary lookup) |
| `pmid`, `arxiv_id` | no | indexed |
| `year` | no | int |
| `venue` | no | journal / conference / preprint server |
| `authors` | no | list<string>, `"Surname, Initials"` |
| `source_type` | no | `journal`\|`preprint`\|`report`\|`web` |
| `url`, `abstract` | no | |
| `content_hash` | no | sha256 of the source file (ties to `:Artifact`) |
| `retrieved_at` | no | UTC |

### 3.2 `:Item:Claim` — `kind = "claim"`
The atomic assertion — the unit everything queries against.

| Prop | Req | Notes |
|---|---|---|
| `claim_key` | **yes** | unique. `sha1(normalize(claim_text))` — content-addressed (see below) |
| `kind` | **yes** | `"claim"` |
| `summary` | **yes** | ≤200-char human label (this is the *Item* identity text) |
| `status` | no | `extracted`\|`synthesized`\|`accepted`\|`rejected` (default `extracted`) — Tensor-Truth gate reads this |
| `claim_type` | no | `empirical`\|`methodological`\|`comparative`\|`definitional` |
| `polarity` | no | `positive`\|`negative`\|`null` |
| `confidence` | no | 0–1 extractor confidence |
| `created_at`, `created_by` | no | UTC / agent id |

**Canonical assertion text lives on the `:Revision`** (`text`), because that is what gets embedded (`revision_embedding`) — retrieval/semantic search is Revision-level. `summary` on the Item is for graph traversal/UI.

> **Opinionated choice — content-addressed `claim_key`.** `sha1(normalize(text))` with normalization = lowercase, strip punctuation, collapse whitespace, strip braces/et al. The **same assertion extracted from two papers collapses to one Claim with two `DERIVED_FROM` edges.** That makes "which papers support this claim" a natural fan-in and kills duplicate nodes on re-run. Trade-off: two genuinely distinct findings worded identically merge — acceptable, and split-able later via `status`. (Alternative `sha1(text|paper_key)` was rejected: it makes cross-paper corroboration unqueryable.)

### 3.3 `:Item:Concept` — `kind = "concept"`
A topic / controlled-vocabulary tag.

| Prop | Req | Notes |
|---|---|---|
| `concept_key` | **yes** | unique. `lower(snake(name))` |
| `kind` | **yes** | `"concept"` |
| `name` | **yes** | canonical label |
| `aliases` | no | list<string> |
| `definition` | no | |
| `broader_key` | no | concept_key of parent (loose hierarchy) |

Prefer a **controlled vocabulary** — new concepts should be curated, not spawned per-job. Flag: curation owner is unassigned (OQ-7).

### 3.4 `:Item:Product` — `kind = "product"`
What a claim applies to (an AirPMD / HSA / VidiFlow feature). One node per *feature surface*, not per product line.

| Prop | Req | Notes |
|---|---|---|
| `product_key` | **yes** | unique. `slug(product_line)[-slug(feature)]`, e.g. `airpmd-ct-segmentation` |
| `kind` | **yes** | `"product"` |
| `name` | **yes** | display, e.g. `AirPMD CT segmentation` |
| `product_line` | no | `AirPMD`\|`HSA`\|`VidiFlow`\|`9Miho`\|… |
| `feature` | no | the specific capability |
| `status` | no | `shipped`\|`planned`\|`concept` |

### 3.5 `:Item:ResearchJob` — `kind = "research_job"`
The run that produced captures. Gives "what did we conclude and why" its "why".

| Prop | Req | Notes |
|---|---|---|
| `job_id` | **yes** | unique. `uuid4` (human-issued) + optional `brief_hash` for re-run detection |
| `kind` | **yes** | `"research_job"` |
| `started_at` | **yes** | UTC |
| `finished_at` | no | UTC |
| `status` | no | `running`\|`ok`\|`failed` |
| `job_type` | no | `paper_read`\|`synthesis`\|`content_gen` |
| `brief` | no | the task/question given to the job |
| `input_paper_keys` | no | list |
| `model`, `agent` | no | |
| `run_dir` | no | artifact location |

### 3.6 `:Item:Document` — `kind = "document"`
A generated synthesis (deck, report, thread, blog).

| Prop | Req | Notes |
|---|---|---|
| `doc_key` | **yes** | unique. `sha1(job_id|doc_type|slug(title)|version)` |
| `kind` | **yes** | `"document"` |
| `title` | **yes** | |
| `doc_type` | **yes** | `deck`\|`report`\|`summary`\|`thread`\|`blog` |
| `version` | no | int, default 1 |
| `status` | no | `draft`\|`review`\|`final` |
| `created_at`, `generator` | no | |
| `audience`, `language`, `page_count` | no | |

### 3.7 `:Artifact` (Kumiho-native)
The file body (PDF, PPTX, rendered deck).

| Prop | Req | Notes |
|---|---|---|
| `artifact_key` | **yes** | unique. `sha256` of bytes — content-addressed, dedupes identical files |
| `path` | **yes** | |
| `mime` | **yes** | |
| `bytes` | no | int |
| `created_at` | no | |

> **Caveat:** the `:Artifact` label exists in Kumiho with 0 nodes; whether third parties may write it is unverified (OQ-6). If not, fall back to `:Item:Artifact` `kind="artifact"`.

### 3.8 `:Revision` (Kumiho-native, do not redefine)
Holds `text`/`content` + embedding. We only **link** to it (`HAS_REVISION`). Do not invent parallel fields on it.

### 3.9 Housing (`:Project` / `:Space`)
- Project: `CognitiveMemory` (existing).
- Space: **`/CognitiveMemory/Research`** (proposed, not created — see OQ-8).
- Link: `(:Space)-[:CONTAINS]->(:Item)` (existing convention).

---

## 4. Relationship types

Direction is always **specific → general** so reads are natural ("this claim came from that paper").

| Type | Direction | Meaning | Required props | Optional props |
|---|---|---|---|---|
| `DERIVED_FROM` | `Claim → Paper` | extraction provenance | `source`, `confidence` | `page`, `section`, `locator`, `quote`, `extracted_at`, `extractor` |
| `CITES` | `Paper → Paper` | bibliography | `source` | `context` |
| `SUPPORTS` | `Claim → Claim` | corroborates (differently worded) | `source`, `confidence` | `note` |
| `CONTRADICTS` | `Claim → Claim` | conflicts | `source`, `confidence` | `note` |
| `APPLIES_TO` | `Claim → Product` | relevance to a product/feature | `source`, `confidence` | `rationale` |
| `ABOUT` | `Claim → Concept`, `Paper → Concept` | topic tagging | `source` | `weight` |
| `PRODUCED_BY` | `Claim → ResearchJob`, `Document → ResearchJob` | run that produced it | — | — |
| `SYNTHESIZES` | `Document → Claim` | the doc rests on this claim | — | `weight` |
| `RENDERED_AS` | `Document → Artifact` | file output | — | — |
| `HAS_REVISION` | `Item → Revision` | **existing** | — | — |
| `CONTAINS` | `Space → Item` | **existing** | — | — |

### 4.1 Direction rationale
- `DERIVED_FROM` `Claim→Paper` (not the reverse) so `MATCH (c:Claim)-[:DERIVED_FROM]->(p:Paper)` reads "claim came from paper". Matches the operations-manual phrasing ("linking `DERIVED_FROM` to engage `source_krefs`").
- `CITES` vs `DERIVED_FROM` are **different edges on purpose**: `CITES` = the source's own bibliography (paper→paper); `DERIVED_FROM` = *we extracted this claim from* that paper. Do not collapse them.
- `APPLIES_TO` is `Claim→Product` because the claim is the thing doing the applying.

### 4.2 Edges that must NOT exist
- `Claim → Revision` (content is reached via `HAS_REVISION`, keep it uniform).
- `Document → Paper` direct. The deck's provenance is **derived** transitively through its claims (§2.4). Adding a direct edge creates a second source of truth that drifts.

### 4.3 Rejected alternatives
- **`TAGGED_WITH`** — redundant with `ABOUT`; one topic-edge type only.
- **Modeling Paper/Claim as free top-level labels without `:Item`** — would hide them from Kumiho's engine (`MATCH (i:Item)`), 9Miho's UI, and the `revision_embedding` path. Rejected.
- **Putting `quote`/`page` on the Claim node** — loses the ability to record *per-paper* provenance when one claim comes from several papers. Kept on the edge.

---

## 5. Idempotency keys (one per label)

| Label | Key field | Formula | Re-run behavior |
|---|---|---|---|
| Paper | `paper_key` | normalized `doi`, else `noid:<sha1(lower(title)\|year\|first_author_surname)>` | re-read same paper → same node |
| Claim | `claim_key` | `sha1(normalize(text))` | same assertion → same node; extra papers add `DERIVED_FROM` edges |
| Concept | `concept_key` | `lower(snake(name))` | stable |
| Product | `product_key` | `slug(product_line[-feature])` | stable |
| ResearchJob | `job_id` | `uuid4` (+ `brief_hash`) | each run is a new node by design |
| Document | `doc_key` | `sha1(job_id\|doc_type\|slug(title)\|version)` | same doc spec → same node; bump `version` for a new revision |
| Artifact | `artifact_key` | `sha256(bytes)` | identical file → same node |

**Rules**
- Revka **never** trusts a Kumiho internal id in a payload — it always resolves the `key` and `MERGE`s.
- Keys are namespaced by label (a `paper_key` and a `claim_key` may collide as strings; they never share a namespace).
- If a key cannot be computed, **reject the capture** (principle 5) — do not fall back to a random id.

### 5.1 Constraints & indexes (house naming, ready to run when unblocked)

```cypher
// uniqueness (Neo4j 5 ignores nulls, so the *key* is non-null and required)
CREATE CONSTRAINT paper_key    IF NOT EXISTS FOR (n:Paper)        REQUIRE n.paper_key    IS UNIQUE;
CREATE CONSTRAINT claim_key    IF NOT EXISTS FOR (n:Claim)        REQUIRE n.claim_key    IS UNIQUE;
CREATE CONSTRAINT concept_key  IF NOT EXISTS FOR (n:Concept)      REQUIRE n.concept_key  IS UNIQUE;
CREATE CONSTRAINT product_key  IF NOT EXISTS FOR (n:Product)      REQUIRE n.product_key  IS UNIQUE;
CREATE CONSTRAINT job_id       IF NOT EXISTS FOR (n:ResearchJob)  REQUIRE n.job_id       IS UNIQUE;
CREATE CONSTRAINT doc_key      IF NOT EXISTS FOR (n:Document)     REQUIRE n.doc_key      IS UNIQUE;
CREATE CONSTRAINT artifact_key IF NOT EXISTS FOR (n:Artifact)     REQUIRE n.artifact_key IS UNIQUE;

// secondary lookup indexes on natural identifiers
CREATE INDEX paper_doi   IF NOT EXISTS FOR (n:Paper) ON (n.doi);
CREATE INDEX paper_pmid  IF NOT EXISTS FOR (n:Paper) ON (n.pmid);
CREATE INDEX paper_year  IF NOT EXISTS FOR (n:Paper) ON (n.year);
CREATE INDEX claim_status IF NOT EXISTS FOR (n:Claim) ON (n.status);
CREATE INDEX product_line IF NOT EXISTS FOR (n:Product) ON (n.product_line);

// edge property index for provenance drills
CREATE INDEX derived_page IF NOT EXISTS FOR ()-[r:DERIVED_FROM]-() ON (r.page);
```

> **Do not run these yet** — Kumiho is BLOCKED/unseeded; this is spec, and constraint creation may be Kumiho's job (OQ-4).

---

## 6. The capture payload (what Revka is handed)

One **envelope per job**, containing **node ops** (upserts, keyed) and **edge ops** (links, keyed at both ends). Revka resolves every `key` to a node and `MERGE`s; there is no id, no Cypher in the payload, and **no delete op**.

```json
{
  "capture_version": "1.0",
  "project": "CognitiveMemory",
  "space": "/CognitiveMemory/Research",
  "job": {
    "job_id": "1f0a9c3e-6b2d-4c7a-9e01-2a4b6c8d0e11",
    "job_type": "paper_read",
    "brief": "Read 24 CT/AI papers; extract claims relevant to AirPMD segmentation.",
    "started_at": "2026-10-07T14:02:11Z",
    "model": "…",
    "agent": "revka"
  },
  "source_krefs": ["kref://CognitiveMemory/…"],
  "nodes": [
    { "label": "Paper",       "kind": "paper",       "key": "10.1038/s41467-024-44824-z", "props": { } },
    { "label": "Claim",       "kind": "claim",       "key": "sha1:9c1f…",  "props": { } },
    { "label": "Product",     "kind": "product",     "key": "airpmd-ct-segmentation", "props": { } },
    { "label": "Concept",     "kind": "concept",     "key": "medical-image-segmentation", "props": { } },
    { "label": "ResearchJob", "kind": "research_job","key": "1f0a9c3e-…", "props": { } }
  ],
  "edges": [
    { "type": "DERIVED_FROM", "from": {"label":"Claim","key":"sha1:9c1f…"}, "to": {"label":"Paper","key":"10.1038/…"}, "props": { } },
    { "type": "APPLIES_TO",   "from": {"label":"Claim","key":"sha1:9c1f…"}, "to": {"label":"Product","key":"airpmd-ct-segmentation"}, "props": { } },
    { "type": "ABOUT",        "from": {"label":"Claim","key":"sha1:9c1f…"}, "to": {"label":"Concept","key":"medical-image-segmentation"}, "props": { } },
    { "type": "PRODUCED_BY",  "from": {"label":"Claim","key":"sha1:9c1f…"}, "to": {"label":"ResearchJob","key":"1f0a9c3e-…"}, "props": { } }
  ]
}
```

**Envelope contract**

| Field | Req | Meaning |
|---|---|---|
| `capture_version` | yes | schema version; Revka rejects unknown majors |
| `project` | yes | Kumiho project |
| `space` | yes | Kumiho space path for new items |
| `job` | yes | the `ResearchJob` identity (also appears as a node op) |
| `source_krefs` | no | engage handles this capture was reasoned from (house vocabulary) |
| `nodes[]` | yes | `{label, kind, key, props}` — upsert by `key` |
| `edges[]` | yes | `{type, from{label,key}, to{label,key}, props}` — MERGE on (from,to,type) |

**Revka's implied graph op per node** (for implementers; Revka owns the actual mechanism — OQ-5):

```cypher
MERGE (n:Item:Paper { paper_key: $key })
  ON CREATE SET n.created_at = $now
SET n += $props;           // upsert (additive, never overwrite created_at)
```

---

## 7. Worked example — one paper → claim → product chain

MedSAM is a real, well-known paper used here as the illustrative chain (the claim wording is example content, not a verified extraction).

**Source paper** (`Paper`)
```
paper_key : 10.1038/s41467-024-44824-z
title     : "Segment anything in medical images"
year      : 2024
venue     : "Nature Communications"
authors   : ["Ma, J.", "He, Y.", "Li, F.", "Han, L.", "You, C.", "Wang, B."]
source_type: journal
```

**Node ops**

```json
{
  "nodes": [
    { "label": "Paper", "kind": "paper", "key": "10.1038/s41467-024-44824-z",
      "props": { "title": "Segment anything in medical images", "year": 2024,
                 "venue": "Nature Communications", "source_type": "journal",
                 "authors": ["Ma, J.", "He, Y.", "Li, F.", "Han, L.", "You, C.", "Wang, B."] } },

    { "label": "Claim", "kind": "claim", "key": "sha1:9c1f3a…",
      "props": { "summary": "One promptable model generalizes across 10 imaging modalities with no per-modality retraining.",
                 "status": "extracted", "claim_type": "empirical",
                 "polarity": "positive", "confidence": 0.82,
                 "created_at": "2026-10-07T14:07:33Z", "created_by": "revka" } },

    { "label": "Product", "kind": "product", "key": "airpmd-ct-segmentation",
      "props": { "name": "AirPMD CT segmentation", "product_line": "AirPMD",
                 "feature": "CT segmentation", "status": "planned" } },

    { "label": "Concept", "kind": "concept", "key": "medical-image-segmentation",
      "props": { "name": "Medical image segmentation" } },

    { "label": "ResearchJob", "kind": "research_job",
      "key": "1f0a9c3e-6b2d-4c7a-9e01-2a4b6c8d0e11",
      "props": { "job_type": "paper_read", "started_at": "2026-10-07T14:02:11Z",
                 "status": "ok", "model": "…", "agent": "revka",
                 "brief": "Read 24 CT/AI papers; extract claims relevant to AirPMD segmentation." } }
  ],
  "edges": [
    { "type": "DERIVED_FROM",
      "from": { "label": "Claim", "key": "sha1:9c1f3a…" },
      "to":   { "label": "Paper", "key": "10.1038/s41467-024-44824-z" },
      "props": { "source": "revka.reflect", "confidence": 0.82,
                 "page": 3, "section": "Results",
                 "quote": "…fine-tuned on 1,570,263 medical image–mask pairs…",
                 "locator": "pdf:p3:c12", "extracted_at": "2026-10-07T14:07:33Z",
                 "extractor": "revka.paper-reader" } },

    { "type": "APPLIES_TO",
      "from": { "label": "Claim", "key": "sha1:9c1f3a…" },
      "to":   { "label": "Product", "key": "airpmd-ct-segmentation" },
      "props": { "source": "revka.reflect", "confidence": 0.7,
                 "rationale": "Directly supports promptable CT segmentation for AirPMD." } },

    { "type": "ABOUT",
      "from": { "label": "Claim", "key": "sha1:9c1f3a…" },
      "to":   { "label": "Concept", "key": "medical-image-segmentation" },
      "props": { "source": "revka.reflect" } },

    { "type": "PRODUCED_BY",
      "from": { "label": "Claim", "key": "sha1:9c1f3a…" },
      "to":   { "label": "ResearchJob", "key": "1f0a9c3e-6b2d-4c7a-9e01-2a4b6c8d0e11" },
      "props": { } }
  ]
}
```

**Second paper reaching the same assertion** does not create a new Claim — it adds one more `DERIVED_FROM` from the *same* `claim_key`, with its own `page`/`quote`. That is the fan-in that answers "which papers support this?"

**A generated deck** then links `Document -[:SYNTHESIZES]-> (:Claim)` and `Document -[:PRODUCED_BY]-> (:ResearchJob)`, and inherits provenance transitively.

---

## 8. Provenance queries (the point of the whole design)

**Q1 — "This deck came from these papers."** (the single provenance query)
```cypher
MATCH (d:Document { doc_key: $doc_key })-[:SYNTHESIZES]->(c:Claim)
      -[:DERIVED_FROM]->(p:Paper)
RETURN p.title AS paper, p.doi AS doi, p.year AS year,
       count(DISTINCT c) AS claims_used
ORDER BY year;
```

**Q2 — "This content came from these 5 papers"** (assert the source set, don't just count)
```cypher
MATCH (d:Document { doc_key: $doc_key })-[:SYNTHESIZES]->(:Claim)
      -[:DERIVED_FROM]->(p:Paper)
WITH d, collect(DISTINCT p.paper_key) AS papers
RETURN d.title AS document, size(papers) AS source_paper_count, papers
ORDER BY source_paper_count DESC;
```

**Q3 — "Which papers support this claim?"** (claim-level audit with passages)
```cypher
MATCH (c:Claim { claim_key: $claim_key })-[df:DERIVED_FROM]->(p:Paper)
RETURN p.title AS paper, p.year AS year, p.doi AS doi,
       df.page AS page, df.quote AS quote, df.confidence AS confidence
ORDER BY year;
```

**Q4 — "What did we conclude, and why?"** (claim + corroboration/conflict + originating job)
```cypher
MATCH (c:Claim { claim_key: $claim_key })
OPTIONAL MATCH (c)-[s:SUPPORTS]->(:Claim)
OPTIONAL MATCH (c)-[x:CONTRADICTS]->(:Claim)
OPTIONAL MATCH (c)-[:PRODUCED_BY]->(j:ResearchJob)
RETURN c.summary AS claim, c.status AS status,
       count(DISTINCT s) AS supporting, count(DISTINCT x) AS contradicting,
       j.brief AS from_brief, j.started_at AS run_at;
```

**Q5 — "Every audited claim behind a product feature"**
```cypher
MATCH (cl:Claim)-[:APPLIES_TO]->(pr:Product { product_key: $product_key })
MATCH (cl)-[df:DERIVED_FROM]->(p:Paper)
WHERE cl.status IN ['accepted','synthesized']
RETURN cl.summary AS claim, p.title AS paper, df.page AS page, df.confidence AS conf
ORDER BY conf DESC;
```

**Q6 — Same assertion, multiple independent papers** (corroboration strength)
```cypher
MATCH (c:Claim { claim_key: $claim_key })-[:DERIVED_FROM]->(p:Paper)
WITH c, count(DISTINCT p) AS independent_papers
RETURN c.summary AS claim, independent_papers,
       CASE WHEN independent_papers >= 2 THEN 'corroborated' ELSE 'single-source' END AS strength;
```

---

## 9. Diff in spirit (existing → proposed)

```diff
  NODE LABELS (existing, unchanged)
    Space  Item  Revision  Artifact  Project  ProjectName  Tenant
    User  AdminUsers  UserRole  IdempotencyKey
    ProjectDeletionGuard  ProjectDeletionReceipt

+ NODE LABELS (secondary, additive — ride on :Item)
+   :Paper  :Claim  :Concept  :Product  :ResearchJob  :Document
+   Item.kind values: "paper" "claim" "concept" "product" "research_job" "document"

  RELATIONSHIP TYPES (existing, unchanged)
    CONTAINS  CREATED  HAS_REVISION  OWNS  RESOLVES_TO

+ RELATIONSHIP TYPES (additive)
+   DERIVED_FROM  CITES  SUPPORTS  CONTRADICTS  APPLIES_TO
+   ABOUT  PRODUCED_BY  SYNTHESIZES  RENDERED_AS

+ PROPERTIES (additive, snake_case to match house)
+   Paper: paper_key doi pmid year venue … | Claim: claim_key summary status …
+   (full contracts in §3)

+ CONSTRAINTS/INDEXES (§5.1) — house lower_snake naming

+ HOUSING
+   Space path /CognitiveMemory/Research   (proposed, not created)

- NONE. No renames. No deletions. No changes to existing labels, relationships,
- or properties. No change to :Revision or :Artifact definitions.
```

---

## 10. What I did NOT change

- **No connections to Neo4j.** No bolt session, no Cypher executed, no read or write against the graph. Everything about the *current* schema is quoted from the existing artifacts in §1.1.
- **No graph writes, no seeding.** Pack A is untouched (12 captures still unseeded; still gated on James saying go).
- **No existing files modified.** This spec is new. The capture-related docs (`REVKA-KUMIHO-CONTEXT-LOCK.md`, `KUMIHO_REVKA_STATUS_SUMMARY.md`, the operations manual, `kumiho_stack.py`, `kumiho_probe.py`, `s.json`) were **read only**.
- **No constraints/indexes created.** §5.1 is a proposal, not an action.
- **No schema migrations run.** Kumiho's own labels/rel types were left as-is.

---

## 11. Open questions (do NOT invent answers)

| # | Question | Why it matters |
|---|---|---|
| **OQ-1** | **How does vidi reach Kumiho on V20 at `127.0.0.1:9190`?** | 9190 was not reachable from vidi when last checked; the server binds loopback (status doc E7). WSL/Ubuntu can't reach it; options in `KUMIHO_REVKA_STATUS_SUMMARY.md` §6 (rebind, SSH reverse tunnel, move CE). Until this is decided, **no job can write a capture at all.** |
| **OQ-2** | Does Revka exist as more than a binary, and does it **validate** payloads? | No Revka source on disk; its write path is inferred. The §6 envelope is our proposal to Revka, not a confirmed contract. |
| **OQ-3** | What is the semantics of Kumiho's existing `:IdempotencyKey` label (0 nodes)? | If Kumiho natively dedupes writes by an idempotency key, we should **pass Kumiho's key** rather than run our own `MERGE`-key scheme — our keys in §5 may be redundant. |
| **OQ-4** | Does Kumiho have a schema/migration system, and may third parties create labels/constraints? | `ProjectDeletionGuard`/`ProjectDeletionReceipt` suggest Kumiho manages schema internally. Creating our own constraints (or even labels) may be rejected or may corrupt its assumptions. |
| **OQ-5** | Exact shape of the `kumiho_memory_reflect(response, captures, source_krefs)` argument. | Determines whether §6 maps 1:1 onto `reflect`, or needs a bridge that emits raw Cypher. |
| **OQ-6** | Is `:Artifact` writable by us, and is it for files or for something else? | Affects whether decks/PDFs are `:Artifact` or `:Item:Artifact`. |
| **OQ-7** | Who curates the `:Concept` vocabulary? | Uncontrolled concept growth is the main way this graph becomes "noise". |
| **OQ-8** | Is `/CognitiveMemory/Research` the right space, or does it belong in a new Project? | Housing is a Kumiho-side decision; creating a space may itself be a Kumiho operation. |
| **OQ-9** | Where are the **12 Pack A captures / first-fill proposal**? | The referenced path `/workspace/vidiflow-stack-report/` **does not exist on this box** (no equivalent found under `/mnt/m/code` either). I could not mirror its conventions — if those 12 captures already imply a shape, this spec must be reconciled with them. |
| **OQ-10** | Embeddings are currently disabled/401 (`revision_embedding` ONLINE but empty). | Graph/edge provenance works without it, but **semantic recall of claims is degraded** until fixed (status doc GAP 1). |
| **OQ-11** | Does a Claim's canonical `text` live on `Revision` or on the `Item`? | I put `text` on `Revision` (so it embeds) and `summary` on the `Item`. Kumiho owns this split — confirm. |
