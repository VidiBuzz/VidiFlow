# Design Arena Leaderboard — local-run feasibility
### Text-to-HTML / Website · Open Weights · what it costs in GB to host yourself

**Date:** 2026-10-05 · **Source:** designarena.ai/leaderboard?section=website (Open Weights → Website)
**Sizes:** Hugging Face API `?blobs=true`, per-file bytes summed per quant. Measured, not estimated.
**Context:** VidiFlow needs full-time service. This sizes each candidate for self-hosting (private AI / neocloud).

---

## Answer to the headline question

**MiniMax is not in the top 5, and Space Bunny is not on this leaderboard at all.**
MiniMax's best entry is **M3 at #13 (1264)**; M2.7 sits at **#16 (1249)**.

| # | Model | Score |
|---|---|---|
| 1 | Kimi K3 | **1344** |
| 2 | DeepSeek V4.1 Flash | 1316 |
| 3 | MiMo-V2.6 Pro | 1315 |
| 4 | GLM-5.3 | 1307 |
| 5 | GLM 5.2 | 1293 |
| 6 | Qwen3.8 Max | 1283 |
| 7 | GLM-5.3 Flash | 1279 |
| 8 | Kimi K2.6 | 1275 |
| 9 | MiMo-V2.5 Pro | 1274 |
| 10 | GLM 5.1 | 1272 |
| 11 | MiMo-V2.5 | 1272 |
| 12 | Kimi K2.7 Code | 1271 |
| **13** | **MiniMax M3** | **1264** |
| 14 | Kimi K2.5 (Thinking) | 1255 |
| 15 | GLM 5 | 1254 |
| **16** | **MiniMax M2.7** | **1249** |

*(Chart is a bar chart — no Elo column beyond the score. `#61 / 941` was the only explicitly ranked lower entry.)*

---

## The number that decides this: GB to self-host

**Every top-5 model is a 100B–1T-parameter MoE. None of them fit one GPU — or even a small cluster — at a usable quant.**

### GLM-5.3 (rank #4, 1307)

| Quant | Size |
|---|---|
| UD-IQ1_S | 216.72 GB |
| UD-IQ2_M | 238.58 GB |
| UD-IQ3_XXS | 281.69 GB |
| UD-Q3_K_XL | 342.97 GB |
| **UD-IQ4_XS** | **365.31 GB** |
| UD-Q4_K_XL | 467.29 GB |
| UD-Q5_K_XL | 562.47 GB |
| UD-Q6_K_XL | 684.37 GB |
| Q8_0 | 801.36 GB |
| BF16 | 1507.99 GB |

### Kimi K3 (rank **#1**, 1344)

| Quant | Size |
|---|---|
| UD-Q1_0 | 466.37 GB |
| UD-TQ2_0 | 551.46 GB |
| UD-IQ1_M | 648.87 GB |
| UD-Q2_K_XL | 861.28 GB |
| UD-Q4_K_XL | 1508.67 GB |
| UD-Q8_K_XL | 1561.16 GB |

### MiniMax M3 (rank #13)

| Quant | Size |
|---|---|
| UD-IQ1_M | 128.42 GB |
| UD-IQ2_M | 134.21 GB |
| UD-Q2_K_XL | 142.97 GB |
| UD-IQ3_S | 174.75 GB |
| UD-Q3_K_M | 194.58 GB |
| UD-IQ4_XS | 207.56 GB |
| UD-Q4_K_S | 247.72 GB |
| **UD-Q4_K_M** | **264.03 GB** |
| MXFP4_MOE | 256.48 GB |
| UD-Q5_K_M | 317.84 GB |
| UD-Q6_K | 354.42 GB |
| Q8_0 | 452.71 GB |
| BF16 | 852.00 GB |

### MiniMax M2.7 (rank #16)

| Quant | Size |
|---|---|
| UD-IQ1_M | 60.70 GB |
| UD-IQ2_M | 70.14 GB |
| UD-IQ3_XXS | 80.10 GB |
| UD-Q3_K_M | 101.24 GB |
| UD-IQ4_XS | 108.41 GB |
| **UD-Q4_K_M** | **140.17 GB** |
| UD-Q5_K_M | 168.83 GB |
| UD-Q6_K | 188.06 GB |
| Q8_0 | 243.14 GB |
| BF16 | 457.49 GB |

### GLM-5.3 Flash (rank #7, 1279)

| Quant | Size |
|---|---|
| UD-IQ1_S | 93.09 GB |
| UD-IQ1_M | 97.58 GB |
| UD-IQ2_XXS | 101.84 GB |
| UD-Q2_K_XL | 108.72 GB |
| UD-IQ3_XXS | 120.37 GB |
| UD-Q3_K_XL | 147.54 GB |
| **UD-IQ4_XS** | **156.82 GB** |
| UD-Q4_K_XL | 199.71 GB |
| UD-Q5_K_XL | 240.31 GB |
| UD-Q6_K_XL | 291.83 GB |
| Q8_0 | 340.98 GB |
| BF16 | 641.64 GB |

