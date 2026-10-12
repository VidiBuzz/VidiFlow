// Verified hardware catalog — every entry carries a footnote to a primary source.
// Verified Sept 2026 against: NVIDIA Blackwell technical brief, NVIDIA Rubin dev blog
// (2026-07-21), AMD Threadripper PRO white paper + 9000 WX spec page, AMD MI355X page,
// Apple Mac Studio tech specs (support.apple.com/en-us/122211), Tom's Hardware unified-memory study.

export type MemType =
  | 'hbm3'
  | 'hbm3e'
  | 'hbm4'
  | 'gddr7'
  | 'gddr6x'
  | 'gddr6'
  | 'lpddr5x'
  | 'ddr5'
  | 'link'
  | 'net';

export type AccelKind = 'gpu' | 'unified';

export interface Accelerator {
  id: string;
  name: string;
  kind: AccelKind;
  memType: MemType;
  poolGB: number;
  bandwidthGBs: number;
  /** Dense clamp estimate used only for compute-bound checks (TFLOPS). */
  tflops: number;
  price: number;
  note: string;
  fn: number;
}

export interface MemOption {
  gb: number;
  priceAdd: number;
}

export interface Platform {
  id: string;
  name: string;
  short: string;
  /** Host memory bandwidth (GB/s) for CPU-side inference / unified pool. */
  cpuBandwidthGBs: number;
  memType: MemType;
  cpuTflops: number;
  maxDiscreteSlots: number;
  /** Unified-SoC accelerators (Mac / Strix / Spark) place this in slot 1 and take no GPUs. */
  builtInAccelerator?: string;
  /** NVLink/NVSwitch fabric between all slots (NVL server). */
  nvlinkFabric: boolean;
  /** Distinct machines cluster over a network (2-node Strix Halo style). */
  separateNodes: boolean;
  pcieGen: 4 | 5 | 6;
  basePrice: number;
  memOptions: MemOption[];
  note: string;
  fn: number;
}

export interface LinkTier {
  id: string;
  name: string;
  bandwidthGBs: number;
  memType: MemType;
  color: string;
  note: string;
  fn: number;
}

