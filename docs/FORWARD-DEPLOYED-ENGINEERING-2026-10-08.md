# Forward Deployed Engineering — Master Class Notes

**Document ID:** FORWARD-DEPLOYED-ENGINEERING-2026-10-08
**Compiled:** 2026-10-08
**Companion transcript:** `M:\code\VidiFlow\docs\transcripts\FDE-MASTERCLASS-transcript-2026-10-08.txt`

---

## 1. Source

- **URL:** https://youtu.be/1a5HxU52vCQ
- **Length:** ~53:57 (last timestamped segment 53:57).
- **Host:** Greg (named by the guest twice: "Greg, how are you using voice AI…" 01:5x; "…you talked about this a week or two ago" 05:0x). The podcast itself is never named in the transcript.
- **Guest:** rendered **"Boss"** once at the top (00:32: "I brought on Boss from Veric Agents") and **"Voss"** everywhere else (01:19, 03:58, 31:28, 52:18). This is an auto-transcript inconsistency, not two people. Best reading: **Voss**.
- **Guest's company:** rendered **"Veric Agents"** (00:32) and **"Veric"** (39:15: "the philosophy that we follow here at Veric"). **FLAG:** auto-transcription; exact spelling (Veric / Verick / Varick) not confirmable from the transcript. No web verification was performed for this deliverable.
- **The video's own framing (host, ~00:00–01:20):** the episode is pitched as *"a master class for how to become a Forward Deployed Engineer."* Explicit promises: by the end you will (a) understand **how to find the work worth automating**, (b) be able to **decide where agents belong**, (c) understand **open-source versus closed source**, and (d) understand **"where Muse, Grokbot, and Dots fit in all of this."** Greg states these are "examples from client engagements with the details changed that you just don't get to see publicly. This is for the first time ever on the internet," and that a prior episode with Voss was kept high-level — this one goes deep.

**Sponsorship (excluded from the substantive summary):** ~01:15–03:40 is a paid **Google** segment (host says "this section is sponsored by Google") promoting **Gemini 3.8 Live** (voice/phone-call assistant, "chief of staff"), **Gemini 3.5 Transcribe** (voice-note cleanup), **Gemini 3.8 Flash text-to-speech** (custom voices, e.g. a Brooklyn accent), and **Gemini 3.5 Live Translate** (real-time translation). Note it as an ad read; **none of the sponsor claims are part of Voss's method.**

**Transcription quality flags (do not treat as fact):**
- The auto-transcript renders Voss's "forward deployed engineer"/"FDE" as **"FTE"** in many places (e.g. "your job as an FTE", "best FTE", "top FTEES"). Read these as **FDE**.
- "foreploy", "Ford deployed engineer", "for deployed engineer", "FTEES" = **forward deployed engineer(s)**.
- "Netswuite" / "net suites" = **NetSuite**.
- **"deote"** (14:41: "engagement with deote that mapped this out for them") — a consultancy name the transcript garbles; **unverified**, could not be confirmed.
- "Muse or any of his stuff" (21:31) is garbled; context is ambiguous (possibly a real product/brand Voss follows). Flagged.
- "Codecs" (37:0x, "behind that is codecs") likely = **Codex**; "claw code"/"Claude Code" appears elsewhere.
- "Opus, you know, 4.8 aid" (37:14) — garbled model name/version; best reading is an Opus-family model, exact version **unconfirmed**.
- "Fable or Astra" (37:06) — frontier model names as rendered; **unconfirmed**, likely garbled.
- "GLM, Kimmy, Quinn" (38:03) = **GLM, Kimi, Qwen**.
- "Josh Kushner, General Catalyst" (07:25) and "Thrive holdings" (07:24) render cleanly.
- "grock" (37:5x) = **Grok**.
- "post AAI world" (18:24) = **post-AGI world**.
- "Sa Paulo" = **São Paulo**; "Bangalore / Australia / Sydney" and "Chicago / Toronto" appear as the multi-region example.
- "gamecher" (30:56) = likely **"game-changer"**.

---

## 2. Summary

The episode is a master class on **Forward Deployed Engineering (FDE)** — the work of planting engineers inside companies to change how the work is actually done, not to "apply AI." Voss opens with the private-equity roll-up thesis: buy a people-heavy firm (accounting, IT services, law), embed FDEs, rebuild its processes with agents from the ground up, and let the margin lift translate into the company's multiple. He cites **Thrive with 35 engineers across 70 firms** and outcomes like **tax returns 30% faster at 98% accuracy**.

The central claim is **"Don't apply AI."** AI is not a coat of paint; it is **process re-engineering**. Voss's method has five stages — **process mapping → re-engineering → building → deploying → rolling out** — and a **day-zero discovery routine with three sources**: human interviews (information lives in people's heads), process mining over the systems of record, and existing documentation. He stresses there is no clean "second brain" to plug into — you must build it, per department and cross-department.

