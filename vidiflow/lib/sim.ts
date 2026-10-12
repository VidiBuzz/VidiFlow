// Pure simulation math — unit-testable, no React. See plan §2.2.
// Anchors validated against public reviews:
//   70B Q4 on RTX 5090 ≈ 40 tok/s · M3 Ultra ≈ 15–18 · Strix Halo ≈ 5–6 ·
//   consumer DDR5 CPU ≈ 2 · Qwen3.5 397B-A17B on M3 Ultra = 38.1 measured (AI KIZAI) ·
//   397B on 2-node Strix Halo = 10.5–13 (Spawning Point).

import { MEM_COLORS, type Accelerator, type MemType, type Platform } from './catalog';
import { type ModelDef } from './models';

/** Real-world achievable fraction of peak bandwidth, per memory type.
 *  Anchored: GDDR7 sequential streaming ~90% of peak; LPDDR5X measured 75–80%
 *  (Tom's Hardware / MLX studies); DDR5 STREAM ≈ 200–280 of 332.8 (~65%). */
const MEM_FACTOR: Record<MemType, number> = {
  hbm4: 0.75,
  hbm3e: 0.75,
  hbm3: 0.75,
  gddr7: 0.9,
  gddr6x: 0.85,
  gddr6: 0.8,
  lpddr5x: 0.76,
  ddr5: 0.65,
  link: 1,
  net: 1,
};

/** MoE routing overhead: only active experts are read per token, but scatter/gather
 *  plus shared-expert and attention reads dilute effective bandwidth (~×0.65). */
const MOE_FACTOR = 0.65;
/** Tensor-parallel across PCIe boards (no NVSwitch fabric) loses ~25% to NCCL chatter. */
const PCIE_TP_FACTOR = 0.75;
/** Separate machines clustering over Ethernet (2-node Strix Halo style): ~50%. */
const NODE_FACTOR = 0.5;
/** NVMe swap bandwidth for unified/CPU pool overflow (est.). */
const SSD_SWAP_GBS = 7;
/** Target interactive decode rate for the "users served" figure. */
export const TARGET_TOK_PER_SEC = 20;
const OS_HEADROOM_GB = 2;
const NCCL_CAPACITY_FACTOR = 0.9;
const PREFILL_EFFICIENCY = 0.55;

export type FitState = 'fits' | 'tight' | 'offload';
export type Binding = 'bandwidth' | 'compute' | 'pcie' | 'storage' | 'network' | null;

export interface ChainStage {
  id: string;
  label: string;
  state: 'ok' | 'warn' | 'binding';
  detail: string;
}

export interface SimResult {
  fit: FitState;
  utilization: number;
  poolGB: number;
  needGB: number;
  weightsAllocGB: number;
  kvCacheGB: number;
  activeBytesGB: number;
  overflowGB: number;
  effBW: number;
  effFactor: number;
  stepsPerSec: number;
  decodeAggregate: number;
  decodePerUser: number;
  prefillAggregate: number;
  usersAtTarget: number;
  binding: Binding;
  chain: ChainStage[];
  verdict: string;
  offload: boolean;
  offloadBW: number | null;
  totalPrice: number;
  pricePerTok: number;
  memColor: string;
  unified: boolean;
}

export const formatNumber = (n: number, digits = 0): string =>
  n.toLocaleString('en-US', { maximumFractionDigits: digits });

export function pcieDirectionalGBs(gen: number): number {
  return gen === 4 ? 32 : gen === 6 ? 128 : 64;
}

function pcieTotalGBs(gen: number): number {
  return pcieDirectionalGBs(gen) * 2;
}

function memAddFor(platform: Platform, memGB: number): number {
  const opt = platform.memOptions.find((m) => m.gb === memGB) ?? platform.memOptions[0];
  return opt.priceAdd;
}

/** Largest user count whose per-user decode stays ≥ target tok/s. */
export function solveUsersAtTarget(
  effBWFactored: number,
  activeBytesGB: number,
  kvPerUserGB: number,
  computeCap: number,
  target: number,
): number {
  const byCompute = Math.floor(computeCap / Math.max(target, 0.001));
  if (kvPerUserGB <= 0) {
    const bwCap =
      effBWFactored / Math.max(activeBytesGB, 0.001) >= target ? Number.POSITIVE_INFINITY : 0;
    return Math.max(Math.min(byCompute, bwCap), 0);
  }
  const bwCap = (effBWFactored / target - activeBytesGB) / kvPerUserGB;
  return Math.max(Math.min(Math.floor(bwCap), byCompute), 0);
}

