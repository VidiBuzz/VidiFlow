'use client';

import {
  ACCELERATORS,
  LINK_TIERS,
  MEM_COLORS,
  accelById,
  platformById,
} from '@/lib/catalog';
import { PRESETS, normalizeSlots, type LabState } from '@/lib/state';
import { formatNumber } from '@/lib/sim';

interface Props {
  state: LabState;
  update: (patch: Partial<LabState>) => void;
}

export default function StackConfigurator({ state, update }: Props) {
  const platform = platformById(state.platform);
  if (!platform) return null;
  const builtIn = platform.builtInAccelerator ? accelById(platform.builtInAccelerator) : undefined;

  function switchPlatform(id: string) {
    const next = platformById(id);
    if (!next) return;
    const memGB = next.memOptions.some((o) => o.gb === state.memGB)
      ? state.memGB
      : next.memOptions[0].gb;
    const slots = next.builtInAccelerator ? [] : normalizeSlots(id, state.slots);
    update({ platform: id, memGB, slots });
  }

  function setSlot(i: number, id: string | null) {
    const slots = normalizeSlots(state.platform, [...state.slots]);
    slots[i] = id;
    update({ slots });
  }

  return (
    <section className="glass card" aria-label="Stack configurator">
      <p className="eyebrow">Slot machine</p>
      <h2 style={{ fontSize: '1.05rem', margin: '0.3rem 0 0.6rem' }}>Build your stack</h2>

      <div className="field">
        <span>Presets</span>
        <div className="seg">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              className="chip"
              title={p.blurb}
              onClick={() => {
                const nextPlatform = platformById(p.state.platform ?? state.platform);
                const base: Partial<LabState> = { ...p.state };
                if (nextPlatform) {
                  base.memGB = nextPlatform.memOptions.some((o) => o.gb === p.state.memGB)
                    ? p.state.memGB
                    : (nextPlatform.memOptions.find((o) => o.gb === (p.state.memGB ?? -1))?.gb ??
                      nextPlatform.memOptions[0].gb);
                }
                update(base);
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>
          Platform{' '}
          <sup className="fn">
            <a href={`#fn-${platform.fn}`}>[{platform.fn}]</a>
          </sup>
        </span>
        <select
          value={state.platform}
          onChange={(e) => switchPlatform(e.target.value)}
          aria-label="Platform"
          style={selectStyle}
        >
          {['consumer-ddr5', 'wrx90-7000wx', 'wrx90-9000wx', 'trx50', 'mac-m3-ultra', 'mac-m4-max', 'strix-halo', 'dgx-spark', 'nvl-rack'].map(
            (id) => {
              const p = platformById(id);
              return p ? (
                <option key={id} value={id}>
                  {p.name} — {formatNumber(p.cpuBandwidthGBs, 1)} GB/s
                </option>
              ) : null;
            },
          )}
        </select>
        <p className="faint">{platform.note}</p>
      </div>

      {platform.memOptions.length > 1 && platform.memOptions[0].gb > 0 ? (
        <div className="field">
          <span>Memory</span>
          <div className="seg">
            {platform.memOptions.map((o) => (
              <button
                key={o.gb}
                className="chip"
                aria-pressed={state.memGB === o.gb}
                onClick={() => update({ memGB: o.gb })}
              >
                {formatNumber(o.gb)} GB{o.priceAdd ? ` (+$${formatNumber(o.priceAdd)})` : ''}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {builtIn ? (
        <div className="field">
          <span>Accelerator (built in)</span>
          <div
            className="slot-btn"
            role="img"
            aria-label={`${builtIn.name}: ${builtIn.poolGB} GB, ${builtIn.bandwidthGBs} GB/s`}
            style={{ cursor: 'default' }}
          >
            <span className="slot-name" style={{ color: MEM_COLORS[builtIn.memType] }}>
              {builtIn.name}
            </span>
            <span className="slot-spec tabular">
              {builtIn.poolGB} GB · {formatNumber(builtIn.bandwidthGBs)} GB/s
            </span>
          </div>
        </div>
      ) : (
        <div className="field">
          <span>
            GPU slots ({platform.maxDiscreteSlots}×) — swap any slot
          </span>
          {Array.from({ length: platform.maxDiscreteSlots }, (_, i) => {
            const id = state.slots[i] ?? null;
            const a = id ? accelById(id) : undefined;
            return (
              <label key={i} style={{ display: 'grid', gap: '0.25rem', marginBlockStart: '0.45rem' }}>
                <span className="faint mono">SLOT {i + 1}</span>
                <select
                  value={id ?? ''}
                  onChange={(e) => setSlot(i, e.target.value || null)}
                  aria-label={`GPU slot ${i + 1}`}
                  style={selectStyle}
                >
                  <option value="">— empty —</option>
                  {ACCELERATORS.filter((x) => x.kind === 'gpu').map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name} · {x.poolGB} GB · {formatNumber(x.bandwidthGBs)} GB/s
                    </option>
                  ))}
                </select>
                {a ? <span className="faint">{a.note}</span> : null}
              </label>
            );
          })}
        </div>
      )}

      <div className="field">
        <span>Network</span>
        <select
          value={state.nic}
          onChange={(e) => update({ nic: e.target.value })}
          aria-label="Network interface"
          style={selectStyle}
        >
          {LINK_TIERS.filter((l) => l.memType === 'net').map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} — {formatNumber(l.bandwidthGBs, 3)} GB/s
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.6rem',
  background: 'rgba(2, 6, 23, 0.6)',
  border: '1px solid var(--border-strong)',
  borderRadius: '10px',
  color: 'var(--text)',
};