He walks through concrete engagements with details changed: a **$5B public software company** whose "6-step" quote process was really **20 steps with 7 loops** (61% of requests loop back); a **5-portfolio-company NetSuite finance program** with wildly different step counts; and an **AP workflow** where mapping took **~2–3 weeks** and yielded 17 steps → 7, cycle time 24 days → 6, exception loops 6 → 1, invoice **straight-through rate 18% → 87%**, and **cost per invoice $31 → $6 (80% reduction)**. A **60-person, $12M-revenue accounting firm** illustrates the SMB entry point. The recurring rule: **sort every step into four buckets — delete, plain code, agentic, human-in-the-loop** — and **build agents inside the client's systems of record**, never asking them to switch.

On models, Voss argues most work does **not** need a frontier model; benchmark every workflow against every model, and don't silo yourself into ChatGPT/Claude — use non-frontier, open-source (Muse, GLM, Kimi, Qwen), and Grok. Enterprise has an irrational aversion to Chinese models. On personal agents (Muse, Grokbot, Instinct, OpenAI's Dots), he sees a **governance gap** and distinguishes **sidekick agents** (you chat with them) from **background agents** (they just do the work and ping you) — the latter being worth 70–80% throughput gain vs 10–20% for sidekicks. He defines the FDE as **"three people in one"** (understand the work, ship production code, own the AI layer — plus communicate to executives), the "NBA player" top-0.1% who can command **~10% of the value delivered** or PE carry. He closes with a **Monday–Friday personal action plan** and the operating playbook: find the real process, baseline KPIs, pick processes with owners, sort every step, **build once and deploy everywhere**, measure constantly, and prove it back at 3 and 6 months.

---

## 3. Key notes (by theme)

### 3.1 The thesis — "Don't apply AI"
- **"Don't apply AI"** is the title of an article Voss published (referenced 05:07 and 53:46). The play on "applied AI" is deliberate: AI is **not something that can be applied like a coat of paint**; it **involves process re-engineering** (05:18).
- Quotable, verbatim:
  - **"AI isn't something that can be applied like a coat of paint. It's something that really involves process re-engineering."** (05:0x–05:18)
  - **"Don't apply AI"** (50:38) — his one-line takeaway.
- **Why most AI pilots fail (50:44–50:57):** "they try to slap AI on the business and it's very handwavy" — e.g. rolling out a Copilot/Claude Code license to everyone, or "building an agent that doesn't really understand the workflow." It doesn't work.

### 3.2 The PE roll-up context (why FDEs exist)
- **"Rolloffs" (roll-ups) are a huge part of the private-equity playbook** (05:32): buy a firm that runs on people, outdated processes, and outdated software (accounting firms, IT shops, law practices), then put AI/forward-deployed engineers inside.
- FDE job in a roll-up (06:02): **find the processes, map the systems of record, map the exceptions and handoffs between teams, then rebuild the process with agents from the ground up.**
- **Thrive** ("with Josh Kushner, General Catalyst"): **35 engineers across 70 firms** (06:15–06:18).
- Outcome data point: **tax returns 30% faster at 98% accuracy** (06:31). Caveat: "it's a lot more involved than people had maybe initially surmised."
- **Margin → valuation math** (06:48–07:14): a call-center firm with **gross margin at 60%**; if a PE firm buys at **$1B** and doubles margin, it can **sell for $2B / $4B / $8B**. "Buy it for a billion, implement AI across 3–6–12–24 months, sell it for 2/4/8 billion."

### 3.3 The problem: systems are far messier than they look
- Personal-scale analogy (08:0x–09:0x): you already juggle **five inboxes, four file stores** (Google Drive, Notion, iCloud, desktop) and **five messaging apps** (iMessage, WhatsApp, Slack, Google Calendar, Outlook) — and *you* can't cleanly describe how you use them.
- Company-scale example (09:0x–09:25): a company that **acquired 8 others**, operating in **5 regions (São Paulo, Bangalore, Australia, Sydney)** with **23 different systems of record** — **Chicago on SAP + Salesforce + Workday, Toronto on NetSuite + HubSpot + ADP**, etc. Each region works differently.
- Punchline (09:3x, paraphrased as bleeped): applying AI over that whole company just makes a mess **faster**.
- **"If you go into a company thinking they'll have an Obsidian second brain hooked up to AI agents, you are just mistaken."** (11:08–11:12) — **"There is no second brain happening here."** (11:22) "It's kind of on you to create that, and it's per department and cross department and it's very very involved." (11:34)
- **"People are so annoyed at 'AI is going to fix everything, just use AI,' because they know it's actually quite complicated."** (paraphrase, 08:3x–09:0x).