export const FOOTNOTES: Record<number, { label: string; url: string }> = {
  1: {
    label: 'NVIDIA Blackwell Architecture Technical Brief (B200: up to 192 GB HBM3e @ 8 TB/s; NVLink 5 = 1.8 TB/s; PCIe Gen5 x16 = 128 GB/s bidirectional)',
    url: 'https://resources.nvidia.com/en-us-blackwell-architecture',
  },
  2: {
    label: 'NVIDIA Technical Blog, “Inside NVIDIA Rubin GPU Architecture” (Jul 21 2026): 288 GB HBM4 @ 22 TB/s per GPU, NVLink 6 = 3.6 TB/s, PCIe Gen6 x16',
    url: 'https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/',
  },
  3: {
    label: 'AMD Ryzen Threadripper PRO 7000 WX-Series white paper: 8ch × DDR5-5200 = 332.8 GB/s peak (8 DIMMs, 1 DPC)',
    url: 'https://www.amd.com/content/dam/amd/en/documents/products/processors/ryzen-threadripper/amd-ryzen-threadripper-pro-workstation-raising-the-bar-white-paper.pdf',
  },
  4: {
    label: 'AMD Threadripper PRO 9000 WX specs: 8 channels, DDR5-6400 RDIMM, up to 2 TB (409.6 GB/s = 8ch × 6400 MT/s × 8 B, arithmetic)',
    url: 'https://www.amd.com/en/products/processors/workstations/ryzen-threadripper/9000-wx-series/amd-ryzen-threadripper-pro-9995wx.html',
  },
  5: {
    label: 'Apple Mac Studio (2025) Tech Specs: M3 Ultra = 819 GB/s, 96–512 GB unified memory',
    url: 'https://support.apple.com/en-us/122211',
  },
  6: {
    label: "Tom's Hardware, Apple Silicon local-AI study (Jul 2026): M4 Max 410/546 GB/s, DGX Spark GB10 273 GB/s, Strix Halo AI Max+ 395 256 GB/s",
    url: 'https://www.tomshardware.com/desktops/exploring-apple-silicons-local-ai-performance-with-the-mac-studio-and-m4-max-m4-max-beats-gb10-and-strix-halo-in-decode-throughput-but-memory-bandwidth-isnt-everything',
  },
  7: {
    label: 'AMD Instinct MI355X spec page: 288 GB HBM3E, 8 TB/s peak memory bandwidth',
    url: 'https://www.amd.com/en/products/accelerators/instinct/mi350/mi355x.html',
  },
  8: {
    label: 'NVIDIA RTX PRO 6000 Blackwell Workstation Edition: 96 GB GDDR7, 1792 GB/s, 512-bit, PCIe 5.0',
    url: 'https://www.nvidia.com/en-us/products/workstations/professional-desktop-gpus/rtx-pro-6000/',
  },
  9: {
    label: 'NVIDIA H100 product page: 80 GB HBM3, 3.35 TB/s (SXM)',
    url: 'https://www.nvidia.com/en-us/data-center/h100/',
  },
  10: {
    label: 'NVIDIA Vera Rubin NVL72 scale-up blog (May 2026): 1.6 PB/s aggregate HBM4 bandwidth per rack',
    url: 'https://developer.nvidia.com/blog/how-the-nvidia-vera-rubin-platform-is-solving-agentic-ais-scale-up-problem/',
  },
  11: {
    label: 'UALink Consortium — 3.6 TB/s accelerator interconnect spec target',
    url: 'https://ualinkconsortium.org/',
  },
  12: {
    label: 'NVIDIA InfiniBand — NDR 400 Gb/s = 50 GB/s per direction',
    url: 'https://www.nvidia.com/en-us/networking/infiniband/',
  },
  13: {
    label: 'AI KIZAI measured benchmarks, Mac Studio M3 Ultra 512 GB (Jul 2026): Qwen3.5 397B-A17B 4-bit = 38.1 tok/s decode — sim anchor',
    url: 'https://ai-kizai.com/benchmarks/512gb',
  },
  14: {
    label: 'GeForce RTX 5090: 32 GB GDDR7, 1792 GB/s (512-bit, 28 Gbps)',
    url: 'https://www.nvidia.com/en-us/geforce/rtx-5090/',
  },
  15: {
    label:
      'Apple M5 Ultra / Mac Studio refresh launch (Aug 25 2026): quad-die, 4.4 TB/s die interconnect, unified RAM bandwidth to 1.2 TB/s (+50% over M3 Ultra), up to 512 GB, from $5,499. Interconnect is die-to-die and is NOT the same as memory bandwidth.',
    url: 'https://wccftech.com/apple-m5-ultra-mac-studio-refresh-quad-die-chip/',
  },
  16: {
    label:
      'MacStories M5 Ultra review, apples-to-apples llama.cpp test: Qwen3.8 27B decode — RTX 5090 = 59 tok/s vs M5 Ultra = 48 tok/s; prompt read 3,031 vs 1,701 tok/s. The 5090 leads while the model fits in 32 GB; past that it must fall back to system RAM.',
    url: 'https://llamaperf.com/blog/m5-ultra-mac-studio-local-llm',
  },
  17: {
    label:
      'Per-pin data rates: GDDR7 32–48 Gbps/pin (128–192 GB/s per 32-bit device) vs LPDDR5X 6.4–9.6 Gbps/pin (~34 GB/s per 32-bit device). Equal terabytes-per-second totals come from very different underlying fabrics — LPDDR5X trades latency and sustained throughput for energy efficiency.',
    url: 'https://www.rambus.com/blogs/all-you-need-to-know-about-gddr7/',
  },
  18: {
    label:
      'Qwen3.8-Flash-Next model card: 125B language-model parameters with 6B activated per token, plus a 51B n-gram embedding table and a 4B MTP head; 512 MoE experts with 10 routed + 1 shared active. The "125B" headline counts parameters that do no arithmetic on a given token.',
    url: 'https://huggingface.co/Qwen/Qwen3.8-Flash-Next',
  },
  19: {
    label:
      'Single-card MoE vs dense throughput sweep (Radeon AI PRO R9700, vLLM 0.16, AWQ 4-bit, May 2026): dense 14B = 7.5 tok/s single-stream vs 30B/3B-active MoE = 51 tok/s single-stream; at 16 concurrent users the MoE holds 381 tok/s aggregate but only 24 tok/s per user. Peer-reviewed follow-up (Lynx, SC\u201926) finds MoE decode degrades 1.7\u20133\u00d7 versus a small dense model as batch size rises, because activated parameters grow toward total parameters.',
    url: 'https://deepindeepsea.github.io/r9700-vllm-blogs/part2-r9700-moe-and-concurrency.html',
  },
  20: {
    label:
      'Unified-memory contention in practice: on an M5 Ultra 256 GB, launching a second copy of a loaded model caused swapping and dropped decode from 100.2 to 12 tok/s. A discrete GPU has dedicated VRAM and no competing consumer for it.',
    url: 'https://llamaperf.com/gpu/m5-ultra-256gb',
  },
};

