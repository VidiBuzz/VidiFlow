# Swarmia — Intelligence Report (2026-10-09)

**Provenance note up front:** the URL you captured is a Google Ads destination (gclid + 18 hsa_*/gad_* params). Its copy is PPC landing-page copy, and the logo strip on it is *not* the same logo strip used on Swarmia's own pricing and about pages — details in §3.

---

## 1. What the product actually is

**A.** Marketing story (Swarmia's own words): "the engineering intelligence platform… one place to see how their teams work, how they feel, and where the investment goes" [source: https://www.swarmia.com/product/]. Three framed pillars: business outcomes, developer productivity, developer experience [source: https://www.swarmia.com/about-us/].

**A.** Stripped down, it is a **delivery-analytics SaaS layered on git + issue tracker**, sold in four purchasable modules [source: https://www.swarmia.com/pricing/]:

| Module | What it actually does | Price/dev/mo |
|---|---|---|
| Productivity & AI impact | DORA + SPACE metrics, PR cycle time, throughput, batch size, review time, CI insights, investment balance, initiatives, work log, working agreements, benchmarks | $23 |
| AI adoption & cost | AI-tool licence inventory, active/idle seats, per-tool activity, token spend (beta) | bundled |
| Developer surveys | DX surveys, team-level heatmap, prioritised action plan | bundled |
| Software capitalization | Rule-based classification of issues → CapEx reports, FTE effort model | bundled |

Bundles: Standard $45, Enterprise $55 (+ on-prem integrations, HRIS, professional services). Free below 10 developers. Third-party corroboration of the module set and pricing: [https://sacra.com/c/swarmia/], [https://rywalker.com/research/swarmia], [https://jellyfish.co/library/tools-to-measure-ai-developer-productivity/].

**C.** My inference: the capitalization module is the strategic wedge. It is the only module that sells to a **different buyer** (finance/CFO) inside the same account, carries an audit story, and is expensive to replicate — which explains why the landing page leads with "data you can defend in a boardroom" rather than cycle time.

---

## 2. Product mechanics (how it works)

**Data pipeline.** OAuth-based ingest; a named integration list from the pricing page [source: https://www.swarmia.com/pricing/]: GitHub Cloud / Enterprise Cloud / Enterprise Server, GitLab Cloud / Server, Jira (cloud + on-premise), Linear, Shortcut, Azure Boards, GitHub Issues, Okta SSO, CI via GitHub Actions. Enterprise adds on-prem integrations and HRIS. **C.** Sacra describes the internals as normalising commits, PRs, deployments, CI runs, issue transitions and chat into a centralised graph store, near real-time, with engineering cost computed from fully-loaded cost per engineer [source: https://sacra.com/c/swarmia/] — third-party but not vendor-neutral.

**Effort model.** Capitalization is derived, not logged: issues are categorised manually or by filter rules, effort is attributed per-developer as a percentage of accumulated effort, and reports export monthly/yearly. Hard constraint: *only work linked to an issue can be capitalized* [source: https://help.swarmia.com/use-cases/capitalize-software-development-costs]. **A.** Swarmia claims the FTE-based effort model is "validated against traditional time tracking at 95% accuracy" and that capitalization reports are "SOC 1 audited and accepted by Big Four auditors" [source: https://github.com/marketplace/swarmia]. That 95% figure is marketing copy on a marketplace listing — treat as unverified.

**The action layer (underrated).** Metrics → behaviour is closed by three things: **working agreements** (team-set guardrails on WIP/PR size/review time), **Slack notifications** (PRs needing review, agreement violations, blocked work), and **signals** (pattern detection surfacing cycle-time spikes and review bottlenecks with suggested next actions) [source: https://www.swarmia.com/product/signals/]. Miro's named Head of Engineering Productivity calls the Slack notifications "the most loved Swarmia feature for our engineers" [source: https://www.swarmia.com/customers/miro/].

**API / machine surface.** Public REST API v1 at `app.swarmia.com/api/v1` exporting built-in and custom reports as JSON/CSV with an `entityQuery` scope [source: https://github.com/api-evangelist/swarmia]. Docs are GitBook, published with an `llms.txt` index, `.md` variants of every page, a literal "Agent Instructions" block, and a `?ask=` query endpoint so agents can interrogate the docs [source: https://help.swarmia.com/features/ai-tools/cloud-agents]. They also ship an **MCP server** exposing engineering data into your AI tools [source: https://www.swarmia.com/product/swarmia-ai/].

### ⚠️ The part most relevant to a fleet console

Swarmia has already built **agent-fleet observability**, and it's documented in detail:

- **Cloud agents view** — "Gain visibility into the pull requests created by AI agents running in the cloud. See how they perform across metrics like throughput, merge percentage, and batch size." It explicitly recognises autonomous agents: *"AI cloud agents can also be autonomous, in which case they will have a backlog or objective and continuously pick work items on their own."* Built-in detection for GitHub Copilot cloud agent, Codex cloud, Devin, CodeRabbit, plus Cubic / Gemini Code Assist / Graphite / Greptile / Macroscope / Qodo; anything else via manual custom-tool linking [source: https://help.swarmia.com/features/ai-tools/cloud-agents].
- **Fleet metrics:** Agent PR throughput (created / merged / closed), **merge percentage** framed as "your coding agent performance and how effectively people are able to use agents", **agent commit percentage** (end-to-end agent vs human finishing the job), and batch-size distribution across agent PRs [same source].
- **Review agents view** — which AI reviewers touched which PRs and how much code they cover; detected by matching comment author email/GitHub login patterns; zero-setup for the built-in list [source: https://help.swarmia.com/features/ai-tools/review-agents].
- **AI cost (beta)** — token usage from AI coding tools, broken down by team, person and work item [source: https://help.swarmia.com/features/ai-tools].
- **Attribution:** an agent-authored PR is **re-attributed to the human who initiated it**, with the agent surviving only as an avatar badge and an "cloud agent" tag [source: https://help.swarmia.com/features/ai-tools/cloud-agents].

**C.** Their CEO has published an agentic-org thesis that maps almost 1:1 onto fleet-console concerns — "The New Way: Building software in an agentic organization" (May 2026) specifies CI/CD + fast feedback loops, in-repo documentation, AGENTS.md and agent skills, agents auto-creating PRs (library updates, production exceptions), and review bots scoped to bugs/security/migrations/architecture [source: https://www.swarmia.com/blog/the-new-way-building-software/]. There is also a March 2026 post on "Five levels of AI coding agent autonomy." **This team is one sprint away from a fleet-telemetry product.** The Series A was explicitly earmarked for AI capabilities.

**Critical limitation for us:** every one of these is **passive observation inferred from git metadata**. They *see* agents. They do not *run, dispatch, throttle, route, or govern* them — no control plane, no fleet registry, no policy enforcement, no cost caps. And attribution is PR-level, not code-level: an independent research note confirms "attribution remains at the PR and survey level, not the code level" [source: https://rywalker.com/research/swarmia].

---

## 3. Customer verification (logo-by-logo)

Evidence classes: **(V)** vendor-authored (Swarmia's site/posts — marketing) · **(3P)** third-party independent · **(D)** derivative (Wikipedia, AI-generated directories citing vendor copy).

| Logo | Verdict | Evidence |
|---|---|---|
| **Miro** | **CONFIRMED** | Full case study, Walter de Bruijn (Head of Engineering Productivity), customer since 2024, 100+ teams, 25-person trial → 100 engineers organic spread, shared Slack channel with their CSM [V: https://www.swarmia.com/customers/miro/]. Co-promoted by LeadDev on LinkedIn [3P-ish: https://www.linkedin.com/posts/leaddev_miro-case-study-swarmia-activity-7258752931095543808-7N8E]. Named in FinSMEs funding coverage [3P: https://www.finsmes.com/2025/06/swarmia-raises-e10m-in-funding.html] |
| **Matillion** | **CONFIRMED** | Case study with the exact quoted person, Santosh Poonen, Senior Director of Engineering; customer since 2023; 140+ engineers across 20+ teams; quarterly leadership-operations reviews run through Swarmia [V: https://www.swarmia.com/customers/matillion/]. Matillion appears as a "featured customer" on Swarmia's LinkedIn product page. Named in FinSMEs [3P] and Wikipedia [D: https://en.wikipedia.org/wiki/Swarmia] |
| **TrueLayer** | **CONFIRMED** | Two named executives (Maryanna Rayko VP Eng, Dave Cumberland CTO), customer since 2023, hard numbers: 81% adoption in 3 months, cycle time −18%, time to first review −30%, 69% rated experience good/excellent [V: https://www.swarmia.com/customers/truelayer/]. Named in Swarmia's 2023 year-in-review [V] and Wikipedia [D] |
| **Parloa** | **CONFIRMED — strongest independent hit** | **Parloa's own job posting lists "Swarmia" in Parloa's tech stack** (Salesforce, Rocketlane, SAP, Jira, Databricks, Swarmia, n8n, Zapier) [3P: https://www.ziprecruiter.com/c/Parloa/Job/Operations-Manager,-Solution-Engineering-&-Services/-in-New-York,NY?jid=b3855459210f4a85]. Parloa did not publish this to market Swarmia |
| **Trustpilot** | **PLAUSIBLE** | Logo on about-us [V]; named independently by FinSMEs ("Docker, Webflow, Engine, Miro, Trustpilot, and Pleo") [3P] and Ry Walker Research [3P]. Wikipedia lists it [D]. **No case study, no named individual** |
| **Honeycomb** | **PLAUSIBLE** | Named in Swarmia's 2023 year-in-review blog ("onboarded hundreds of new customers… like Matillion, TrueLayer, and Honeycomb") [V]; appears in G2's Swarmia listing text [V-authored but G2-hosted: https://www.g2.com/categories/software-development-analytics-tools]; LinkedIn featured customers [V]; third-party startup-perk pages repeat it [3P-ish: https://www.founderpass.com/partners/swarmia, https://www.rockethub.com/perk/swarmia]. **No independent, non-derivative confirmation; no case study** |
| **Supabase** | **PLAUSIBLE** | Logo on pricing + about pages [V]; named in a Swarmia job posting ("Miro, Supabase, Honeycomb, and Lovable") [V: https://jobs.ashbyhq.com/swarmia/33064cb8-53ea-4014-add3-318884f3b837]. **No case study, no independent source.** ⚠️ Beware: an Alion scrape says "Added Supabase to stack Sep 2026" — that is Swarmia's *own* tech stack in job posts, **not** Supabase as a customer [source: https://alion.io/company/swarmia] |
| **Bolt** | **PLAUSIBLE** | Logo on about-us [V]; LinkedIn featured customers [V]; named in a Built In job post ("including Miro, Lovable, and Bolt") [V: https://builtin.com/job/customer-success-manager/10557267]; listed by Ry Walker and checkthat.ai [3P-ish/D]. **No case study, no named person, no independent source** |
| **Lovable** | **PLAUSIBLE** | Logo on about-us [V]; named in the Series A post ("from startups like Lovable and Superhuman") [V]; LinkedIn featured customers [V]; repeated in G2 category copy [V]; Ry Walker lists it as in production [3P-ish]. **No case study, no named person, no independent source** |
| **Aiven** | **UNVERIFIED** | Logo strip only [V: https://www.swarmia.com/about-us/] + LinkedIn "featured customers" (Swarmia-controlled content) + derivative AI-directory copy [D: checkthat.ai, promptloop.com]. **No case study, no named person, no press, nothing independent.** Note: Aiven's CEO Oskari Saarenmaa is listed as a Lifeline Ventures backer [3P: https://www.withrealm.com/about-us] — a channel, not a customer |
| **Cleo** | **UNVERIFIED** | Appears *only* in the LinkedIn product-page "Featured customers" logo list [V]. Nothing else anywhere. **No case study, no press, no aggregator even** |

**Corroborated customers that are NOT on the landing page** — worth knowing, because they're better-evidenced than several logos that are: Engine (Egan Royal, SVP Eng, 250+ engineers, since 2024) [V: /customers/engine/], Smartly (Frederic Calvez, since 2021), Productsup (Roland Fiala, since 2021, cycle time −69%), Learnship (Gero Keller, cycle time −20–25%), Gorgias (Alex Plugaru, who is also an angel investor), Hostaway, Factorial, AdCellerant, Axios HQ, Blinkist, PrescriberPoint, Choco, CDQ, Prima, SKUTOPIA, Staffbase, Yazio, Pleo, Superhuman, Webflow, Docker, Vercel, Outreach. Roughly 35+ logos; a Swarmia CSM job post describes a portfolio of "~180 customers, ~$1.3M ARR" for one person, implying several hundred paying accounts [V: https://builtin.com/job/customer-success-manager/10557267].

**C.** Skeptical read: the logo set is **curated per page, not a fixed verified list**. About-us shows Bolt/Aiven/Honeycomb/Trustpilot/Supabase/Miro/Lovable/TrueLayer (no Matillion, no Parloa, no Cleo). Pricing shows Miro/Bolt/Supabase/Matillion/Honeycomb/TrueLayer/Lovable/Parloa (no Aiven, no Cleo, no Trustpilot). Your PPC page shows yet another mix. The four best-evidenced names (Miro, Matillion, TrueLayer, Parloa) each have a named human and operational detail; the weakest (Aiven, Cleo) appear only as images.

---

## 4. Company facts

| Field | Value | Source / class |
|---|---|---|
| Legal entity | **Swarmia Oy**, Y-tunnus **3094736-9**, Osakeyhtiö (Finnish Ltd), main business line 62010 (software design/manufacture) | [3P-registry: https://www.asiakastieto.fi/yritykset/fi/swarmia-oy/30947369/yleiskuva], [https://www.taloustutka.fi/company/3094736-9] |
| Registered | Trade Register **29 Oct 2019**; VAT 22 Oct 2019; employer register 1 Nov 2019 | [3P-registry: asiakastieto.fi/rekisteritiedot] |
| HQ | **Lapinlahdenkatu 16, 00180 Helsinki, Finland**; registered postal PL 1188, 00101 Helsinki | [V: site footer], [3P: LinkedIn, ZoomInfo, registry] |
| US address | 169 Madison Ave, Suite 15682, New York, NY 10016 | [V: site footer] |
| Founded | **2019** (Oct); founder's LinkedIn: "Founder, CEO — October 2019 – Present" | [3P: https://www.linkedin.com/in/hilska] |
| Founder | **Otto Hilska**, Founder & CEO. Previously co-founded **Flowdock** (acquired by Rally Software → Broadcom) and was **CPO at Smartly.io** | [V: about-us], [3P: Wikipedia, Built In] |
| Second exec | **Mika Vakula** appears on the about-us leadership block; title not captured → **UNVERIFIED** | [V: https://www.swarmia.com/about-us/] |
| Funding — early | **~$8M / €8M combined pre-seed + seed, May 2021**, led by **Alven**, with Lifeline Ventures and senior execs from Stripe, PeopleDoc, Uber, Dropbox. Sacra splits it $6.3M seed + $1.7M pre-seed | [3P: https://alven.co/news/swarmia-raises-a-7m-seed-round-led-by-alven-only-12-months-after-its-inception], [https://sacra.com/c/swarmia/] |
| Funding — Series A | **$11M / €10M, announced 18 June 2025**. Led by **Karma Ventures + DIG Ventures**; participation from **Alven, Lifeline Ventures, Jigsaw VC**. Angels: **Cal Henderson** (co-founder & former CTO, Slack), **Romain Huët** (Head of Developer Experience, OpenAI), **Alex Plugaru** (co-founder & CTO, Gorgias) | [V: https://www.swarmia.com/blog/series-a-funding/], corroborated [3P: https://www.eu-startups.com/2025/06/finnish-saas-startup-swarmia-secures-e10-million-to-power-engineering-productivity/], [https://www.finsmes.com/2025/06/swarmia-raises-e10m-in-funding.html], [https://www.thesaasnews.com/news/swarmia-raises-11-million-in-series-a/] |
| Funding — total | **~$19–19.6M across 5 rounds** | [3P: Sacra], [3P: https://checkthat.ai/brands/swarmia] |
| Funding — undisclosed | A 2023 round "from Dig Ventures, joined by all of our existing investors" — **amount not disclosed** | [V: https://www.swarmia.com/blog/2023-in-review/] |
| Investor anomaly | about-us lists **Irena Goldenberg, General Partner, Highland Europe** as a backer — she is *not* in the Series A announcement. Either a later round or an advisory relationship → **UNVERIFIED** | [V: https://www.swarmia.com/about-us/] |
| Headcount | Company says "nearly 50 people" (Jun 2025) [V]. Registry-derived: **40 employees (FY2025)**, 30 (FY2024) [3P: asiakastieto.fi]. LinkedIn band 51–200. ContactOut 59. Sacra ~50 | mixed |
| Where it's really run from | **Helsinki is the operating HQ** — the CSM role is explicitly "hybrid role based at our Helsinki HQ or remote role in Dublin," reporting to a Head of CS in Dublin [3P: https://builtin.com/job/customer-success-manager/10557267]. The CEO relocated **Helsinki → New York in June 2024** to run North America [V: https://www.swarmia.com/blog/2024-in-review/]. Team spread: New York, Boston, Denver, Helsinki [V: about-us]. **C.** The NY address is a suite number typical of a virtual office; real decision-making looks Helsinki-centric with a US go-to-market satellite |

### Registry financials — the most decision-relevant hard data I found

**FY2025:** revenue **€4.20M (+63.4%)**, operating result **−€5.01M (−119.3% margin)**, net **−€5.0M**, **40 employees**, equity ratio **39%**.
**FY2024:** revenue €2.6M (+82.2%), operating loss −€3.4M (−120.5%), equity ratio **56%**.
**FY2023:** operating result −€3,397,896.
[3P-registry: https://www.asiakastieto.fi/yritykset/fi/swarmia-oy/30947369/yleiskuva, https://www.asiakastieto.fi/yritykset/fi/swarmia-oy/30947369/rating-alfa_EN, https://luottoriskit.fi/fi/yritykset/3094736-9/swarmia-oy/, https://www.taloustutka.fi/company/3094736-9]

**C.** Inference: they are burning roughly €1.20 for every €1.00 of revenue, equity ratio fell 17 points in a year, and they have ~$19.6M raised lifetime. Sacra independently estimates ~50 employees against ~$5M ARR [source: https://sacra.com/c/swarmia/] — which matches the registry figure almost exactly, so the revenue number is credible. **Runway is a live question.** That makes them a plausible consolidation target or an acquirer of small capability sets, and it pressures them to land the high-ACV enterprise/capitalization deals fast.

---

## 5. Independent signals (reviews, ratings, press, hiring)

**G2 — 4.4/5 from ~316 reviews** in Software Development Analytics Tools. Distribution: 63% 5★, 33% 4★, 2% 3★, 0% 1–2★. Sub-scores *vs. category average*: Ease of Admin 8.8 (avg 8.7) · Control 7.6 (avg 8.6) · Report Generation 7.5 (avg 8.5) · **Impact Predictions 6.8 (avg 8.5)** · Ease of Setup 8.9 vs Jellyfish 8.1. Flagged "AI Verified: at least 10 G2 reviewers confirmed using AI features."
[3P-G2: https://www.g2.com/products/swarmia/reviews?qs=pros-and-cons, https://www.g2.com/sellers/swarmia, https://www.g2.com/categories/software-development-analytics-tools, https://www.g2.com/products/swarmia/competitors/alternatives]

⚠️ **Method caveat:** the G2 review page returned HTTP 422 to the extractor and rendered empty in the browser. The figures above come from G2's own category, comparison and sellers pages via search snippets — G2-authored and consistent across four separate pages, but I did not verify them on the review page itself.

**Recurring cons from G2 reviewers (independent user voice):** integration issues (7 reviews); missing features / poor metric separation (7); UX and learning-curve friction (6 each); **"inaccurate analysis can be misleading, particularly regarding scope changes and false positives"** (5); limited customization (5); missing metric documentation; weak Jira integration; no PagerDuty-based MTTR; cycle time counts weekends. Independent analyst notes add: no code-level AI attribution, detection covers only three tools, no self-hosting [source: https://rywalker.com/research/swarmia].

**Competitor scores on G2 (for calibration):** Jellyfish 4.5/427, DX 4.6/321, LinearB 4.6/80, Swarmia 4.4/316. Best-fit summary from G2: "GitHub-native DORA metrics and investment visibility." [source: https://www.g2.com/products/swarmia/competitors/alternatives]

**Press / analyst coverage:** EU-Startups, FinSMEs, The SaaS News, technews180, Alven (investor), Sacra, Ry Walker Research, CheckThat.ai. Swarmia claims inclusion in **Gartner's first Market Guide for software engineering intelligence platforms** [V: 2024-in-review] and also claims Forrester inclusion [V: about-us] — **the Gartner part is unverified by me, the Forrester part is UNVERIFIED entirely.** G2 Leader badges: Fall 2023 on-site; Swarmia's LinkedIn claims Spring 2026 Grid leadership [V: https://www.linkedin.com/posts/swarmia_g2s-spring-2026-reports-are-out-thanks-activity-7440055233717768195-nekL].

**Hiring / distribution signals:** Ashby job board (Event Marketing Manager, NYC) and Built In listings active; roles open across Engineering, Sales, Customer Success [V: series-a post]. Listed on **GitHub Marketplace** for self-serve install [source: https://github.com/marketplace/swarmia]. Recruiting relationship with Talentbee for technical hires [3P: https://www.talentbee.io/case-study/swarmia].

---

## 6. Competitive read for our fleet console

**Threat level: adjacent, not head-on — but closer than most of the category.**

**Where they are genuinely strong (note these):**
1. **They shipped agent telemetry before most of the market.** Cloud agents + review agents + agent commit % + merge % + batch size + AI token cost, all documented and built. That is a real head start on *fleet observability*.
2. **The action loop.** Working agreements + Slack notifications + signals convert metrics into behaviour. Multiple independent reviewers specifically praise this over "dashboards nobody checks."
3. **The CFO wedge.** Capitalization with an FTE model, SOC 1 audit story, Big Four acceptance — a compliance-grade artifact that opens a second, higher-paying buyer. Hard to copy credibly.
4. **Agent-friendly by design.** MCP server, public REST API, `llms.txt`, `.md` docs, and a `?ask=` agent-query endpoint on the docs. They are positioning as a *data source agents consume* — which is an integration opportunity for us, not just competition.
5. **Transparent self-serve pricing** with a genuinely free tier under 10 devs — unusual in a category of sales-quoted deals, and a bottom-up land motion.

**Where the gaps are (our openings):**
1. **No control plane.** They observe agents from git metadata. There is no dispatch, orchestration, routing, throttling, policy enforcement, or cost capping. This is the whole distance between "fleet observability" and "fleet command console."
2. **Attribution is inverted for our purposes.** An agent-authored PR is deliberately re-attributed to the human initiator; the agent survives only as a badge. A fleet console wants **agent-level identity, accountability, and per-agent economics.** [source: https://help.swarmia.com/features/ai-tools/cloud-agents]
3. **Detection is a fixed allow-list.** Only Copilot cloud, Codex cloud, Devin, CodeRabbit, Cubic, Gemini Code Assist, Graphite, Greptile, Macroscope, Qodo — everything else needs manual custom linking. No auto-discovery, no fleet registry.
4. **No code-level resolution.** PR-level only; they cannot say what the AI actually wrote. Independent research confirms this [source: https://rywalker.com/research/swarmia].
5. **Cloud-only, no self-hosting** — flagged as their enterprise-expansion risk by Sacra, and their G2 "Control" (7.6) and "Impact Predictions" (6.8) sub-scores both sit *below* category average.
6. **GitHub/Jira-centric.** Weak on non-Git stacks, no incident/MTTR metrics, limited customization.
7. **Financially exposed.** −€5.0M operating loss on €4.2M revenue, equity ratio 56% → 39%. **C.** They need to convert fast into enterprise ACV, which means the capitalization + AI-impact story will intensify, and they are a credible acquisition target.

**C.** Bottom line: if we are building *observability*, they are a real, funded, well-reviewed competitor with a two-year head start. If we are building a *command console* — dispatch, orchestration, governance, agent-level economics — they currently occupy the passive-analytics layer and would be a plausible **integration/data source** rather than a substitute. Watch the CEO's agentic-org writing and the Series A AI roadmap; the distance from their current position to fleet tooling is one funded product cycle.

---

## 7. What we could NOT verify

- **Supabase, Bolt, Lovable, Honeycomb** — no non-vendor-authored confirmation of any kind; no case studies, no named individuals, no press. All PLAUSIBLE on the strength of Swarmia's own site and job posts.
- **Aiven, Cleo** — no evidence beyond Swarmia-controlled logo displays and derivative AI-directory copy. **UNVERIFIED as customers.**
- **Currency of any logo claim** — every "customer since" date is vendor-stated; no customer-confirmed current status found for any of the 11 landing-page logos.
- **SOC 1 audit / SOC 2 Type 2 status** — vendor claim only; no trust-center report retrieved. The "95% accuracy validated against time tracking" figure is marketing copy on the GitHub Marketplace listing.
- **Gartner Market Guide inclusion** — vendor claim, not independently confirmed. **Forrester inclusion — entirely UNVERIFIED.**
- **G2 exact figures** — G2 review page did not render (HTTP 422 / empty DOM); numbers come from G2-authored category and comparison pages via search snippets. Wikipedia also failed to render (http_error); its facts come from search snippets.
- **Current headcount** — sources span 30 (FY2024 registry), 40 (FY2025 registry), ~50 (company, Jun 2025), 51–200 (LinkedIn band), 59 (ContactOut). I would use **~40–50**.
- **Mika Vakula's role/title**; **Irena Goldenberg / Highland Europe's exact relationship**; **the size of the 2023 DIG Ventures round**.
- **Whether the NY office is an operating office or a registered-agent address** — the suite number suggests the latter, but I could not confirm.
- **Actual discounting and realised ACV** below published list prices; **revenue mix by geography**; **customer churn**.

No files were created or modified — all findings are from live web sources, cited inline above.