### 3.4 The method — five stages
**Process mapping → re-engineering → building → deploying → rolling it out** (10:03–10:05).

### 3.5 Day-zero discovery: three sources ("the whole company's picture")
1. **Human interviews** (10:18): start with one department (in finance: heads of AP, AR, reconciliations, billing, banking, FP&A), work down. Rationale: **a lot of information lives in people's heads** — "very rarely do you have a clean document source you can point your agent at." Common: "this person's been at the firm for 20 years and just handles it." Applies to Fortune 50s and SMBs alike.
2. **Process mining over the systems of record** (12:25): with real-time Salesforce access over **3–4 weeks** you learn what data enters, how often it's corrected, etc. Use AI to analyze the hidden meaning of each action → build a **graph** of "once something of a certain category enters, A goes to X, B goes to Y, C goes to Z." "Without the interviews you're missing half the picture."
3. **Existing documentation** (13:0x): SharePoint, Drive, Notion, Slack, Teams, Gmail, spreadsheets — sometimes outdated, sometimes good.
- **The split varies by company:** large firms have 10 years of Salesforce history; SMBs may have almost everything in people's heads and no documented process. "It's up to you to determine what angle to take per company."
- Two diagnostic questions (12:04–12:16): **"Which step is theater? Which step is legitimate?"**, and "what happens when exceptions take place, how often do exceptions take place?"
- Host's framing (11:45): step one is "creating like a **human API**" — getting data, systems, and SOPs into modern digital systems. Voss agrees: "**that's what it is**" (12:04).

### 3.6 Concrete engagement #1 — $5B public software company (sales/quote process)
- **Company:** $5B revenue, **150+ products**, many solution consultants, **public** (so regulation applies); brought in by the **CRO**. Team of **four deployed engineers** (14:2x–15:35).
- **The documented process looked like:** build quote → submit → deal desk → approve → send → negotiate → sign. "Very cut and dry."
- **The actual process (via process-mining agents over their CRM, believed to be Salesforce):** **20 steps with 7 different loops**; **61% of requests follow the loop** back to step 1; **legal sends it back 12% of the time**; **30% of the time a new quote has to repeat approval**.
- Stakeholder reaction: "the CRO and CFOs are telling us… I feel like you understand our department better than we do."
- Each of the 20 steps sorted into the four buckets (see 3.7).

### 3.7 The four buckets (the core sorting rule)
Every step goes into exactly one of four buckets (18:1x–19:04):
1. **Delete the step** — "it shouldn't exist in a post-AGI world."
2. **Plain code** — rules, no judgment: a simple API call, "if this happens, then this happens"; variance handled as a **switch case** ("if x then y, if z then a").
3. **Agentic** — enough historical data *and* judgment required. Example: a line item showing **monitors** is very likely office supplies, **but** there's an exception when it's from a certain vendor. 5 of the 20 steps were agentic in the software-company example.
4. **Human-in-the-loop** — the riskiest tasks you "cannot afford to get wrong": **approval, negotiation, signing, submitting payment**. Humans handle these.

### 3.8 Deploy *inside* the systems of record — no new surface
- **"A lot of people think of AI agents as a new surface, and we take the opposite approach."** (19:09–19:16) **"Pitch yourself as building these agents inside their systems of record."** (19:23)
- Concrete: **agents that mine your Salesforce and take action in your Salesforce** — no new UI to learn.
- **Why (19:48–20:05):** customers have spent "several years and several million dollars — I think $10 million one time — migrating from one ERP to the next," same for CRM. "If your pitch for AI is 'we're going to move you from Salesforce to this AI-native CRM,' **you've lost them**." Exception: in SMB where there is no CRM, you can introduce one.
- **Human-in-the-loop surface = a Slack message** (20:16) — you work inside their records and **don't have to retrain staff**; faster adoption, higher utilization.
- **"Path of least resistance"** (20:42, echoed 21:25): the host's framing for why you never ask a client to switch software and learn new agentic concepts they've never heard of.

### 3.9 Concrete engagement #2 — PE firm with 26 portfolio companies
- **The scaling problem (21:57–22:15):** 26 companies × ~10 departments × ~10 workflows each ⇒ **"you'll need to deploy 50,000 forward deployed engineers across 3 years just to make a dent."** Impossible done one-by-one.
- **The recommended solution — group portfolio companies by system of record** (22:20): e.g. tackle finance for all 26; group the **5 on NetSuite** and the **4 on Dynamics**. Then "you only have to tackle similarities" and you streamline through **one entry point: a system of record.**
- **FDE's job per software:** understand what each platform **already offers and doesn't** (NetSuite, Dynamics…), then fill the gaps and **make it talk to the rest of the stack** — e.g. Ramp, Brex ("bre"), Tipalti ("tipi"), BlackLine, Concur, Expensify on the finance side; Salesforce vs HubSpot on the sales side.
- **Political benefit:** you work with **CFOs — the same buyer — over and over**, which simplifies politics. (Notable: CFO, not CTO, is often the sponsor; CIOs also bring them in.)