export function simulate(
  platform: Platform,
  accelerators: Accelerator[],
  memGB: number,
  model: ModelDef,
  bytesPerParam: number,
  contextK: number,
  users: number,
): SimResult {
  const weightsAlloc = model.paramsB * bytesPerParam * 1.1;
  const activeBytes = model.activeParamsB * bytesPerParam;
  const kvCache = (model.kvMBPerTok * contextK * 1000 * users) / 1024;
  const need = weightsAlloc + kvCache + OS_HEADROOM_GB;

  const gpuCount = accelerators.length;

  let poolGB: number;
  let peakBW: number;
  let effFactor: number;
  let offloadBW: number | null = null;

  if (accelerators.length === 0) {
    poolGB = memGB;
    peakBW = platform.cpuBandwidthGBs;
    effFactor = MEM_FACTOR[platform.memType];
  } else if (accelerators[0].kind === 'unified') {
    poolGB = memGB;
    peakBW = accelerators[0].bandwidthGBs;
    effFactor =
      MEM_FACTOR[accelerators[0].memType] *
      (model.isMoE ? MOE_FACTOR : 1) *
      (platform.separateNodes ? NODE_FACTOR : 1);
  } else {
    poolGB = accelerators.reduce((s, a) => s + a.poolGB, 0);
    if (gpuCount > 1) poolGB *= NCCL_CAPACITY_FACTOR;
    peakBW = accelerators.reduce((s, a) => s + a.bandwidthGBs, 0);
    const multiFactor = platform.nvlinkFabric
      ? 1.0
      : platform.separateNodes
        ? NODE_FACTOR
        : gpuCount > 1
          ? PCIE_TP_FACTOR
          : 1;
    effFactor =
      MEM_FACTOR[accelerators[0].memType] * (model.isMoE ? MOE_FACTOR : 1) * multiFactor;
  }

  const computeTflopsTotal =
    accelerators.length === 0
      ? platform.cpuTflops
      : accelerators.reduce((s, a) => s + a.tflops, 0);
  const computeCap =
    computeTflopsTotal > 0
      ? (computeTflopsTotal * 1e12) / (2 * model.activeParamsB * 1e9)
      : Number.POSITIVE_INFINITY;

  const offload = need > poolGB + 0.01;
  if (offload) {
    const offloadDevice =
      accelerators.length === 0 || accelerators[0].kind === 'unified';
    offloadBW = offloadDevice ? SSD_SWAP_GBS : pcieTotalGBs(platform.pcieGen) / 2;
  }

  const effectiveBW = offload ? (offloadBW as number) : peakBW;
  const bytesPerStep = model.activeParamsB * bytesPerParam + kvCache;
  const stepsPerSec = (effectiveBW * effFactor) / Math.max(bytesPerStep, 0.001);
  const decodeAggregate = Math.min(stepsPerSec * users, computeCap);
  const decodePerUser = Math.min(stepsPerSec, computeCap / users);
  const prefillAggregate =
    Number.isFinite(computeCap) ? computeCap * PREFILL_EFFICIENCY : 0;

  const bwBound = stepsPerSec * users <= computeCap;
  const binding: Binding = offload
    ? accelerators.length === 0 || accelerators[0].kind === 'unified'
      ? 'storage'
      : 'pcie'
    : bwBound
      ? 'bandwidth'
      : 'compute';

  const totalPrice =
    platform.basePrice +
    memAddFor(platform, memGB) +
    accelerators.filter((a) => a.kind === 'gpu').reduce((s, a) => s + a.price, 0);
  const pricePerTok = decodeAggregate > 0 ? totalPrice / decodeAggregate : Number.POSITIVE_INFINITY;
  const utilization = Math.min((need / Math.max(poolGB, 0.001)) * 100, 400);
  const unified = accelerators.length === 0 || accelerators[0].kind === 'unified';

  const chain = buildChain({
    platform,
    gpuCount,
    unified,
    need,
    poolGB,
    offload,
    binding,
    effBW: effectiveBW,
    decodePerUser,
    model,
  });

  const verdict = buildVerdict({
    offload,
    binding,
    decodePerUser,
    effectiveBW,
    activeBytes: model.activeParamsB * bytesPerParam,
    overflowGB: Math.max(need - poolGB, 0),
    unified,
    model,
    prefillAggregate,
  });

  const usersAtTarget = solveUsersAtTarget(
    effectiveBW * effFactor,
    model.activeParamsB * bytesPerParam,
    (model.kvMBPerTok * contextK * 1000) / 1024,
    computeCap,
    TARGET_TOK_PER_SEC,
  );

  return {
    fit: offload ? 'offload' : need > poolGB * 0.85 ? 'tight' : 'fits',
    utilization,
    poolGB,
    needGB: need,
    weightsAllocGB: weightsAlloc,
    kvCacheGB: kvCache,
    activeBytesGB: model.activeParamsB * bytesPerParam,
    overflowGB: Math.max(need - poolGB, 0),
    effBW: effectiveBW,
    effFactor,
    stepsPerSec,
    decodeAggregate,
    decodePerUser,
    prefillAggregate,
    usersAtTarget,
    binding,
    chain,
    verdict,
    offload,
    offloadBW: offload ? offloadBW : null,
    totalPrice,
    pricePerTok,
    memColor: MEM_COLORS[accelerators.length > 0 ? accelerators[0].memType : platform.memType],
    unified,
  };
}

