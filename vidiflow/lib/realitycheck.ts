// Reality-check data for the "1.2 TB/s is not what you buy" explainer.
//
// Every figure below is traceable to a footnote in lib/catalog.ts FOOTNOTES.
// The rule this file follows: a number is only allowed here if it appears in a
// cited source. Where evidence is thin, `measured: false` keeps it out of the
// animated bars and it is shown as a claim instead.

export interface SceneBar {
  label: string;
  value: number;
  display: string;
  sub?: string;
  tone: 'apple' | 'nvidia' | 'neutral' | 'warn';
}

export interface Scene {
  id: string;
  kicker: string;
  headline: string;
  body: string;
  /** Verdict chip: what the viewer should walk away thinking. */
  verdict?: string;
  bars?: SceneBar[];
  /** Optional single stat rendered large instead of bars. */
  stat?: { value: string; label: string; note?: string };
  /** Footnote numbers from catalog FOOTNOTES, rendered as links. */
  fns: number[];
  /** True when the scene shows marketing/spec language rather than measurement. */
  isClaim?: boolean;
}

export const REALITY_SCENES: Scene[] = [
  {
    id: 'headline',
    kicker: 'The headline',
    headline: '1.2 TB/s. 512 GB. $5,499.',
    body:
      "Apple's M5 Ultra Mac Studio is real, and the 1.2 TB/s unified-memory bandwidth figure is a genuine spec — a 50% jump over the M3 Ultra's 819 GB/s. It is also the number most buyers treat as a speed promise. It is not one.",
    stat: {
      value: '1.2 TB/s',
      label: 'unified memory bandwidth, M5 Ultra',
      note: '+50% over M3 Ultra · quad-die, 4.4 TB/s die-to-die interconnect',
    },
    fns: [15],
    isClaim: true,
  },
  {
    id: 'fabric',
    kicker: 'Where the terabytes come from',
    headline: 'Same unit. Very different fabric.',
    body:
      "Apple reaches 1.2 TB/s by stacking an enormous amount of LPDDR5X. NVIDIA reaches 1.79 TB/s on a single 512-bit bus of GDDR7. The totals look comparable; the per-pin rates underneath them are not.",
    bars: [
      {
        label: 'GDDR7 per pin',
        value: 48,
        display: '32–48 Gbps',
        sub: '~128–192 GB/s per device',
        tone: 'nvidia',
      },
      {
        label: 'LPDDR5X per pin',
        value: 9.6,
        display: '6.4–9.6 Gbps',
        sub: '~34 GB/s per device',
        tone: 'apple',
      },
    ],
    verdict: 'GDDR7 moves 4–7× more per pin. LPDDR5X trades latency for energy efficiency.',
    fns: [17],
  },
  {
    id: 'peak',
    kicker: 'Peak is not delivered',
    headline: 'Nobody ships peak.',
    body:
      "Every vendor on this page quotes theoretical bandwidth, including NVIDIA. Peak bandwidth is a property of the memory, not of your workload. Decode speed is what you actually feel, and it is a fraction of the number on the box.",
    bars: [
      {
        label: 'RTX 5090 — spec sheet',
        value: 1792,
        display: '1,792 GB/s',
        sub: 'GDDR7 peak',
        tone: 'neutral',
      },
      {
        label: 'M5 Ultra — spec sheet',
        value: 1200,
        display: '1,200 GB/s',
        sub: 'LPDDR5X peak',
        tone: 'neutral',
      },
    ],
    verdict: 'On paper the 5090 is 49% faster. On a model that fits in its 32 GB, the gap is real.',
    fns: [14, 15],
    isClaim: true,
  },
  {
    id: 'apples',
    kicker: 'The controlled comparison',
    headline: 'Same model. Same harness. One winner.',
    body:
      "MacStories ran Qwen3.8 27B through llama.cpp on both machines — the same engine, the same quantization discipline, no speculative decoding on either side. This is the closest thing to an apples-to-apples test that exists for this pair.",
    bars: [
      {
        label: 'RTX 5090',
        value: 59,
        display: '59 tok/s',
        sub: 'Qwen3.8 27B decode',
        tone: 'nvidia',
      },
      {
        label: 'M5 Ultra',
        value: 48,
        display: '48 tok/s',
        sub: 'Qwen3.8 27B decode',
        tone: 'apple',
      },
    ],
    verdict: 'The $2,000 card generates tokens ~23% faster than the $5,499 machine on this model.',
    fns: [16],
  },
  {
    id: 'headline-number',
    kicker: 'Where the real number hides',
    headline: '125B is not 125B.',
    body:
      "The 100+ tok/s Mac results everyone quotes come from Qwen3.8-Flash-Next — a Mixture-of-Experts model with 125B parameters of which only 6B are active per token. Decode reads the active bytes, not the whole model. '125B at 135 tok/s' and '27B dense at 48 tok/s' are not the same measurement.",
    stat: {
      value: '6B',
      label: 'active parameters per token — of 125B total',
      note: 'Plus a 51B n-gram embedding table and a 4B MTP head that also sit in memory but do no arithmetic per token',
    },
    verdict:
      'Quoting a MoE tok/s figure as if it were a dense tok/s figure is the single most common way these comparisons mislead.',
    fns: [18],
  },
  {
    id: 'active-params',
    kicker: 'The rule nobody applies',
    headline: 'Speed tracks active parameters, not total.',
    body:
      "On the same Radeon card, swapping a dense 14B model for a 30B/3B-active MoE model moved single-stream throughput from 7.5 to 51 tok/s — a 6.8× speedup with no hardware change and no code change. The model got bigger and got 6.8× faster, because each token only reads the expert it routed to.",
    bars: [
      {
        label: 'Dense 14B',
        value: 7.5,
        display: '7.5 tok/s',
        sub: 'every parameter read per token',
        tone: 'neutral',
      },
      {
        label: 'MoE 30B / 3B active',
        value: 51,
        display: '51 tok/s',
        sub: 'only the routed expert is read',
        tone: 'nvidia',
      },
    ],
    verdict:
      'Decode tok/s ≈ effective bandwidth ÷ ACTIVE bytes per token. Total parameters determine whether it fits, not how fast it runs.',
    fns: [19],
  },
  {
    id: 'concurrency',
    kicker: 'The advantage evaporates at scale',
    headline: 'MoE is a single-user trick.',
    body:
      "Here is the part that matters for a $10,000 purchase. The MoE speedup depends on only a few experts being active. Add concurrent users and each request touches different experts — active parameters climb toward total parameters, and the advantage inverts. Peer-reviewed work shows MoE decode degrading 1.7–3× versus a small dense model as batch size rises.",
    bars: [
      {
        label: 'MoE — 1 user',
        value: 51,
        display: '51 tok/s',
        sub: 'sparsity intact',
        tone: 'nvidia',
      },
      {
        label: 'MoE — 16 users',
        value: 24,
        display: '24 tok/s per user',
        sub: '381 tok/s aggregate',
        tone: 'warn',
      },
    ],
    verdict:
      'If you are serving more than one person, you are buying a CUDA box. That is the whole argument.',
    fns: [19],
  },
  {
    id: 'speculation',
    kicker: 'Why every benchmark you have read is wrong',
    headline: 'Speculation doubles everything.',
    body:
      "Multi-token prediction lets a model draft several tokens and verify them in one pass. It roughly doubles throughput — on both platforms, on MoE and dense alike. It is not cheating and it does not change output, but it means two tok/s figures are only comparable when the flags match.",
    bars: [
      {
        label: '5090 — baseline',
        value: 60,
        display: '~60 tok/s',
        sub: 'no speculation',
        tone: 'neutral',
      },
      {
        label: '5090 — MTP on',
        value: 119,
        display: '~119 tok/s',
        sub: 'UD-Q5_K_XL, n_max 5',
        tone: 'nvidia',
      },
      {
        label: 'Mac — baseline',
        value: 48,
        display: '~48 tok/s',
        sub: 'no speculation',
        tone: 'neutral',
      },
      {
        label: 'Mac — MTP on',
        value: 57,
        display: '~57 tok/s',
        sub: 'Flash-Next, speculation off',
        tone: 'apple',
      },
    ],
    verdict:
      'Never compare two tok/s figures without matching engine version, quant, context length, KV cache type, and speculation depth.',
    fns: [16],
  },
  {
    id: 'idle-die',
    kicker: 'The part nobody writes about',
    headline: 'You may be paying for a die that idles.',
    body:
      "The M5 Ultra is two M5 Max dies fused together. Run it through MLX on the default single-device path and the second die sits essentially idle — a 7% gain over a plain M5 Max. You must shard explicitly with a hostfile, and unlike nvidia-smi there is no straightforward way to confirm both ranks are actually participating.",
    stat: {
      value: '7%',
      label: 'single-device gain over M5 Max',
      note: '21.1 vs 19.8 tok/s on Llama 3.3 70B Q4 · TP=2 recovers 30–40%',
    },
    verdict:
      'A quad-die part that defaults to using one die is a real, verifiable buying risk — and a legitimate consulting finding.',
    fns: [16],
  },
  {
    id: 'shared-pool',
    kicker: 'The risk nobody prices in',
    headline: 'Your memory is not yours alone.',
    body:
      "Unified memory is one pool shared by the GPU, the CPU, the OS and every other application. One M5 Ultra owner launched a second copy of an already-loaded model and decode collapsed from 100 tok/s to 12 — a silent swap, not a crash. Dedicated VRAM does not have this failure mode.",
    bars: [
      {
        label: 'Idle',
        value: 100,
        display: '100.2 tok/s',
        sub: 'model loaded, nothing else running',
        tone: 'apple',
      },
      {
        label: 'One extra app',
        value: 12,
        display: '12 tok/s',
        sub: 'second copy → swapping',
        tone: 'warn',
      },
    ],
    verdict:
      'An 88% collapse from one stray process is not a tuning problem. It is an architecture consequence you cannot engineer around.',
    fns: [20],
  },
  {
    id: 'verdict',
    kicker: 'So what are you actually buying?',
    headline: 'Capacity is the product. Speed is not.',
    body:
      "The M5 Ultra does one thing a 32 GB card cannot: hold models that do not fit anywhere else. Past that line it wins outright. Below it, you are paying $5,499 for less speed than a card that costs a third as much. And if you are serving more than one person, scene 4 already told you what happens.",
    bars: [
      {
        label: 'M5 Ultra — capacity',
        value: 512,
        display: '512 GB',
        sub: '$5,499 · single user · no dedicated VRAM',
        tone: 'apple',
      },
      {
        label: 'RTX 5090 — capacity',
        value: 32,
        display: '32 GB',
        sub: '~$2,300 · dedicated VRAM · serves many',
        tone: 'nvidia',
      },
    ],
    verdict:
      'Over 32 GB of weights, single user, interactive: the Mac wins and nothing else is in the conversation. Everything else: buy the bandwidth.',
    fns: [15, 14],
  },
];

/** ms each scene stays on screen during autoplay. */
export const SCENE_DURATION = 11000;