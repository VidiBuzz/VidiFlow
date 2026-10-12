// Model catalog + quantization math.
// Anchors: repo precedent (qwen3.5.hardware.html), AI KIZAI measured M3 Ultra data
// (Qwen3.5 397B-A17B 4-bit = 208.5 GiB on disk, 38.1 tok/s decode), plan §4.

export type QuantId = 'fp16' | 'fp8' | 'q4';

export interface Quant {
  id: QuantId;
  name: string;
  bytesPerParam: number;
}

export const QUANTS: Quant[] = [
  { id: 'fp16', name: 'FP16 / BF16', bytesPerParam: 2.0 },
  { id: 'fp8', name: 'FP8', bytesPerParam: 1.0 },
  { id: 'q4', name: 'Q4_K_M (≈4.5-bit)', bytesPerParam: 0.56 },
];

export interface ModelDef {
  id: string;
  name: string;
  paramsB: number;
  /** Active parameters for MoE decode math (== params for dense models). */
  activeParamsB: number;
  /** KV-cache bytes per token at FP16, in MB (GQA constant, family-specific). */
  kvMBPerTok: number;
  defaultQuant: QuantId;
  isMoE: boolean;
  note: string;
  fn: number;
}

export const MODELS: ModelDef[] = [
  {
    id: 'qwen38-27b',
    name: 'Qwen 3.8 27B (Local Workhorse)',
    paramsB: 27,
    activeParamsB: 27,
    kvMBPerTok: 0.25,
    defaultQuant: 'q4',
    isMoE: false,
    note: '100% local workhorse: 17.1 GB weights (Q4_K_M) + KV fits inside a single 24 GB card (RTX 3090/4090). 0.25 MB/tok FP16 KV cache.',
    fn: 13,
  },
  {
    id: 'qwen35-35b',
    name: 'Qwen 3.5 35B',
    paramsB: 35,
    activeParamsB: 35,
    kvMBPerTok: 0.26,
    defaultQuant: 'fp16',
    isMoE: false,
    note: 'Repo dev-model precedent (GQA, ~64 layers × 8 KV heads × 128 head_dim → 0.26 MB/token FP16, est.).',
    fn: 13,
  },
  {
    id: 'qwen35-110b',
    name: 'Qwen 3.5 110B',
    paramsB: 110,
    activeParamsB: 110,
    kvMBPerTok: 0.33,
    defaultQuant: 'q4',
    isMoE: false,
    note: 'Repo production-model precedent; Q4 fits a single 96 GB GPU.',
    fn: 13,
  },
  {
    id: 'llama-70b',
    name: 'Llama-class 70B',
    paramsB: 70,
    activeParamsB: 70,
    kvMBPerTok: 0.31,
    defaultQuant: 'q4',
    isMoE: false,
    note: '80 layers, GQA 8 KV heads — the classic 0.31 MB/token FP16 KV constant.',
    fn: 13,
  },
  {
    id: 'qwen35-397b',
    name: 'Qwen3.5 397B-A17B (MoE)',
    paramsB: 397,
    activeParamsB: 17,
    kvMBPerTok: 0.15,
    defaultQuant: 'q4',
    isMoE: true,
    note: 'MoE: capacity math uses all 397B params; decode bandwidth math uses ~17B active. Measured 38.1 tok/s on M3 Ultra 512 GB (4-bit MLX); 10.5–13 tok/s on a 2-node Strix Halo cluster.',
    fn: 13,
  },
];

export const modelById = (id: string): ModelDef | undefined =>
  MODELS.find((m) => m.id === id);
export const quantById = (id: QuantId): Quant | undefined =>
  QUANTS.find((q) => q.id === id);

/** Allocated weight bytes: params × bytesPerParam × 1.1 overhead (optimizer/runtime buffers). */
export function weightsGB(model: ModelDef, quant: Quant): number {
  return model.paramsB * quant.bytesPerParam * 1.1;
}

/** Bytes actually streamed per decode step for active experts (no alloc overhead). */
export function activeWeightsGB(model: ModelDef, quant: Quant): number {
  return model.activeParamsB * quant.bytesPerParam;
}

/** KV cache for `users` concurrent users at `contextK` thousand tokens (FP16). */
export function kvGB(model: ModelDef, contextK: number, users: number): number {
  return (model.kvMBPerTok * contextK * 1000 * users) / 1024;
}

export const CONTEXT_OPTIONS = [4, 8, 16, 32, 64, 128];
export const USER_OPTIONS = [1, 2, 4, 8, 16, 32];