function buildChain(args: {
  platform: Platform;
  gpuCount: number;
  unified: boolean;
  need: number;
  poolGB: number;
  offload: boolean;
  binding: Binding;
  effBW: number;
  decodePerUser: number;
  model: ModelDef;
}): ChainStage[] {
  const { platform, gpuCount, unified, need, poolGB, offload, binding, effBW, decodePerUser, model } = args;
  const spare = poolGB - need;
  const stages: ChainStage[] = [];
  const f = formatNumber;

  stages.push({
    id: 'vram',
    label: unified ? 'Memory pool' : 'VRAM pool',
    state: offload ? 'binding' : spare < poolGB * 0.15 ? 'warn' : 'ok',
    detail: offload
      ? `${f(need)} GB needed vs ${f(poolGB)} GB pool — ${f(need - poolGB)} GB short`
      : `fits — ${f(Math.max(spare, 0))} GB spare of ${f(poolGB)} GB`,
  });

  stages.push({
    id: 'bandwidth',
    label: 'Bandwidth',
    state: offload ? 'warn' : binding === 'bandwidth' ? 'binding' : 'ok',
    detail: offload
      ? 'weights spilled out — device bandwidth no longer matters'
      : `${f(effBW, 1)} GB/s effective → ${f(decodePerUser, 1)} tok/s per user ceiling`,
  });

  stages.push({
    id: 'compute',
    label: 'Compute (prefill)',
    state: binding === 'compute' ? 'binding' : offload ? 'warn' : 'ok',
    detail:
      binding === 'compute'
        ? 'tensor cores set the pace — bandwidth left on the table'
        : 'prefill is compute-bound; decode waits on memory',
  });

  stages.push({
    id: 'pcie',
    label: 'PCIe links',
    state: binding === 'pcie' ? 'binding' : gpuCount > 1 && !platform.nvlinkFabric ? 'warn' : 'ok',
    detail:
      binding === 'pcie'
        ? `every token now streams over PCIe — ${f(effBW, 0)} GB/s is the pipe`
        : gpuCount > 1
          ? 'tensor-parallel chatter rides PCIe x16 (~64 GB/s per direction) — host RAM is not a VRAM substitute'
          : `x16 Gen ${platform.pcieGen} ≈ ${f(pcieDirectionalGBs(platform.pcieGen), 0)} GB/s per direction`,
  });

  stages.push({
    id: 'network',
    label: 'Network',
    state: platform.separateNodes ? (model.isMoE ? 'binding' : 'warn') : 'ok',
    detail: platform.separateNodes
      ? `${model.isMoE ? 'MoE expert routing' : 'tensor-parallel layers'} cross the network every token`
      : 'not binding — single system',
  });

  return stages;
}

function buildVerdict(args: {
  offload: boolean;
  binding: Binding;
  decodePerUser: number;
  effectiveBW: number;
  activeBytes: number;
  overflowGB: number;
  unified: boolean;
  model: ModelDef;
  prefillAggregate: number;
}): string {
  const { offload, binding, decodePerUser, effectiveBW, activeBytes, overflowGB, unified, model, prefillAggregate } = args;
  const f = formatNumber;
  const tok = f(decodePerUser, 1);

  if (offload) {
    if (unified) {
      return `Your memory pool runs out of room before it runs out of speed — ${f(overflowGB)} GB spills to SSD swap and decode collapses to ~${tok} tok/s. The fix is capacity: a bigger pool or a smaller quant.`;
    }
    return `Your GPU runs out of room before it runs out of speed — ${f(overflowGB)} GB spills over PCIe and decode collapses to ~${tok} tok/s. The fix is capacity: more VRAM (or a smaller quant).`;
  }
  if (binding === 'compute') {
    return `Compute-bound: this model is small enough that the tensor cores, not the memory pipes, set the pace — prefill races at ~${f(prefillAggregate, 0)} tok/s while decode idles at ${tok} tok/s per user.`;
  }
  const where = unified ? 'unified memory' : 'GPUs';
  void model;
  return `Your ${where} run out of speed before they run out of room — ${f(effectiveBW, 0)} GB/s ÷ ${f(activeBytes, 1)} GB of active weights ≈ ${tok} tok/s per user. Bandwidth is the ceiling.`;
}