export const ACCELERATORS: Accelerator[] = [
  {
    id: 'rubin-r200',
    name: 'Vera Rubin R200',
    kind: 'gpu',
    memType: 'hbm4',
    poolGB: 288,
    bandwidthGBs: 22000,
    tflops: 12500,
    price: 40000,
    note: 'HBM4, 2H2026 — 288 GB @ 22 TB/s per GPU; NVL72 rack aggregates 1.6 PB/s.',
    fn: 2,
  },
  {
    id: 'b200',
    name: 'NVIDIA B200 (HGX)',
    kind: 'gpu',
    memType: 'hbm3e',
    poolGB: 192,
    bandwidthGBs: 8000,
    tflops: 4500,
    price: 35000,
    note: 'Blackwell: up to 192 GB HBM3e @ 8 TB/s; NVLink 5 between GPUs.',
    fn: 1,
  },
  {
    id: 'mi355x',
    name: 'AMD Instinct MI355X',
    kind: 'gpu',
    memType: 'hbm3e',
    poolGB: 288,
    bandwidthGBs: 8000,
    tflops: 5000,
    price: 35000,
    note: '288 GB HBM3E @ 8 TB/s; 160 GB/s bidirectional Infinity Fabric per GPU pair.',
    fn: 7,
  },
  {
    id: 'h100',
    name: 'NVIDIA H100 SXM',
    kind: 'gpu',
    memType: 'hbm3',
    poolGB: 80,
    bandwidthGBs: 3350,
    tflops: 1979,
    price: 25000,
    note: 'The prior-generation datacenter baseline: 80 GB HBM3 @ 3.35 TB/s.',
    fn: 9,
  },
  {
    id: 'rtx6000pro',
    name: 'RTX PRO 6000 Blackwell',
    kind: 'gpu',
    memType: 'gddr7',
    poolGB: 96,
    bandwidthGBs: 1792,
    tflops: 1000,
    price: 4500,
    note: '96 GB GDDR7 @ 1792 GB/s (512-bit). The Sovereign Node engine.',
    fn: 8,
  },
  {
    id: 'rtx5090',
    name: 'GeForce RTX 5090',
    kind: 'gpu',
    memType: 'gddr7',
    poolGB: 32,
    bandwidthGBs: 1792,
    tflops: 838,
    price: 2300,
    note: '32 GB GDDR7 @ 1792 GB/s (512-bit, 28 Gbps). Same bandwidth, a third of the VRAM.',
    fn: 14,
  },
  {
    id: 'rtx4090',
    name: 'GeForce RTX 4090',
    kind: 'gpu',
    memType: 'gddr6x',
    poolGB: 24,
    bandwidthGBs: 1008,
    tflops: 165,
    price: 2000,
    note: '24 GB GDDR6X @ 1008 GB/s — still a strong decode-per-dollar pick.',
    fn: 14,
  },
  {
    id: 'rtx5080',
    name: 'GeForce RTX 5080',
    kind: 'gpu',
    memType: 'gddr7',
    poolGB: 16,
    bandwidthGBs: 960,
    tflops: 468,
    price: 1300,
    note: '16 GB GDDR7 @ 960 GB/s.',
    fn: 14,
  },
  {
    id: 'rtx4060ti16',
    name: 'GeForce RTX 4060 Ti 16 GB',
    kind: 'gpu',
    memType: 'gddr6',
    poolGB: 16,
    bandwidthGBs: 288,
    tflops: 88,
    price: 450,
    note: '16 GB @ 288 GB/s (128-bit) — the floor of the GDDR ladder.',
    fn: 14,
  },
  {
    id: 'm5-ultra',
    name: 'Mac Studio M5 Ultra',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 512,
    bandwidthGBs: 1200,
    tflops: 36,
    price: 5499,
    note: '256–512 GB unified LPDDR5X @ 1.2 TB/s peak. Quad-die; the second die idles unless you shard it explicitly.',
    fn: 15,
  },
  {
    id: 'm3-ultra',
    name: 'Mac Studio M3 Ultra',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 512,
    bandwidthGBs: 819,
    tflops: 33,
    price: 9499,
    note: '96–512 GB unified LPDDR5X @ 819 GB/s (768-bit). Measured ~75–80% of peak in MLX studies.',
    fn: 5,
  },
  {
    id: 'm4-max',
    name: 'Mac Studio M4 Max',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 128,
    bandwidthGBs: 546,
    tflops: 27,
    price: 4199,
    note: '64–128 GB unified @ 546 GB/s (16-core CPU variant); base 14-core M4 Max = 410 GB/s.',
    fn: 6,
  },
  {
    id: 'gb10-spark',
    name: 'DGX Spark (GB10)',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 128,
    bandwidthGBs: 273,
    tflops: 250,
    price: 4699,
    note: '128 GB LPDDR5X @ 273 GB/s (256-bit). Compute-heavy, bandwidth-light by design.',
    fn: 6,
  },
  {
    id: 'strix-halo',
    name: 'Strix Halo AI Max+ 395',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 128,
    bandwidthGBs: 256,
    tflops: 19,
    price: 2100,
    note: '128 GB LPDDR5X-8000, 256-bit bus = 256 GB/s. The smart-stack sweet spot.',
    fn: 6,
  },
  {
    id: 'strix-duo',
    name: '2× Strix Halo (25 GbE cluster)',
    kind: 'unified',
    memType: 'lpddr5x',
    poolGB: 256,
    bandwidthGBs: 512,
    tflops: 38,
    price: 4400,
    note: 'Two mini-PCs clustered over 25 GbE (512 GB/s aggregate). Measured 10.5–13 tok/s on 397B-class MoE.',
    fn: 6,
  },
];