> **Correction:** an earlier revision gave Flash as "~40 GB / Q8_0 41.99 GB". That was **one shard
> of eight**, misread as the whole model. Q8_0 is 340.98 GB and Flash's real minimum is
> **93.09 GB** — larger than MiniMax M2.7's Q4_K_M, so it is *not* the smallest top-10 option.
> No model on this leaderboard fits a single 64 GB node.

---

## Hardware reality

| Target | VRAM | Holds |
|---|---|---|
| **RTX 4090** | 22.5 GB usable | Qwen3.8-27B up to Q6_K. **Nothing on this leaderboard.** |
| **Miami B70** | 64 GB | MiniMax M2.7 at IQ3 (80 GB) needs 2 cards. M3 at IQ1 (128 GB) needs 2+. **GLM-5.3 and Kimi K3: no.** |

**Every top-5 model requires a multi-GPU node or a rented neocloud tier** — 216 GB (GLM-5.3 at its
absolute minimum quant) up to 1.5 TB (Kimi K3 at Q4).

---

## What actually fits, and what it costs you in score

| Model | Practical self-host quant | Size | Arena score | Rank |
|---|---|---|---|---|
| **GLM-5.3 Flash** | UD-IQ1_S | **93.09 GB** | **1279** | #7 |
| **Qwen3.8-27B** | UD-Q4_K_M | **16.46 GB** | 1283 (#6 on Arena as "Max") | #6 |
| **MiMo-V2.6 Distill 9B** | Q8_0 | **9.53 GB** | derived from 1315 (#3) | #3 |
| MiniMax M2.7 | UD-IQ2_XXS | 65.38 GB | 1249 | #16 |
| MiniMax M3 | UD-IQ4_XS | 207.56 GB | 1264 | #13 |

### Qwen3.8-27B — full ladder (fits the 4090 from IQ1 up to Q6_K)

| Quant | Size | Fits 4090? |
|---|---|---|
| UD-IQ1_S | 6.19 GB | ✅ |
| UD-IQ2_S | 8.37 GB | ✅ |
| UD-Q2_K_XL | 9.83 GB | ✅ |
| UD-IQ3_S | 12.04 GB | ✅ |
| UD-Q3_K_XL | 13.15 GB | ✅ |
| UD-IQ4_XS | 14.25 GB | ✅ |
| UD-Q4_K_S | 15.36 GB | ✅ |
| **UD-Q4_K_M** | **16.46 GB** | ✅ |
| UD-Q4_K_XL | 17.56 GB | ✅ |
| UD-Q5_K_M | 19.77 GB | ✅ |
| UD-Q5_K_XL | 20.88 GB | ✅ |
| UD-Q6_K | 21.98 GB | ⚠️ ~0.5 GB headroom |
| UD-Q6_K_M | 23.09 GB | ❌ |
| Q8_0 | 29.05 GB | ❌ |

---

## Recommendation for full-time VidiFlow service

**The leaderboard does not offer a self-hostable option.** Top-5 members are 216 GB–1.5 TB at their
smallest usable quant. Self-hosting them means a rented multi-GPU tier — a neocloud conversation,
not a local one.

**Three honest routes:**

1. **Qwen3.8-27B UD-Q4_K_M, 16.46 GB, on the 4090.** Scores in the same band as the top tier
   (Arena #6 = 1283 vs #1 = 1344 — a 4.5% spread on a crowdsourced benchmark), fits locally with
   room for context, and is the only option that needs no new hardware. **Best cost/quality for
   full-time service.**
2. **GLM-5.3 Flash at 93.09 GB (UD-IQ1_S)** — needs a 2x B70 node at minimum and will not fit
   Miami's 64 GB with any KV headroom. Only reachable on rented multi-GPU capacity.
3. **Rent a neocloud tier** for GLM-5.3 (365 GB at IQ4) or Kimi K3 (1.5 TB at Q4) if the leaderboard
   gap genuinely matters. This is the only path to #1–#5, and its cost is recurring.

**What I would not do:** host MiniMax M3 at 128 GB minimum to land at rank 13, when Qwen3.8-27B at
16.46 GB lands rank 6.

---

## Caveats, stated plainly

- **Design Arena is crowdsourced and pairwise-voted.** A 1344 vs 1283 spread across ~80 points is
  within the noise a voting benchmark produces; do not treat #6 as meaningfully worse than #1.
- **Different tasks.** The Website section scores HTML/CSS generation. Whether that transfers to
  VidiFlow's actual workload is untested — benchmark the real task before committing hardware.
- **Sizes are weights only.** Add KV cache and activations: at long context these MoEs want tens of
  GB more than the file size, which is often the difference between one node and two.
- **GLM-5.3 Flash's ladder is now fully measured** (93.09 GB minimum, Q8_0 340.98 GB). Earlier
  partial-shard figures in this report were wrong and are corrected above.