### 3.10 Selling to the buyer — three value buckets and "sell the outcome"
- **Three value buckets (25:06):** **cost savings**, **revenue uplift**, **risk mitigation.**
- **CFOs:** cost-cutting first, but also **time-to-close.** They've heard "**22 days**, 4 weeks, 6 weeks" for close — "that's over a month… it's called month-end close, what are we talking about here?" Bringing it to **4 or 8 days at higher accuracy, same cost** resonates. (25:23–25:34)
- **CHRO / chief people officer:** different pitch — "you can hire better people faster and train them quicker on day one. **It's not about the cost** — they want way better output."
- **"Sell to who you're speaking to"** (26:43) and **"Sell the outcome."** (26:48)
- **Show estimated agent cost per month — it's "shockingly low" relative to humans** — plus accuracy and KPI tables ("any C-suite loves that"). Then **hold yourself to that standard**: come back in 6 months and prove it.

### 3.11 Re-engineering ≠ layoffs (the reallocation argument)
- The clients are often **Fortune 1000/500** who "want to win, want to grow."
- **"It's reallocation of resources, not mass layoffs."** (32:10) They want their **best finance people off manual invoice routing** and onto higher-leverage work (FP&A, cross-functional moves, building their own FDE teams).
- Host's reframe: if cost/invoice drops $31 → $6, the company has **more margin** — it may take some, but may **give some back to customers** and **use margin to hire.** (31:25–31:45)

### 3.12 Concrete engagement #3 — five NetSuite portfolio companies
- Five portfolio companies **all on NetSuite** but with **very different** AP processes: **12, 9, 15, 18, 13 steps**, plus regional variances at each company. (27:10–27:17)
- The "ideal" re-engineered future: **~six steps with agents in certain locations.** Voss cautions this is "obviously a dramatization" — you rarely get perfectly clean, but "you'll actually come quite close" with deep stakeholder mapping and thoughtful re-engineering.
- **Value to the PE firm:** not just per-CFO — the PE firm sees everything mapped and streamlined and starts asking **"what's the playbook?"** for the next acquisition: what process to follow, what software to adopt. Mapping becomes a **repeatable playbook**.

### 3.13 The AP exposure (headline numbers)
Real, anonymized process map uncovered over **~2–3 weeks** with interviews + process mining (28:5x–29:0x). "A less complicated workflow"; they've "seen workflows that are **40 steps or 200 steps**."
- **17 → 7 process steps**
- **Cycle time 24 days → 6**
- **Exception loops 6 → 1**
- **Straight-through rate of an invoice: 18% → 87%** ("a game-changer — a majority of their invoices were going through exception routes")
- **Cost to handle one invoice: $31 → $6 (80% reduction)**
- Note: "That's a **process re-engineering** flow, by the way — that's not even all about agents." (31:07)
- **The FDE's dual job on mapping (34:01):** map it *and* **educate the client on the cost of the status quo** — "if 35% of the time you have to do this loop, what does that cost — not just in money, but in **cycle time**?"

### 3.14 The cycle-time law (Michael Hammer)
- Referencing **Michael Hammer** (34:27): if you have 20 steps and speed up each step, you may not make the process faster — **"it's the cycle time between steps that makes all the difference."** That's where the 20 days hide. **"That was 30 years ago that he said this… we're seeing the same thing today."**

### 3.15 Concrete engagement #4 — the SMB entry point (60-person accounting firm)
- **Not one of Voss's clients** — someone else in the industry he spoke with: **$12M revenue, 400 clients, four systems.** (32:55–33:0x)
- Hard because **every client sends books differently** — "some invoices were sent as a picture of someone scribbling in a notebook." That's when he knew "you can't just apply AI — you have to get in there and do it deeply."
- **Claimed 6 steps; reality 14**, with many loops: **collections re-asked 70% of the time**; a **partner sends it back 35% of the time** (step 4).
- Guidance: **if it's your first FDE project, start with the SMB side.**