export const PLATFORMS: Platform[] = [
  {
    id: 'consumer-ddr5',
    name: 'Consumer PC — 2-ch DDR5',
    short: 'Consumer DDR5',
    cpuBandwidthGBs: 89.6,
    memType: 'ddr5',
    cpuTflops: 0.5,
    maxDiscreteSlots: 4,
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 1500,
    memOptions: [
      { gb: 32, priceAdd: 0 },
      { gb: 64, priceAdd: 80 },
      { gb: 96, priceAdd: 200 },
      { gb: 192, priceAdd: 500 },
    ],
    note: '2ch DDR5-5600 = 89.6 GB/s; DDR5-6400 = 102.4; DDR5-8000 (OC) = 128. Cannot reach 200.',
    fn: 3,
  },
  {
    id: 'wrx90-7000wx',
    name: 'WRX90 + TR Pro 7000WX',
    short: 'WRX90 (7000WX)',
    cpuBandwidthGBs: 332.8,
    memType: 'ddr5',
    cpuTflops: 1.5,
    maxDiscreteSlots: 4,
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 10000,
    memOptions: [
      { gb: 256, priceAdd: 0 },
      { gb: 512, priceAdd: 1500 },
      { gb: 1024, priceAdd: 3500 },
      { gb: 2048, priceAdd: 8000 },
    ],
    note: '8ch DDR5-5200 peak 332.8 GB/s (AMD white paper); real-world STREAM ≈ 200–280. 8 DIMMs, 1 DPC.',
    fn: 3,
  },
  {
    id: 'wrx90-9000wx',
    name: 'WRX90 + TR Pro 9000WX',
    short: 'TR Pro 9000WX',
    cpuBandwidthGBs: 409.6,
    memType: 'ddr5',
    cpuTflops: 2.5,
    maxDiscreteSlots: 4,
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 13000,
    memOptions: [
      { gb: 256, priceAdd: 0 },
      { gb: 512, priceAdd: 1500 },
      { gb: 1024, priceAdd: 3500 },
      { gb: 2048, priceAdd: 8000 },
    ],
    note: 'Zen 5: 8ch DDR5-6400 = 409.6 GB/s theoretical (8ch × 6400 MT/s × 8 B).',
    fn: 4,
  },
  {
    id: 'trx50',
    name: 'TRX50 + Threadripper 9000',
    short: 'TRX50',
    cpuBandwidthGBs: 204.8,
    memType: 'ddr5',
    cpuTflops: 1.5,
    maxDiscreteSlots: 4,
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 7000,
    memOptions: [
      { gb: 128, priceAdd: 0 },
      { gb: 256, priceAdd: 900 },
      { gb: 512, priceAdd: 2400 },
    ],
    note: '4-channel DDR5-6400 = 204.8 GB/s theoretical; the budget Threadripper tier.',
    fn: 4,
  },
  {
    id: 'mac-m3-ultra',
    name: 'Mac Studio M3 Ultra',
    short: 'Mac M3 Ultra',
    cpuBandwidthGBs: 819,
    memType: 'lpddr5x',
    cpuTflops: 33,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'm3-ultra',
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 5499,
    memOptions: [
      { gb: 96, priceAdd: 0 },
      { gb: 256, priceAdd: 1500 },
      { gb: 512, priceAdd: 4000 },
    ],
    note: '819 GB/s unified pool, 96–512 GB. One memory, zero PCIe copies.',
    fn: 5,
  },
  {
    id: 'mac-m5-ultra',
    name: 'Mac Studio M5 Ultra',
    short: 'Mac M5 Ultra',
    cpuBandwidthGBs: 1200,
    memType: 'lpddr5x',
    cpuTflops: 36,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'm5-ultra',
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 5499,
    memOptions: [
      { gb: 256, priceAdd: 0 },
      { gb: 512, priceAdd: 1800 },
    ],
    note: '1.2 TB/s unified pool (LPDDR5X peak), up to 512 GB. Capacity leader; not a speed leader — see the reality check.',
    fn: 15,
  },
  {
    id: 'mac-m4-max',
    name: 'Mac Studio M4 Max',
    short: 'Mac M4 Max',
    cpuBandwidthGBs: 546,
    memType: 'lpddr5x',
    cpuTflops: 27,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'm4-max',
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 3499,
    memOptions: [
      { gb: 64, priceAdd: 0 },
      { gb: 128, priceAdd: 700 },
    ],
    note: '546 GB/s (16-core CPU/40-core GPU); the base M4 Max trim is 410 GB/s.',
    fn: 6,
  },
  {
    id: 'strix-halo',
    name: 'Strix Halo mini-PC (AI Max+ 395)',
    short: 'Strix Halo',
    cpuBandwidthGBs: 256,
    memType: 'lpddr5x',
    cpuTflops: 19,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'strix-halo',
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 4,
    basePrice: 2100,
    memOptions: [{ gb: 128, priceAdd: 0 }],
    note: '256 GB/s unified pool in a ~2.1k mini-PC. Pair two over 25 GbE for 397B-class MoE.',
    fn: 6,
  },
  {
    id: 'strix-duo',
    name: 'Strix Halo ×2 (25 GbE cluster)',
    short: 'Strix ×2',
    cpuBandwidthGBs: 512,
    memType: 'lpddr5x',
    cpuTflops: 38,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'strix-duo',
    nvlinkFabric: false,
    separateNodes: true,
    pcieGen: 4,
    basePrice: 4400,
    memOptions: [{ gb: 256, priceAdd: 0 }],
    note: 'Two Strix Halo nodes, 256 GB total, 512 GB/s aggregate — MoE expert routing crosses 25 GbE every token.',
    fn: 6,
  },
  {
    id: 'dgx-spark',
    name: 'NVIDIA DGX Spark (GB10)',
    short: 'DGX Spark',
    cpuBandwidthGBs: 273,
    memType: 'lpddr5x',
    cpuTflops: 250,
    maxDiscreteSlots: 0,
    builtInAccelerator: 'gb10-spark',
    nvlinkFabric: false,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 4699,
    memOptions: [{ gb: 128, priceAdd: 0 }],
    note: '128 GB LPDDR5X @ 273 GB/s. Street price varies by OEM (B&H listed $4,999).',
    fn: 6,
  },
  {
    id: 'nvl-rack',
    name: 'HGX B200 8-GPU server',
    short: 'NVL 8× B200',
    cpuBandwidthGBs: 0,
    memType: 'hbm3e',
    cpuTflops: 0,
    maxDiscreteSlots: 8,
    nvlinkFabric: true,
    separateNodes: false,
    pcieGen: 5,
    basePrice: 50000,
    memOptions: [{ gb: 0, priceAdd: 0 }],
    note: 'NVSwitch fabric: 1.8 TB/s GPU↔GPU (NVLink 5). Rack-scale NVL72 with Rubin reaches 1.6 PB/s aggregate.',
    fn: 10,
  },
];

