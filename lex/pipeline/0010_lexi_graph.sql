-- 0010_lexi_graph.sql — LEX sense/edge graph layer (OpenGloss v1.1 ETL target)
-- Plan: plans/1789683586713-lex-opengloss-etl-graph-plan.md §3 (corrections §2b)
-- Apply (box 192.168.4.40, needs sudo):
--   sudo -u postgres psql -d vidismart -f /mnt/m/code/vidismart/lexi-pipeline/0010_lexi_graph.sql
-- Depends: 0009_lexi_terms.sql (lexi_terms), pg_trgm (already installed).

BEGIN;

-- ---------------------------------------------------------------------------
-- lexi_senses: sense-level nodes, one row per OpenGloss word+pos+sense.
-- Polysemes stay split (plan §2). source_id = OpenGloss id, e.g. 'api_noun_0'.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lexi_senses (
    id                  integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id           text    NOT NULL UNIQUE,
    word                text    NOT NULL,
    pos                 text    NOT NULL,
    sense_index         integer NOT NULL,
    definition          text    NOT NULL DEFAULT '',
    synonyms            jsonb   NOT NULL DEFAULT '[]'::jsonb,
    antonyms            jsonb   NOT NULL DEFAULT '[]'::jsonb,
    hypernyms           jsonb   NOT NULL DEFAULT '[]'::jsonb,
    hyponyms            jsonb   NOT NULL DEFAULT '[]'::jsonb,
    collocations        jsonb   NOT NULL DEFAULT '[]'::jsonb,
    derivations         jsonb   NOT NULL DEFAULT '{}'::jsonb,
    examples            jsonb   NOT NULL DEFAULT '[]'::jsonb,
    -- first domain:* tag of the sense (plan §2b). NOT sense_edges[].metadata.domain,
    -- which carries pedagogical levels ('general academic', 'K-8 general education', ...).
    domain              text,
    reading_level       text,
    wiki_frequency      integer,
    wiki_frequency_rank integer,
    -- Soft link to curated lexi_terms.acr. No FK: lexi_terms uniqueness is (acr, source),
    -- so acr alone cannot be an FK target.
    term_acr            text,
    source              text    NOT NULL DEFAULT 'opengloss-v1.1',
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lexi_senses_word       ON lexi_senses (word);
CREATE INDEX IF NOT EXISTS idx_lexi_senses_word_lower ON lexi_senses (lower(word));
CREATE INDEX IF NOT EXISTS idx_lexi_senses_term_acr   ON lexi_senses (term_acr);
CREATE INDEX IF NOT EXISTS idx_lexi_senses_word_trgm  ON lexi_senses USING gin (word gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- lexi_edges: typed graph edges, directional as extracted; frontend renders
-- undirected (plan §3). relationship_type normalized to 7 values (§2b):
-- derivation_* collapsed to 'derivation', inflection kept, other 5 pass through.
-- Self-loops (lower(source)=lower(target)) are dropped at ETL time.
-- domain = the sense's primary domain:* tag.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lexi_edges (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_word       text NOT NULL,
    target_word       text NOT NULL,
    relationship_type text NOT NULL CHECK (relationship_type IN
        ('synonym','antonym','hypernym','hyponym','collocation','derivation','inflection')),
    sense_id          integer NOT NULL REFERENCES lexi_senses(id) ON DELETE CASCADE,
    domain            text,
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lexi_edges_source_word ON lexi_edges (source_word);
CREATE INDEX IF NOT EXISTS idx_lexi_edges_target_word ON lexi_edges (target_word);
CREATE INDEX IF NOT EXISTS idx_lexi_edges_rel_type    ON lexi_edges (relationship_type);

-- A pair recurs across types within one sense (e.g. adp->nucleotide is both
-- synonym and hypernym), so the pair alone is not unique (§3).
CREATE UNIQUE INDEX IF NOT EXISTS uq_lexi_edges
    ON lexi_edges (sense_id, lower(source_word), lower(target_word), relationship_type);

-- Match 0009 ownership when the role exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vidismart') THEN
        ALTER TABLE lexi_senses OWNER TO vidismart;
        ALTER TABLE lexi_edges  OWNER TO vidismart;
    END IF;
END $$;

-- Public read / Directus exposure deliberately deferred (plan §3): tonight's
-- app is static-first (vidiflow/public/lex/*.json); wire published-only
-- policies when Directus serves these tables.

COMMIT;
