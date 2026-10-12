# Qwen ~27B / B70 speed — corrected (Sep 11, 2026)

## B70: is 20 tok/s the best?
**No — not the absolute best the card can do.** It depends what you run:

| Workload on B70 | Typical tok/s | Source |
|---|---:|---|
| Dense Qwen 27B Q4, stock llama.cpp | **~20–22.5** | pmzfx, CraftRigs |
| Dense 27B, vLLM XPU + GPTQ-INT4 + MTP4 | **~69** | Sergio B. |
| MoE Qwen 35B-A3B Q4, single-stream | **~55–73** | pmzfx, Mann, Sergio B. |
| Llama 3.1 8B Q4 | **~83** | pmzfx |
| Qwen 1.5B Q4 | **~216** | pmzfx |
| Multi-stream MoE aggregate | **170–500+** | Jonathan Mann |

So **80–200 claims are real** — they are usually **small models**, **MoE**, or **aggregate multi-stream**, not dense 27B single-stream stock.

## Dense ~27B stock (Truth-Teller Locked Numbers)
Locked directly from `bandwidth-glance-3tbs.png` (**Tok/s at a Glance — Truth Teller**):

| Hardware | Effective BW | Decode tok/s | Prefill ("Props") | Status / Notes |
|---|---|---:|---:|---|
| **Vera Rubin HBM4** | 22 TB/s | **~841** | >45,000 | FLASH (Off-scale vs 120 full bar) |
| **B200 / MI355X HBM3e** | 8 TB/s | **~306** | ~25,000 | FLASH |
| **H100 SXM HBM3** | 3.35 TB/s | **~128** | ~18,000 | FLASH |
| **2× RTX PRO 6000 Blackwell** | 1.79 TB/s | **~120** | ~12,000+ | FLASH (AirPMD MVP · FULL BAR) |
| **1× RTX PRO 6000 Blackwell** | 1.79 TB/s | **~120** | ~6,291 | FLASH (96GB · 120 decode / 6,291 prefill) |
| **RTX 5090 32GB** | 1.79 TB/s | **~75** | ~5,500 | CHAT OK |
| **Intel Arc Pro B70 32GB** | 608 GB/s | **~50** | ~1,800 | CHAT OK (Draft-INT4/MTP4 mid-band · 46–55 long-ctx) |
| **RTX 4090 24GB (James)** | 1.01 TB/s | **~48** | ~3,200 | SLOW (Baseline dense 27B) |
| **TR Pro + Arc Pro B70** | 608 GB/s | **~40+** | ~1,400 | SLOW (James: stack hits 40+ · VRAM drives decode) |
| **RTX 3090 24GB** | 936 GB/s | **~30** | ~2,100 | SLOW (James lock ~30 dense 27B · not old ~75 bar) |
| **Mac Studio M3 Ultra (effective)** | 180 GB/s | **~20** | ~220 | SLOW (Lucky ~20 · peak 800 was marketing) |
| **Mac Studio M4 Max (effective)** | 170 GB/s | **~15** | ~190 | SLOW (Below Ultra) |
| **TR Pro CPU-only (no GPU)** | 270 GB/s | **~13** | ~75 | TOO SLOW (Host RAM ~270 eff · under 20) |
| **Mac mini / MB Pro (effective)** | 160 GB/s | **~12** | ~140 | TOO SLOW (Below Max) |
| **Consumer DDR5 2-ch** | 110 GB/s | **~3** | ~35 | TOO SLOW (Desktop DIMMs) |
| **PCIe 5.0 x16 offload** | 64 GB/s | **~2** | — | TOO SLOW (Weights over the bus = chat death) |

### Empirical Rules:
1. **Apple M3 Ultra Reality**: Real-world memory bandwidth during LLM token decode is **~180 GB/s effective**, producing **~20 tok/s** under ideal/lucky conditions (`Lucky ~20 · peak 800 was marketing`). The theoretical claim of 32–36 tok/s is marketing fiction.
2. **Intel Arc Pro B70 is 32GB**: The card is the 32GB workstation model with 608 GB/s bandwidth; 27B models run 100% inside VRAM hitting **~40–50 tok/s**.
3. **RTX 3090 Locked at ~30**: James tested and verified dense 27B runs at **~30 tok/s** (not the false marketing ~75 bar).


## Single prompt vs 30-agent fleet (added Sep 11)
Graphic: `images/bandwidth-toks-single-vs-fleet.png` (4800px)

- **LEFT:** single-stream dense ~27B stock tok/s (chat feel)
- **RIGHT:** multistream aggregate tok/s for ~30 agents/company
- Per-agent share ≈ fleet ÷ 30

Measured fleet anchors: RTX 5090 ~1,850+; RTX 3090 ~850–1,000; Mac Studio M3 Ultra ~240 (unified RAM bandwidth saturation); B70 dense ~30 (spills 16GB VRAM; MoE multi-stream is ~170–526).