export const LINK_TIERS: LinkTier[] = [
  {
    id: 'nvlink6',
    name: 'NVLink 6 (Rubin)',
    bandwidthGBs: 3600,
    memType: 'link',
    color: 'var(--gold)',
    note: 'GPU↔GPU scale-up fabric, 3.6 TB/s.',
    fn: 2,
  },
  {
    id: 'nvlink5',
    name: 'NVLink 5',
    bandwidthGBs: 1800,
    memType: 'link',
    color: 'var(--gold)',
    note: 'GPU↔GPU fabric on Blackwell, 1.8 TB/s.',
    fn: 1,
  },
  {
    id: 'ualink',
    name: 'UALink (spec target)',
    bandwidthGBs: 3600,
    memType: 'link',
    color: 'var(--purple)',
    note: 'Open accelerator interconnect target: 3.6 TB/s.',
    fn: 11,
  },
  {
    id: 'pcie6',
    name: 'PCIe 6.0 x16',
    bandwidthGBs: 128,
    memType: 'link',
    color: 'var(--grey)',
    note: '128 GB/s per direction; 256 GB/s bidirectional (Rubin host link).',
    fn: 2,
  },
  {
    id: 'pcie5',
    name: 'PCIe 5.0 x16',
    bandwidthGBs: 64,
    memType: 'link',
    color: 'var(--grey)',
    note: '63–64 GB/s per direction. 128 GB/s is the bidirectional aggregate, not a range.',
    fn: 1,
  },
  {
    id: 'pcie4',
    name: 'PCIe 4.0 x16',
    bandwidthGBs: 32,
    memType: 'link',
    color: 'var(--grey)',
    note: '32 GB/s per direction — the common budget tier.',
    fn: 1,
  },
  {
    id: 'ib-ndr',
    name: 'InfiniBand NDR',
    bandwidthGBs: 50,
    memType: 'net',
    color: 'var(--grey)',
    note: '400 Gb/s = 50 GB/s.',
    fn: 10,
  },
  {
    id: 'net-100gbe',
    name: '100 GbE',
    bandwidthGBs: 12.5,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Line-rate arithmetic.',
    fn: 0,
  },
  {
    id: 'net-50gbe',
    name: '50 GbE (RoCE)',
    bandwidthGBs: 6.25,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Line-rate arithmetic.',
    fn: 0,
  },
  {
    id: 'net-25gbe',
    name: '25 GbE',
    bandwidthGBs: 3.125,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Line-rate arithmetic.',
    fn: 0,
  },
  {
    id: 'net-10gbe',
    name: '10 GbE',
    bandwidthGBs: 1.25,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Line-rate arithmetic.',
    fn: 0,
  },
  {
    id: 'net-1gbe',
    name: '1 GbE',
    bandwidthGBs: 0.125,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Line-rate arithmetic.',
    fn: 0,
  },
  {
    id: 'net-internet',
    name: 'Internet uplink',
    bandwidthGBs: 0.1,
    memType: 'net',
    color: 'var(--grey)',
    note: 'Typical home upload < 1 Gb/s.',
    fn: 0,
  },
];

export const MEM_COLORS: Record<MemType, string> = {
  hbm4: 'var(--gold)',
  hbm3e: 'var(--gold)',
  hbm3: 'var(--gold)',
  gddr7: 'var(--cyan)',
  gddr6x: 'var(--cyan)',
  gddr6: 'var(--cyan-deep)',
  lpddr5x: 'var(--purple)',
  ddr5: 'var(--green)',
  link: 'var(--grey)',
  net: 'var(--text-3)',
};

export const MEM_LABELS: Record<MemType, string> = {
  hbm4: 'HBM4',
  hbm3e: 'HBM3e',
  hbm3: 'HBM3',
  gddr7: 'GDDR7',
  gddr6x: 'GDDR6X',
  gddr6: 'GDDR6',
  lpddr5x: 'LPDDR5X',
  ddr5: 'DDR5',
  link: 'Link',
  net: 'Network',
};

export const accelById = (id: string): Accelerator | undefined =>
  ACCELERATORS.find((a) => a.id === id);
export const platformById = (id: string): Platform | undefined =>
  PLATFORMS.find((p) => p.id === id);
export const linkById = (id: string): LinkTier | undefined =>
  LINK_TIERS.find((l) => l.id === id);