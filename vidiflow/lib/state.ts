// Lab state, presets, and URL share encoding.

import { ACCELERATORS, accelById, LINK_TIERS, PLATFORMS, platformById } from './catalog';
import { CONTEXT_OPTIONS, MODELS, modelById, quantById, USER_OPTIONS, type QuantId } from './models';

export interface LabState {
  /** Accelerator ids per slot; null = empty slot. */
  slots: (string | null)[];
  platform: string;
  memGB: number;
  nic: string;
  model: string;
  quant: QuantId;
  contextK: number;
  users: number;
}

export const DEFAULT_STATE: LabState = {
  slots: ['rtx5090', 'rtx5090', null, null],
  platform: 'consumer-ddr5',
  memGB: 64,
  nic: 'net-1gbe',
  model: 'llama-70b',
  quant: 'q4',
  contextK: 8,
  users: 1,
};

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  state: Partial<LabState>;
}

export const PRESETS: Preset[] = [
  {
    id: 'consumer-pc',
    name: 'Consumer PC',
    blurb: 'DDR5 desktop + 2× RTX 5090 — 70B Q4 at ~60 tok/s',
    state: {
      platform: 'consumer-ddr5',
      slots: ['rtx5090', 'rtx5090', null, null],
      memGB: 64,
      nic: 'net-1gbe',
      model: 'llama-70b',
      quant: 'q4',
      contextK: 8,
      users: 1,
    },
  },
  {
    id: 'strix-halo',
    name: 'Strix Halo mini-PC',
    blurb: '128 GB unified @ 256 GB/s — 70B Q4 at ~5 tok/s',
    state: {
      platform: 'strix-halo',
      slots: [],
      memGB: 128,
      nic: 'net-1gbe',
      model: 'llama-70b',
      quant: 'q4',
      contextK: 8,
      users: 1,
    },
  },
  {
    id: 'strix-duo',
    name: 'Strix ×2 cluster',
    blurb: '2-node Strix Halo — 397B MoE at ~12 tok/s',
    state: {
      platform: 'strix-duo',
      slots: [],
      memGB: 256,
      nic: 'net-25gbe',
      model: 'qwen35-397b',
      quant: 'q4',
      contextK: 8,
      users: 1,
    },
  },
  {
    id: 'mac-m3-ultra',
    name: 'Mac Studio M3 Ultra',
    blurb: '512 GB unified @ 819 GB/s — 397B MoE at ~38 tok/s',
    state: {
      platform: 'mac-m3-ultra',
      slots: [],
      memGB: 512,
      nic: 'net-10gbe',
      model: 'qwen35-397b',
      quant: 'q4',
      contextK: 8,
      users: 1,
    },
  },
  {
    id: 'sovereign',
    name: 'Sovereign Node',
    blurb: 'WRX90 + 2× RTX PRO 6000 — 110B Q4 in one box',
    state: {
      platform: 'wrx90-7000wx',
      slots: ['rtx6000pro', 'rtx6000pro', null, null],
      memGB: 512,
      nic: 'net-10gbe',
      model: 'qwen35-110b',
      quant: 'q4',
      contextK: 16,
      users: 4,
    },
  },
  {
    id: 'nvl-rack',
    name: '8× B200 rack',
    blurb: 'HGX B200 baseboard — 397B MoE for a crowd',
    state: {
      platform: 'nvl-rack',
      slots: ['b200', 'b200', 'b200', 'b200', 'b200', 'b200', 'b200', 'b200'],
      memGB: 0,
      nic: 'ib-ndr',
      model: 'qwen35-397b',
      quant: 'q4',
      contextK: 16,
      users: 32,
    },
  },
];

/** Encode state into a URL query string (compact, shareable). */
export function encodeState(s: LabState): string {
  const p = new URLSearchParams();
  const maxSlots = platformById(s.platform)?.maxDiscreteSlots ?? 4;
  const g = s.slots
    .slice(0, maxSlots)
    .map((x) => x ?? '')
    .join(',');
  if (g) p.set('g', g);
  p.set('p', s.platform);
  if (s.memGB) p.set('m', String(s.memGB));
  p.set('n', s.nic);
  p.set('d', s.model);
  p.set('q', s.quant);
  p.set('c', String(s.contextK));
  p.set('u', String(s.users));
  return p.toString();
}

/** Decode a query string into state, dropping anything the catalog doesn't know. */
export function decodeState(search: string): LabState | null {
  const p = new URLSearchParams(search);
  if (!p.has('p') && !p.has('d')) return null;
  const platform = platformById(p.get('p') ?? '')?.id ?? DEFAULT_STATE.platform;
  const plat = platformById(platform);
  const maxSlots = plat?.maxDiscreteSlots ?? 4;
  let slots: (string | null)[];
  if (plat?.builtInAccelerator) {
    slots = [plat.builtInAccelerator];
  } else {
    const raw = (p.get('g') ?? '').split(',').filter((x) => x !== '');
    slots = raw.slice(0, maxSlots).map((x) => (accelById(x) ? x : null));
    while (slots.length < maxSlots) slots.push(null);
  }
  const memGB = Number(p.get('m'));
  const memOk = plat?.memOptions.some((o) => o.gb === memGB);
  const model = modelById(p.get('d') ?? '')?.id ?? DEFAULT_STATE.model;
  const quant = (['fp16', 'fp8', 'q4'] as QuantId[]).includes(p.get('q') as QuantId)
    ? (p.get('q') as QuantId)
    : DEFAULT_STATE.quant;
  const ctx = Number(p.get('c'));
  const users = Number(p.get('u'));
  return {
    slots,
    platform,
    memGB: memOk ? memGB : (plat?.memOptions[0].gb ?? DEFAULT_STATE.memGB),
    nic: p.get('n') && LINK_TIERS.some((l) => l.id === p.get('n'))
      ? (p.get('n') as string)
      : DEFAULT_STATE.nic,
    model,
    quant,
    contextK: CONTEXT_OPTIONS.includes(ctx) ? ctx : DEFAULT_STATE.contextK,
    users: USER_OPTIONS.includes(users) ? users : DEFAULT_STATE.users,
  };
}

/** Effective accelerator list for the current state. */
export function resolveAccelerators(s: LabState) {
  const plat = platformById(s.platform);
  if (!plat) return [];
  if (plat.builtInAccelerator) {
    const a = accelById(plat.builtInAccelerator);
    return a ? [a] : [];
  }
  return s.slots
    .slice(0, plat.maxDiscreteSlots)
    .map((id) => (id ? accelById(id) : undefined))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
}

export function normalizeSlots(platformId: string, slots: (string | null)[]): (string | null)[] {
  const plat = platformById(platformId);
  const max = plat?.maxDiscreteSlots ?? 4;
  const out = slots.slice(0, max).map((s) => (s && accelById(s) ? s : null));
  while (out.length < max) out.push(null);
  return out;
}

export { ACCELERATORS, PLATFORMS, MODELS };