### 3.16 Models — frontier vs open source vs Chinese
- **Most companies are on Microsoft Copilot**; "behind them is Claude Code, behind that is [Codex]." For an SMB, much of what you want can start in **skill files**. (36:30–36:45)
- **"The big labs don't want you to know this, but most of what you're looking to achieve does not need to be leveraging a frontier model."** (37:00–37:06) "There's very few cases where we've seen the need to deploy **Fable or Astra**."
- That said, they *do* use the labs' **non-frontier** models: "Opus… or Sonnet more likely," "GPT with lower thinking."
- **Open source:** "We've leveraged open source models like **Muse**, and sometimes **Chinese models where we're allowed to**, and **Grok** has been a great model we've used." (37:45–37:53)
- **Enterprise aversion to Chinese models is irrational** ("they're floating-point numbers, not actually how that works") but real, even for AI-native buyers. "Sauce for the viewers."
- **"Don't feel the need to silo yourself into just ChatGPT/Claude frontier models."** (37:55) Use their non-frontier models, Grok, Muse, **GLM, Kimi, Qwen**. "All these different things are toolkits."
- **The rule:** **"benchmark every single workflow against every single model to determine the right model for your use case."** (38:0x)

### 3.17 Personal agents — Muse, Grokbot, Instinct, Dots
- Voss's framing (38:21–39:15): personal-agent platforms are getting big — **Grokbot**, **Muse** (which just announced **"Muse for small business"**), **Instinct** (consumer side), and (Greg adds) **OpenAI "with Dots" yesterday**.
- **FLAG:** the transcript also lists **Muse as an open-source model** they've leveraged (37:45) *and* as a personal-agent platform (38:26) — internally inconsistent. Treat "Muse" here as ambiguous between a model and an agent platform.
- **Two streams of agents (39:20–39:35):**
  1. **Sidekick agents** — the co-pilot you chat with; **Instinct, Dots, Grokbot, Muse are extensions of that** (you must chat with them).
  2. **Background agents** — "truly do work in the background, don't bother you, do the same thing, and ping you when they need to. They know what they have to do already." This is *why* process mapping matters.
- **The governance gap (38:55–40:03):** "it's hard to see governance for those personal agents in the enterprise use case." He *can* see the streams connecting someday ("use a Muse or a Grokbot to set up these background agents") — **"but that governance isn't there yet… there's still a massive gap in how involved you have to be from a software-engineering perspective."**
- **ROI distinction (40:13–40:25):** "We would rather **take work off their plate** rather than make them move faster, because that's the difference in ROI." Sidekick = **10–20% faster output**; background agents = **70–80% faster output with higher accuracy**.

### 3.18 The FDE profile — "three people in one"
- **"You need to be three people in one."** (40:33)
  1. **Understand how the work actually gets done** — study the systems of record (Salesforce, NetSuite, Dynamics): what they offer and don't; learn how (e.g.) accounts payable should function.
  2. **Ship production code** — agents that call into systems of record **with auditability, governance, and security in place**. Not necessarily a CS degree or 10 years of SWE — but real engineering.
  3. **The AI layer** — know which model for which job, what you can and can't trust a model with, **how to test each model via eval**, **optimize your harness**, and **handle bad actions (rollbacks on hallucination)**.
- **Plus communication:** "being able to speak to senior leadership and convince them this is the right way to go." (42:11)
- **Rarity/pay:** "this is very rare — usually you have one or two of these, or you're mediocre at all three." The complete FDE is **"your NBA player… top 0.1%."** Voss openly recruits: **"if you are this person, we really need to talk. We want to hire you."** (42:15)
- **Compensation model (44:30–45:20):**
  - Advice from a founder with several multi-billion exits: **"the best job to find is the one closest to the money"** — the one that can show revenue/profit optimization.
  - **"You gave $10 million of value to this company — could I pay you 10% of that? A million dollars?"** — "that might be a trade… in a heartbeat you'd pay them 10% of what they can deliver for you."
  - **PE firms are hiring FDEs and giving them percent ownership in the carry:** "they bought it for a billion, hope to sell for 5 billion, and you'll get **0.5% of whatever that delta is**."

### 3.19 Action plan — get started from nothing (Mon–Fri)
(45:41–47:2x)
- **Monday — inventory:** "List every single app that holds your stuff" (his: five inboxes, three comms channels). Write **which one wins, which one disagrees, how to route** — **do a process map of your own life.**
- **(Tue/next) — pick 20 things you did last week:** you paid a bill, **cancelled a subscription** (a big real use case he sees on **Instinct and Muse**). His own example: "I got to do that with Adobe — Adobe, if you're listening, [you] charge me 40 bucks a month for two years."
- **Wednesday — write one process down step by step:** e.g. how you pay a bill end-to-end, or how a freelancer submits an invoice. Be detailed: "there are five different ways of doing it, ten different exceptions."
- **Thursday — sort every step into the four buckets:** what gets deleted, what's deterministic, what's agentic, **what you still need to be there for.**
- **Friday — reach out:** warm intros or **cold outbound** to SMBs; **offer one single workflow**, super simple, end-to-end, "do the skill files, do the personal assistant (Instinct/Muse/Grokbot/Dots, whatever), build the agents, give them a timeline."
- **Price ladder:** **"Do it for free if you have to, if you're getting started"** — the experience is worth more; "your next one you can charge that **five figures, that six figures**."

