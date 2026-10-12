# LLM or Snap Judge? The Full Report

**Research notes, evidence, and the VidiFlow adoption decision**
Prepared for [vidiflow.net](https://vidiflow.net) · 3 October 2026

---

## 0. The name, first

The model you have been hearing about is **Jev**, from **TypeSafe AI**. Launched
15 September 2026, it is the first model in a category TypeSafe calls **System
One**. It is a decision model, not a chat model. Your working name, *Snap Judge*,
is a good one — the industry has not settled on a single term yet, so you get to
choose the house name.

Here is the vocabulary you will meet, and what each term actually means.

| Term | Who uses it | What it means |
|---|---|---|
| **System One model** | [TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev) | Their category name, after Kahneman's fast/intuitive System 1 |
| **Typed decision model** | [arXiv 2609.32160](https://arxiv.org/abs/2609.32160) | The most accurate academic umbrella term |
| **Decision model / label-scoring model** | [awesome-decision-models](https://github.com/feder-cr/sfmqrb-awesome-decision-models), [systemonemodels.org](https://systemonemodels.org) | Community standard |
| **Semantic if** | [SemIf](https://github.com/TheoLeeCJ/SemIf) | "Most agent decisions are small" — the author's framing |
| **Snap Judge** | VidiFlow | Ours. Means the same thing. |

One clarification worth having: the decision to *not* generate text is not new.
Label-likelihood scoring is in GPT-3 §2.4 (2020), MMLU §4.1 (2021),
[verbalizers](https://arxiv.org/abs/2001.07676) (2021), and
[selective classification](https://arxiv.org/abs/1705.08500) (2017). As the
independent audit puts it, **the visible contribution is the packaging**: a typed
API, one hosted endpoint, output priced at zero, and many questions against one
input. That is not a criticism — packaging is exactly what turns a research trick
into infrastructure you can adopt on a Tuesday.

---

## 1. What it actually is

An LLM is a next-token predictor. You give it text, it gives you text back, and
if you want a decision you parse the text into a decision.

A Snap Judge inverts that. You give it **state** (a ticket, an email, a JSON
document) plus **typed questions**, and it gives you **typed answers with
probabilities**. No prose. Nothing to parse.

Three primitives, and they are the whole vocabulary:

| Primitive | You supply | It returns |
|---|---|---|
| **Choice** | a list of options (Jev allows up to 255) | chosen option + a probability for every option + confidence |
| **Score** | an ordered rubric of 2–10 levels | continuous score + distribution over levels + confidence |
| **Noul** | a yes/no statement | probability that it is true, 0–1 |

The whole request is **one forward pass**. All questions are evaluated in
parallel against the same state, so adding questions barely changes latency.

### The one request that explains everything

```python
resp = requests.post(
    "https://openrouter.ai/api/alpha/decisions",
    headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
    json={
        "model": "typesafe/jev-1.13",
        "state": "Hi, we were billed twice for March. Please refund the duplicate today.",
        "questions": {
            "department": {"type": "choice", "criteria": {"billing": "invoices, refunds",
                                                         "technical": "bugs, outages"}},
            "urgency":    {"type": "score",  "criteria": ["not urgent", "soon", "blocking"]},
            "churn_risk": {"type": "noul",   "instructions": "Does the user threaten to cancel?"},
        },
    },
)
# -> {"department": {"choice": "billing"}, "urgency": {"score": 0.71}, "churn_risk": {"noul": 0.88}}
```

No prompt engineering. No "respond only with JSON". No parsing. The answer is a
number your code branches on.

That is the entire idea, and it is genuinely good. Whether the numbers are as
good as the marketing says is a separate question, which this report answers
honestly in §5.

---

## 2. What it is not (the honest version)

**It is not a smaller LLM.** No generative model sits behind it that you can
prompt. It cannot write a paragraph, explain itself, or reason about anything
outside the question you asked.

**It cannot hallucinate — but read that carefully.** TypeSafe's own words:

> "Our number is not empirical. Schema matching is guaranteed."

Every answer is a valid option. It cannot invent a label. But it absolutely can
pick the **wrong** valid label. Type safety removes a class of *integration*
bugs. It does not remove misclassification. If you adopt it expecting it not to
be wrong, you have misread the claim.

**It reads instructions literally.** TypeSafe
[lists nine known failure modes](https://docs.typesafe.ai/model-jaggedness/jev-1.13)
for jev-1.13. The important ones for VidiFlow:

- **Literal reading** — it answers the question you wrote, not the one you meant.
  "refund" scored 0.72 and "not a refund" scored 0.47 on the same ticket.
- **Math and dates** — "Jev is not a calculator." Do arithmetic in code.
- **Option order matters** — reorder the options and the answer can change.
- **Large irrelevant state** — filter first, send only what the question needs.

---

## 3. The clone wave: 564 projects in three weeks

This is the part nobody predicted. Within roughly 48 hours of Jev's launch, at
least six independent open clones appeared. Latent.Space catalogued them; the
community then built
[awesome-jev](https://github.com/yibie/awesome-jev), which now tracks **564
projects** across 18 categories.

The reason they could all exist is the hard part. The decision mechanism is not
proprietary: **end the prompt where the answer would start, take the model's
scores for only the allowed label tokens, and softmax over them.** Any open model
can be read this way — vLLM exposes it via `logprob_token_ids`, SGLang via
`/v1/score`.

![The fork](assets/img/fork-clones.png)

### The main open contenders

| Project | Base | License | Stars | What it is |
|---|---|---|---|---|
| [**Laya**](https://github.com/NandhaKishorM/laya) | ModernBERT-large 421M / mmBERT-base 322M | Apache-2.0 | 30.5k | The production candidate. Pip-installable, 100+ languages, router between checkpoints |
| [**Kev**](https://github.com/jaredpalmer/kev) | Qwen3.5 0.8B–27B + LoRA | Apache-2.0 | 8.4k | Jared Palmer's family. Jev-wire-compatible API, your own weights |
| [**SemIf**](https://github.com/TheoLeeCJ/SemIf) | Qwen3.5-4B (frozen) | MIT | 4.7k | "Semantic ifs." Browser WebGPU demo, no waitlist |
| [**Nimble**](https://github.com/bespokelabsai/nimble) | Qwen3.5-9B + LoRA | — | 2.0k | Bespoke Labs' **contrastive data curation** recipe — the idea worth stealing |
| [**jevlike**](https://github.com/vinnylarouge/jevlike) | small trained model | MIT | 1.3k | The base `CUA-S1-FORMS` was built on it. Research starter |

### The single most valuable trick in the field

Nimble's method, from the [Bespoke Labs README](https://github.com/bespokelabsai/nimble):

> Write two nearly identical records and **flip one fact** so the correct answer
> flips — a refund signed by Mira is authorized, the same record signed by Noah
> is not.

This is contrastive curation. It produces training pairs that isolate exactly the
decision boundary you care about. Anyone building a Snap Judge should adopt this
before anything else. It is independent of the model.

---

## 4. Independent evidence: what actually holds up

This is the most important section, because the vendor numbers do not survive
contact with independent testing.

The single best audit is [xbill9's eight-day evidence review](https://dev.to/aws-builders/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1c60)
(24 Sep 2026) — 14 arXiv preprints, 104 GitHub repos, 33 dev.to/Medium posts, every
figure traced to a primary source and re-scored from committed per-item outputs
wherever they existed.

### TypeSafe's headline claims, checked

| Claim | Verdict |
|---|---|
| **193.6× faster, 444.6× cheaper** | ⚠️ Source is four **in-house** workflows TypeSafe built themselves. TypeSafe itself concedes "some bias could exist" and that the comparator is unnamed. Averaged over all eight setups: **97.8× faster, 149.2× cheaper**. Independent measurements run from **0.5× (slower!) to 12.1× faster** and **0.6× (dearer!) to 478× cheaper** |
| **"As accurate as LLMs"** | ❌ Behind the best LLM per task by a median 11.6 macro-F1 in the largest pre-registered study. On par with **mid-price** LLMs (Kimi K3, MiniMax M3, DeepSeek V4.1 Flash), not frontier |
| **0% hallucination** | ✅ Structurally true — every answer is a valid option. But "wrong-but-valid" is just misclassification under a different name |
| **RLCD** | ❌ No paper, no patent, no method description. Model size, base and training data all undisclosed |
| **Price** | $0.042 / M input tokens, **output free**. ~$5.54 per million decisions at 132-token prompts |

The founder's own framing is worth quoting, because it is unusually honest. On
Hacker News, describing Jev as "basically a zero-shot classifier," CEO **Diogo
Almeida** replied: **"exactly right!"** He co-invented RLHF at OpenAI and is a
primary author of InstructGPT. He was also explicit that TypeSafe "can't prove it
isn't subsidized."

### The one thing that does hold up

Independent tests agree on the genuinely valuable property, which is not raw
accuracy — it is **knowing when it is wrong**.

From [PavelRavvich's jev-bench](https://github.com/PavelRavvich/jev-bench):

> When Jev is wrong, its confidence drops to around **0.66–0.69**. When the cheap
> LLM is wrong, it still reports **0.82–0.85**. The LLM's verbalized confidence is
> high almost all the time; Jev's confidence carries more information about its
> own errors.

On spam detection, Jev's top 90% most-confident predictions were **100% correct**
(vs 98.9% for the LLM). That is the property you need for automation: *a threshold
above which you can act without review.*

### And the architecture that follows from it

The **confidence-gated cascade** — let the judge answer when confident, escalate
the rest to a stronger model:

![The cascade](assets/img/cascade.png)

Measured on the 130-message shared subset: on spam, the cascade **matched the
frontier model's accuracy exactly** while sending only **one message in nine** to
the expensive model — 8.5× cheaper, 5× faster at the median. On Banking77 it gave
up 1.6 accuracy points for a 5.5× cost reduction.

One caveat worth knowing: **cascading into a *cheap* LLM does not pay for itself.**
On Banking77, Jev + gpt-6-luna cost *more* than the LLM alone, because both cost
about the same per call. The cascade earns its money only when the model behind it
is expensive. This is a genuinely counter-intuitive result and it should shape how
you build this.

### The wide benchmark picture

| Source | Finding |
|---|---|
| [AbdelStark/jev-benchmarks](https://github.com/AbdelStark/jev-benchmarks) | AG News 0.910 vs GLiNER 0.700. Banking77 0.870 vs 0.610. **But** on DAIR Emotion Jev gave **zero probability to the true label on 16% of examples** |
| [nibzard/decision-model-benchmark](https://github.com/nibzard/decision-model-benchmark) | 40,226 decisions, zero failures, $1.71 total. Banking77 79.2%, p50 316ms. **But** NLU++ complete-message accuracy only **4.3%** |
| [Janardhan 6-model study](https://github.com/xbill9/gemma4-dev) | Claude Fable 5.1 **84.0%** > GPT-6 Astra 79.0% > DeepSeek V4.1 Flash 76.0% > **Jev 72.5%** |
| [arXiv 2609.24574](https://arxiv.org/abs/2609.24574) | Largest pre-registered study: 7,977 human-labelled items, Jev behind the best of 19 LLMs on **14 of 15** tasks |

**Eight independent Banking77 runs** put Jev at 0.753–0.840, median **0.809**. In
every study that ran LLMs beside it, the best of them was ahead.

---

## 5. Calibration: the thing you must actually handle

This is where adoption decisions get made or lost, and it is more nuanced than
either the hype or the debunk suggests.

**Out of the box, on familiar English tasks, Jev is the best-calibrated option
measured.** Median ECE **0.071** on a 13-subset public suite — better than
Nimble-9B on 11 of 13, and better than every Gemma 4 variant (0.114–0.180) before
any fitting. Against LLMs that *write* their confidence as a number in text, Jev
usually wins.

**But the direction of the error changes with the data.** On public multi-class
sets Jev is **overconfident**: on GoEmotions, labels it scored between 0.80 and
0.95 matched the human label only 15% of the time. On crash narratives and
synthetic items it is **under**-confident. Within one judge study, refit
temperatures ran from 0.65 to **4.45**, and the authors concluded no single
temperature fits.

**And against models returning real distributions, Jev is the worst.** Its ECE is
highest in Janardhan's run (0.161) and sanand0's nine-model Banking77 pilot
(0.138). Against LLMs returning full distributions, it loses.

There is also an API artefact: **the API rounds every probability to 0.01**, and
in one committed sample **70.4% of choice probabilities came back as exactly 0**.
Noul is clamped to 0.01–0.98. If you plan to threshold on tiny probabilities, know
this before you build it.

### The fix, and it is a small one

> "A small refit fixes most of the calibration error, for Jev and for any open
> model read the same way."

- A two-parameter refit on `civil_comments` took Jev's ECE from 0.16–0.21 to **under 0.025** on held-out data.
- Transferring a fitted slope and refitting only the intercept on **50 labels** cut mean ECE by **74%**.
- Out-of-fold Platt scaling cut ECE on crash narratives by **3.35×**.
- One temperature fitted on **50 labels** brought plain Gemma 4 26B from 0.180 → 0.080.

**Budget 50–300 labelled decisions per question family and fit a temperature on
them.** Every independent reviewer reaches the same conclusion. The open
replicas report the same order of correction: Nimble fitted 2.179, Luce 2.5–3.3.

Note this is *your* existing routing policy, already encoded at
`C:\Users\James\AppData\Local\hermes\routing\policy.json`: the classifier is
already `convaiinnovations/laya`, and it already carries the rule *"gate on
answer_confidence, NEVER raw confidence (measured 0.289 conf vs 0.717
answer_conf on same answer)"*. **The LLM-versus-Snap-Judge question is not
hypothetical on this machine — Laya is already routing requests right now.**

---

## 6. What the open models actually do

Laya's own README is refreshingly candid, and it contains the most important
operational warning in this entire report.

### The numbers

| | Jev 1.13 (published) | Laya routed | |
|---|---|---|---|
| typed-decisions, 2,000 decisions | 0.727 | **0.766** | +0.039 |
| AG News, 4 labels | 0.910 | **0.950** | +0.040 |
| DAIR Emotion, 6 labels | 0.480 | **0.595** | +0.115 |
| **Banking77 (72 vs 77 labels)** | **0.870** | **0.425** | ⚠️ **Jev wins on >20 options** |
| ECE (lower better) | 0.246 | **0.081** | 3× better, post-temperature |
| p50 latency, 1 question | 236–276 ms | **32.8 ms** | 7.8× faster |
| Languages usable | *no published benchmark* | **48 of 51** | — |
| Cost | $0.042 / 1M tokens | **$0 self-hosted** | — |

Speed on a T4, measured: **39.5 ms** for one question, **7.2 ms/question** batched
at 10, **6.8 ms/question** at 50. Batched throughput 103–332 questions/sec.

### ⚠️ Read this before you deploy Laya

**The base checkpoints are near chance.** 0.362 and 0.352 against a 0.318 random
baseline and a **0.461 majority-class baseline**. Laya is a fast base to
specialise, not a zero-shot decision engine. All of the 0.766 comes from
fine-tuning. If you skip fine-tuning, you are running something *worse than
predicting the most common label.*

**This corrects the current page.** It states 45 of 51 languages usable; the
measured figure is **48 of 51**. It also presents 0.766 without the baseline
context that makes it meaningful.

Two more traps, both from the README:

- **`Router(preload=True)` or nothing.** The router keeps one checkpoint resident
  by default, so traffic that alternates languages **rebuilds a model on every
  request** — a measured **7.4 s median on CPU, 10.3 s on a T4**. This turns a
  33 ms model into a 10-second one. Serve it with `Router(preload=True)`.
- **Option-count budget.** `head_max_len` is a cap, not a head length. Past
  roughly `head_max_len / 4` options the head grows *beyond* the cap and your
  state gets **truncated**, not merely shortened. `MAX_CHOICE_OPTIONS = 100`
  puts that regime within reach over HTTP.

Also documented and relevant: `action.act_probability` carries no usable signal
(AUROC **0.30** — worse than random), and `laya-multilingual` has a position bias
on `score` questions.

### Kev

[Kev](https://github.com/jaredpalmer/kev) is the accuracy pilot. Note the honest
framing in its own table — Jev has only been run on the **development** sets:

| Model | Accuracy: New Sources | Brier: New Sources | Held-out index |
|---|---|---|---|
| Kev-4B | 0.817 / 0.838 | 0.269 | 38.0 |
| Kev-27B | **0.851** / 0.889 | **0.225** | 52.3 |
| **Jev** | 0.857 / – | 0.211 | 54.0 |

Each cell is development / test. "New sources" means datasets and policy rules
Kev never saw — the closest thing to your own questions. **Kev-27B is within a
point of Jev; Kev-4B is within four.**

---

## 7. The decision: LLM or Snap Judge?

You asked for this directly, so here it is plainly.

### Use a Snap Judge when

- The answer is a **choice, score, or boolean** you can enumerate in advance
- You need **hundreds of milliseconds or less**, in a user-facing path
- You branch on the result — routing, triage, guardrails, escalation
- You have **no labels yet** and want something working today
- The data **cannot leave your network**
- You need the answer to be **schema-guaranteed** — no parse failures, ever

### Use an LLM when

- The output must be **prose, code, or anything open-ended**
- The task needs **reasoning, arithmetic, dates, or multi-hop indirection**
- You need the model to **explain itself**
- The label space is **large, fuzzy, or changes every call** — Banking77 at 77
  options is the case where Jev beat Laya 0.870 to 0.425's disadvantage
- You have **no idea what the right labels are yet**

### The honest summary

Neither. **The cascade beats both**, and it is the only architecture all three
independent benchmarks converge on. TypeSafe documents it themselves as
[confidence-gated routing](https://docs.typesafe.ai/patterns/confidence-routing).

A Snap Judge is a **reflex**. An LLM is a **deliberation**. You do not choose
between them — you put the reflex in front and let it decide what deserves
thought.

> "Not Jev instead of an LLM, but Jev in front of one."

The cost of being wrong about this is asymmetric in a way that should decide it
for VidiFlow: a Snap Judge that abstains costs you one cheap call. An LLM asked a
routing question and confidently wrong costs you a full generation plus a user
who saw the wrong answer.

---

## 8. Recommended adoption

Unchanged from the 24 September decision, with the corrections from this research
applied. **None of it is wired into Hermes. Auto-action stays off unless a person
confirms the result.**

**01 — Label first.** Export 300–500 labelled decisions across route, escalate,
urgency, churn and refund, keeping each family together. Score Laya, Kev-4B and
SemIf before any of them serves traffic. Per §5, 50–300 per family is enough to
fit a temperature; 300–500 across families lets you compare checkpoints.

**02 — Serve Laya correctly.** Install beside the existing agent backend. **Use
`Router(preload=True)`** — without it, alternating-language traffic costs 7–10
seconds per request. Reach the server only through the site proxy.

**03 — Fine-tune or do not ship.** The base checkpoints sit *below* the majority
baseline. Fine-tune on VidiFlow pairs, fit temperatures on your own labels, set a
threshold per question, keep an explicit abstain option. Adopt Nimble's
contrastive-pair method to build the training set.

**04 — Keep the pilot and the teaser.** Run Kev-4B in a separate Python 3.12 or
3.13 environment. Offer SemIf as a no-backend teaser on the demo and `/lex`.

### Constraints on the table

- One RTX 4090 at 24 GB, shared with Qwen3.6-27B at 15.4 GB plus KV cache. Two
  RTX 6000 Pro cards are the later plan.
- States over ~4,000 tokens: shorten first, or route to a longer-context
  checkpoint and re-test. Laya multilingual reads to 8,192 with `max_len=8192`.
- Published temperatures **do not transfer.** Refit each threshold on VidiFlow labels.
- Jev and TypeSafe remain their owners' marks. These projects follow an interface
  pattern; none of them is Jev.

---

## 9. Sources

### Primary
- [TypeSafe: Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev) · [docs](https://docs.typesafe.ai/introduction) · [Jev 1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13) · [confidence-routing](https://docs.typesafe.ai/patterns/confidence-routing) · [pricing](https://typesafe.ai/#pricing)
- [Laya](https://github.com/NandhaKishorM/laya) · [Kev](https://github.com/jaredpalmer/kev) · [SemIf](https://github.com/TheoLeeCJ/SemIf) · [Nimble](https://github.com/bespokelabsai/nimble) · [jevlike](https://github.com/vinnylarouge/jevlike)

### Independent evaluation
- [xbill9 — Jev after eight days of independent tests](https://dev.to/aws-builders/jev-after-eight-days-of-independent-tests-level-with-mid-price-llms-behind-the-frontier-1c60) — *the most rigorous audit available*
- [PavelRavvich/jev-bench](https://github.com/PavelRavvich/jev-bench) — [full write-up](https://github.com/PavelRavvich/jev-bench/blob/main/article/jev-article.md)
- [AbdelStark/jev-benchmarks](https://github.com/AbdelStark/jev-benchmarks)
- [nibzard/decision-model-benchmark](https://github.com/nibzard/decision-model-benchmark)
- [Luni/laya-jev-benchmark](https://huggingface.co/datasets/Luni/laya-jev-benchmark)

### Papers
- [arXiv 2609.32160 — Typed Decision Models: An Early Evidence Audit](https://arxiv.org/abs/2609.32160) — reviews 28 papers
- [arXiv 2609.24574](https://arxiv.org/abs/2609.24574) — largest pre-registered study
- [arXiv 2609.29429 — RLCDAlignBench](https://arxiv.org/abs/2609.29429)
- [arXiv 2609.34963 — JevVibe](https://arxiv.org/abs/2609.34963)
- [arXiv 2609.28940 — JEV and Laya as System One decision layers](https://arxiv.org/abs/2609.28940)

### Registries and video
- [awesome-jev](https://github.com/yibie/awesome-jev) — 564 projects, 18 categories
- [awesome-decision-models](https://github.com/feder-cr/sfmqrb-awesome-decision-models)
- [systemonemodels.org/jev-benchmarks](https://systemonemodels.org/guides/jev-benchmarks/)
- [Six Jev Clones in 2 Days](https://www.explainx.ai/blog/six-jev-clones-two-days-2026) · [I read 7 clones of Jev](https://note.com/zephel01/n/ne9a2c037e513)
- Video: [Jev Explained](https://www.youtube.com/watch?v=WVrtX1tSwV0) · [The Model That Doesn't Write Text](https://www.youtube.com/watch?v=1Mz9z1je-jY) · [Full Breakdown RLCD](https://www.youtube.com/watch?v=MwwA8ee-u-k) · [Schema-Safe AI](https://www.youtube.com/watch?v=BGDd26FiOm4) · [Visual Explainer](https://www.youtube.com/watch?v=UVKwcjoanRo)

---

*Research compiled 3 October 2026. Vendor figures are labelled as vendor
figures. Independent measurements are attributed to their authors and carry their
sample sizes and limitations. Snapshot adoption figures remain from 24 September
2026; the 48-of-51 language figure and the base-checkpoint baselines are
corrections from this pass.*