### 3.20 Hardware / on-prem
- Asked whether enterprises want on-prem GPUs for sensitive data: **"truthfully we've seen zero of that."** (47:5x–48:0x) Some companies rent/sell GPU clusters to heavily regulated firms, but even for banks, financial services, healthcare, pharma — "I don't think they're there yet. Maybe eventually."

### 3.21 Governance tail — OpenAI "private intelligence," ZDR
- Greg describes (48:4x) **OpenAI's "private intelligence"** (launched at Dev Day): **zero data retention** with private safety processing for automated safety reviews — no OpenAI personnel access to underlying content. Responds to "I want to use these models but do I really want to give the keys to OpenAI?"
- Voss: they **route through Azure Foundry, AWS Bedrock, Google Vertex**, which have agreed **not to train / ZDR (zero data retention)**. (49:38–49:47) He expects data-governance friction to grow.

### 3.22 The FDE operating playbook (closing statement)
(50:38–51:47)
- **"Don't apply AI."**
- **The steps:** find the **real** process; **measure the time baseline and all KPIs**; **pick processes with owners**; **sort every step** (four buckets); **baseline before you build**; **build it once and deploy it everywhere**; **measure it constantly.**
- **Cadence:** a **four-week audit** (understand systems, build the process maps) → **next four weeks** build the agents → **at 3 months and 6 months**, prove "this is what it used to be, this is what it is now." **"It's not just 'we built AI, we deployed it, we're done' — that's the job of an FDE: doing everything end to end."**
- Also happens for **internal teams:** "how do we make our own FDEs internally? Have them follow the same playbook."

### 3.23 Disclaimer (host, 52:00)
Greg explicitly states he is **not involved** in Voss's company and gets no kickback — "Voss hasn't bought me a beer." He brought him on because "he's world class at this… not afraid of sharing the sauce."

---

## 4. Glossary of terms

- **Forward Deployed Engineer (FDE)** — the transcript's rendering is often "FTE"; the role of an engineer embedded inside a company who maps real processes, re-engineers them, and builds/deploys agents **inside the client's systems of record**, end to end.
- **Don't apply AI** — Voss's thesis/article title: AI can't be bolted onto a business like a coat of paint; it requires **process re-engineering**.
- **Roll-up / "rolloff"** — PE strategy of buying people-heavy firms and lifting margin through AI transformation; where FDE demand originates.
- **Process mapping** — discovering and drawing the *actual* process (interviews + process mining + docs), versus the tidy documented version.
- **Process mining (agents)** — agents that observe live systems of record over 2–4 weeks to infer the real process and its hidden graph (what enters → where it routes).
- **Human API** — host's term (endorsed by Voss) for step one: extracting the undocumented knowledge/OPS in people's heads into digital systems and SOPs.
- **Systems of record** — the enterprise platforms of truth (Salesforce, NetSuite, Dynamics, Workday, SAP, HubSpot) that agents should live inside.
- **New surface (anti-pattern)** — introducing a new UI/tool for agents; the transcript's approach is the opposite: agents operate inside existing systems, with humans via **Slack messages**.
- **Four buckets** — the sorting rule for every step: **delete / plain code / agentic / human-in-the-loop**.
- **Plain code (deterministic)** — if-x-then-y rules with no judgment; variance handled as a switch case.
- **Agentic step** — a step needing judgment *and* enough historical data to act (e.g. classifying an invoice line item).
- **Human-in-the-loop** — risky steps (approval, negotiation, signing, sending payment) that keep a human decision-maker.
- **Exception loop** — the % of requests that bounce back to an earlier step; a key process-health metric.
- **Straight-through rate** — % of transactions processed without exception/human rework (e.g. invoice 18% → 87%).
- **Cycle time** — elapsed time a process/workflow takes; Hammer's law says inter-step wait dominates over per-step speed.
- **Michael Hammer** — re-engineering researcher cited for the cycle-time lesson ("30 years ago… same thing today").
- **Sidekick agent** — co-pilot you chat with; Muse, Grokbot, Instinct, Dots are described as extensions of this.
- **Background agent** — agent that does work unattended and pings you only when needed; the higher-ROI stream (70–80% faster vs 10–20%).
- **Muse** — personal-agent platform (and "Muse for small business"); **also** listed as an open-source model they've used — ambiguous in the transcript.
- **Grokbot / Grok Bot** — personal-agent platform (also "Grok" as a model they've used).
- **Instinct** — consumer-side personal-agent platform (named, not ours).
- **Dots** — OpenAI's personal agent (Greg: "OpenAI yesterday with dots"); governance concern for enterprise.
- **Frontier model** — top-tier lab models; Voss argues most workflows don't need one. Names rendered: "Fable or Astra" (unverified).
- **Open-source / non-frontier models** — Muse, GLM, Kimi, Qwen, Grok, "their non-frontier models."
- **Eval** — testing a model/agent against a task to decide trust and model choice.
- **Harness** — the scaffolding around a model/agent that you optimize.
- **Rollback** — undoing incorrect agent actions (esp. hallucination).
- **ZDR (zero data retention)** — contractual guarantee a vendor won't retain/train on your data; part of the governance pitch.
- **Carry** — PE profit share on the exit delta; FDEs may get a percent (transcript: 0.5%).
- **The NBA-player / top 0.1%** — Voss's description of the rare complete FDE with all three competencies.
- **"Sell the outcome"** — pitch the buyer's metric (their cost, their close time, their hiring speed), not the technology.

---

## 5. WHERE WE DEPLOY THIS — mapping to VidiSmart workflows

Read this table as *"what the video actually gives us, applied to our stack."* Where a concept doesn't fit, it says so. Owner bots are the fleet profiles that own that surface per our context.

| Our workflow | Video concept | Concrete deployment | Owner bot |
|---|---|---|---|
| **VidiSmart** (business-agent layer; sections Vidi AI, Hydra, VidiFlow, VidiModels, VidiMail, VidiCity, Community, EquityGen) | "Don't apply AI" + process mapping → re-engineering → build → deploy → roll out; **four buckets** | Treat each VidiSmart section as a **department**: run the three-source discovery (interviews/notes → mine our own logs/DBs → read existing docs) and produce one **process map per section**, then sort every step into delete / plain code / agentic / human-in-the-loop. VidiSmart is literally the "business-agent layer" the video says FDEs install — we should hold it to that standard, section by section. | @vidismart |
| **Hydra** (backend routing + process mgmt; bridges Hermes; surfaces into VidiFlow HX) | **Background agents** (do the work, ping when needed); **process-mining agents** over the system of record; "build it once, deploy everywhere" | Hydra is our **background-agent control plane**. Two concrete moves: (1) run **process-mining** over Hydra's own routing logs to build the "what enters → where it routes" graph the video describes; (2) apply the **build-once-deploy-everywhere** rule to router policies so one mapping serves every product surface. Hydra "bridges Hermes, never recreates it" = the video's *don't replace the system of record — live inside it* discipline. | @mez |
| **Smart Channel CX / VidiFlow HX** (personalized video + channel content at volume) | **Sidekick vs background**; ROI split **10–20% vs 70–80%**; **sell the outcome** | Classify each HX capability: interactive personalization = sidekick-style (10–20%); always-on volume generation = background agents (70–80%). Publish the **throughput/straight-through** metrics the video uses (volume produced, % needing human rework) and sell HX as an outcome, not a tool. | @smartchannel_cx / @vidiflow |
| **VidiTwin** (real-time rooms, diarization, addressee detection, avatar/voice on live calls) | **Human-in-the-loop**; humans handle approval/negotiation/high-risk steps; human surface = a Slack ping | **Honest fit note: the video does NOT discuss real-time rooms, diarization, or avatars.** The one transferable idea is that humans stay in the loop on the riskiest live decisions — VidiTwin is our *human-decision surface* analogue to the video's "human-in-the-loop" node and its "message in Slack." Map it that way; don't force the rest. | @viditwin |
| **VidiModels** (creator monetization + affiliate catalogue) | **"Sell to who you're speaking to"** / sell the outcome; **"benchmark every workflow against every single model"**; open-source/non-frontier toolkits (Muse, Grok, GLM/Kimi/Qwen) | Two uses: (1) pitch creators on the **outcome** (faster payouts, better discovery), not features; (2) VidiModels is our **model-toolkit catalogue** — stand up a **per-workflow model benchmark (eval harness)** that scores every lane on every workflow, exactly as Voss prescribes. | @vidimodels |
| **VidiBlast / VidiMail** (personalized video email + campaign engine) | **Friday action item: cold outbound to SMBs, offer ONE simple workflow**; revenue-uplift bucket; "build once, deploy everywhere" | VidiBlast/VidiMail *is* the outbound engine the video's Friday step describes. Turn the FDE outreach play into a reusable 1-workflow offer template (map one process → show KPI delta → propose). Apply build-once-deploy-everywhere to campaign templates across segments. | @vidimail_vidiblast |
| **EquityGen** (2×2 referral board, equitygen.app) | **Percent-of-value comp:** FDEs paid **~10% of value delivered**; PE FDEs get **~0.5% of the carry delta** | EquityGen's referral/ownership economics are the same "slice of the pie" model the video prices. Concrete: model referral payouts as a **% of value delivered/measured delta** (the video's $10M → $1M example) instead of flat fees, and expose the measured delta as the basis. | @equitygen |
| **The fleet** (17+ Hermes bot profiles, each owning a product) | **FDE = three people in one** (understand the work; ship production code w/ governance; own the AI layer + communicate) | Use the three competencies as the fleet's **capability rubric**: for each owning bot, record which of the three it covers and where the gap is. "How do we make our own FDEs internally? Have them follow the same playbook" — that playbook should be the fleet's onboarding/ownership doc. | @hermes_gateway (all) |
| **Free model lanes** (Space Bunny/OpenCode Zen, OpenRouter stealth, built-in Hermes on Nous, Muse Spark 1.3 contributor free, MiMo-V2.6-Flash free) | **Don't silo into frontier ChatGPT/Claude**; most work doesn't need a frontier model; benchmark every workflow against every model; use open-source, Grok, GLM/Kimi/Qwen | Our rotation *is* the video's recommendation, already in place. Concrete action: formalize the **per-workflow eval harness** so lane selection is measured, not assumed — and treat Voss's "few cases need a frontier model" as validation for keeping free lanes first. Chinese-lane caution the video flags is a *client-facing* concern, not an internal one. | @mez / @vidibot |
| **Memory layer** (Kumiho Neo4j graph; Revka writes captures; Mez calls jobs; 9Miho desktop UI; order Mez → Kumiho → Revka → 9Miho) | **"There is no second brain; it's on you to create that."** + the three discovery sources + AI-built process **graph** (A→X, B→Y) | Kumiho is precisely the artifact the video insists you must build yourself — the process/knowledge **graph**. Map our layers onto the video's three sources: **Revka captures = the "interviews / info in people's heads" layer; Kumiho = the mined "systems-of-record graph"; existing docs = ingested notes.** Mez = the background-agent caller. Honest note: the video names no graph DB; the concept (not the tech) is what transfers. | Mez → Kumiho → Revka → 9Miho |
| **Spend rule** (nothing paid runs without explicit approval; free lanes preferred) | **Agent cost per month is "shockingly low" vs humans**; start free / do the first engagement free for experience; enterprise governance (ZDR) friction | Two transfers: (1) keep the **free-first** discipline and quantify the free-lane saving against human/paid cost the way the video does — and treat our spend rule as the internal analogue of the video's governance gate; (2) the video's "do the first one free for the experience" supports a **free pilot ladder** for VidiBlast/VidiMail outreach before charging. Note honestly: our rule is stricter than the video's — Voss pays for frontier/paid lanes freely; we don't. | @mez (policy) |

**Concepts that do NOT fit (said plainly):**
- **On-prem GPU / hardware deployment** — Voss: "truthfully we've seen zero of that." No mapping to our fleet; we run on cloud/free lanes.
- **Replacing a client's CRM/ERP** — explicitly the anti-pattern ("you've lost them"); not a VidiSmart motion.
- **PE roll-up acquisition economics** (buy at $1B, sell at $4B) — only the **carry / %-of-value** idea transfers (→ EquityGen); we are not a PE firm.
- **"deote"** (the consultancy that mapped the $5B company's process) — unidentifiable from the transcript.

**Explicit flags on the three named tools vs our glossary:**
- **Muse** — the video treats Muse as a **personal-agent platform** (with a new "Muse for small business") *and inconsistently as an open-source model* they've used. Our rotation has **"Muse Spark 1.3 contributor free."** Whether these are the same lineage is **not confirmable from the transcript** — do not assume identity; verify before wiring the free lane to the video's concept.
- **Grok Bot** — the video's "Grokbot/GrobBot" is a **personal-agent platform** alongside Muse/Instinct, and separately "**Grok**" is a model they've used. Directly aligns with our brand glossary entry; usable as-is for the sidekick-vs-background framing.
- **Dots** — **OpenAI's** personal agent ("OpenAI yesterday with dots"). **Not in our stack**; the video's read is a **governance gap** in enterprise. Action: watch, don't adopt (no free lane).
- **Anti-Gravity** — **NOT mentioned in the video at all.** No mapping; our glossary entry stands independent of this episode.

---

*End of document. Prepared from the full 51,630-character auto-transcript; every quote and timestamp above is drawn from that text. Garbled tokens are flagged in §1 and inline rather than silently corrected.*
