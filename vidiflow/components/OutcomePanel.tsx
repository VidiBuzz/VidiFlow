'use client';

import { TARGET_TOK_PER_SEC, formatNumber, type SimResult } from '@/lib/sim';

interface Props {
  result: SimResult;
  modelFn: number;
}

const FIT_LABEL: Record<SimResult['fit'], { text: string; color: string }> = {
  fits: { text: 'Fits', color: 'var(--emerald)' },
  tight: { text: 'Tight fit', color: 'var(--amber)' },
  offload: { text: 'Offloads', color: 'var(--red)' },
};

export default function OutcomePanel({ result, modelFn }: Props) {
  const fit = FIT_LABEL[result.fit];
  const arcAngle = Math.min(result.utilization, 150) / 150;
  const price = Math.round(result.totalPrice);
  const ppt = Number.isFinite(result.pricePerTok) ? `$${formatNumber(result.pricePerTok, 2)}` : '—';

  return (
    <section className="glass card rail-outcome" aria-label="Outcome panel">
      {/* THE CENTRAL DISTINCTION: capacity and speed are different questions,
          answered by different hardware, and a machine can win one and lose the
          other. They must never be read as a single verdict. */}
      <div
        style={{
          padding: '0.6rem 0.75rem',
          borderRadius: '10px',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.28)',
          marginBlockEnd: '1rem',
        }}
      >
        <p style={{ fontSize: '0.78rem', lineHeight: 1.45, margin: 0 }}>
          <strong style={{ color: 'var(--gold)' }}>Capacity and speed are two different questions.</strong>{' '}
          <span className="muted">
            Capacity is measured in <strong>GB</strong> — does the model fit at all. Speed is measured in{' '}
            <strong>GB/s</strong> — how fast once it does. A machine can have enormous memory and slow
            bandwidth, or the reverse. Passing the first test tells you nothing about the second.
          </span>
        </p>
      </div>

      {/* ---------- QUESTION 1: CAPACITY ---------- */}
      <p className="eyebrow">
        Question 1 · Capacity <span style={{ opacity: 0.6 }}>— does it fit?</span>
      </p>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBlockStart: '0.4rem' }}>
        <Gauge fraction={arcAngle} color={fit.color} />
        <div>
          <div className="stat-val" style={{ color: fit.color }}>
            {fit.text}
          </div>
          <p className="faint tabular">
            {formatNumber(result.needGB, 1)} GB needed / {formatNumber(result.poolGB, 0)} GB pool ·{' '}
            {formatNumber(result.utilization, 0)}% load
          </p>
        </div>
      </div>

      <p
        style={{
          marginBlockStart: '0.7rem',
          padding: '0.55rem 0.7rem',
          borderInlineStart: `3px solid ${fit.color}`,
          background: 'rgba(2,6,23,0.45)',
          borderRadius: '0 8px 8px 0',
          fontSize: '0.85rem',
        }}
      >
        {result.fit === 'fits'
          ? 'It fits. That is a capacity result only — it says nothing about how fast it will run.'
          : result.fit === 'tight'
            ? 'It barely fits, with no headroom for a second user or a longer context.'
            : 'It does not fit. Speed is now decided by an offload path, not by this memory.'}
      </p>

      <hr
        style={{
          margin: '1.1rem 0 0.9rem',
          border: 'none',
          borderTop: '1px dashed var(--border)',
        }}
      />

      {/* ---------- QUESTION 2: SPEED ---------- */}
      <p className="eyebrow" style={{ color: 'var(--cyan)' }}>
        Question 2 · Speed <span style={{ opacity: 0.6 }}>— how fast?</span>
      </p>

      <p className="verdict" style={{ marginBlockStart: '0.5rem' }}>
        {result.verdict}
      </p>

      <p className="faint" style={{ fontSize: '0.66rem', marginBlockStart: '0.9rem' }}>
        All four figures below are speed results. None of them is a capacity result.
      </p>

      <div className="stat-grid" style={gridStyle}>
        <Stat
          label="Decode / user"
          value={formatNumber(result.decodePerUser, 1)}
          unit="tok/s"
          color={result.binding === 'bandwidth' ? 'var(--cyan)' : undefined}
        />
        <Stat
          label="System decode"
          value={formatNumber(result.decodeAggregate, 0)}
          unit="tok/s"
        />
        <Stat
          label="Prefill"
          value={formatNumber(result.prefillAggregate, 0)}
          unit="tok/s"
        />
        <Stat
          label={`Users at ≥${TARGET_TOK_PER_SEC} tok/s`}
          value={result.usersAtTarget < 0 ? 'dozens' : formatNumber(result.usersAtTarget)}
          unit={result.usersAtTarget >= 0 ? 'users' : ''}
        />
      </div>

      <div className="glass" style={{ padding: '0.85rem 1rem', marginBlockStart: '1rem', borderRadius: '12px' }}>
        <p className="faint mono" style={{ letterSpacing: '0.02em' }}>
          decode tok/s ≈ bandwidth ÷ model bytes
        </p>
        <p className="tabular" style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
          {formatNumber(result.effBW, 0)} GB/s × {formatNumber(result.effFactor, 2)} real-world ÷{' '}
          {formatNumber(result.activeBytesGB, 1)} GB ≈{' '}
          <strong style={{ color: 'var(--cyan)' }}>{formatNumber(result.decodePerUser, 1)} tok/s</strong>
          {result.offload && result.offloadBW
            ? ` — weights stream over ${result.unified ? 'SSD swap' : 'PCIe'} at ${formatNumber(result.offloadBW, 0)} GB/s`
            : ''}
          <sup className="fn">
            <a href={`#fn-${modelFn}`}>[{modelFn}]</a>
          </sup>
        </p>
      </div>

      <div style={{ marginBlockStart: '1rem' }}>
        <p className="eyebrow" style={{ color: 'var(--text-2)' }}>
          Bottleneck chain
        </p>
        <ol style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0', display: 'grid', gap: '0.35rem' }}>
          {result.chain.map((s) => (
            <li
              key={s.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '0.5rem',
                alignItems: 'baseline',
                padding: '0.45rem 0.65rem',
                borderRadius: '10px',
                border: `1px solid ${chainBorder(s.state)}`,
                background:
                  s.state === 'binding'
                    ? 'rgba(248, 113, 113, 0.09)'
                    : s.state === 'warn'
                      ? 'rgba(251, 191, 36, 0.07)'
                      : 'rgba(2, 6, 23, 0.4)',
              }}
            >
              <strong style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{s.label}</strong>
              <span className="faint" style={{ fontSize: '0.72rem' }}>
                {s.detail}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBlockStart: '1.1rem', borderTop: '1px solid var(--border)', paddingTop: '0.8rem' }}>
        <div>
          <p className="faint">Total build (est.)</p>
          <p className="stat-val tabular" style={{ fontSize: '1.4rem' }}>
            ${formatNumber(price)}
          </p>
        </div>
        <div style={{ textAlign: 'end' }}>
          <p className="faint">Price per tok/s</p>
          <p className="tabular mono" style={{ fontWeight: 700, color: 'var(--emerald)' }}>
            {ppt}
          </p>
        </div>
      </div>
    </section>
  );
}

function chainBorder(state: 'ok' | 'warn' | 'binding'): string {
  return state === 'binding'
    ? 'var(--red)'
    : state === 'warn'
      ? 'var(--amber)'
      : 'var(--border)';
}

function Stat({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div>
      <p className="faint" style={{ fontSize: '0.66rem' }}>
        {label}
      </p>
      <p className="stat-val tabular" style={{ fontSize: '1.25rem', color: color ?? 'var(--text)' }}>
        {value}
        {unit ? <span className="faint" style={{ fontSize: '0.7rem', fontWeight: 600 }}> {unit}</span> : null}
      </p>
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '0.7rem',
  marginBlockStart: '0.9rem',
};

/** Semicircular utilization gauge (SVG). */
function Gauge({ fraction, color }: { fraction: number; color: string }) {
  const size = 92;
  const cx = size / 2;
  const cy = 52;
  const r = 38;
  const a = Math.PI * (1 - fraction);
  const needleX = cx + r * 0.82 * Math.cos(a);
  const needleY = cy - r * 0.82 * Math.sin(a);
  const arcPath = (r0: number, frac: number) => {
    const end = Math.PI * (1 - frac);
    const x2 = cx + r0 * Math.cos(end);
    const y2 = cy - r0 * Math.sin(end);
    return `M ${cx - r0} ${cy} A ${r0} ${r0} 0 0 1 ${x2} ${y2}`;
  };
  return (
    <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} 58`} aria-hidden="true">
      <path d={arcPath(r, 1)} fill="none" stroke="var(--border-strong)" strokeWidth={7} strokeLinecap="round" />
      <path d={arcPath(r, Math.max(fraction, 0.02))} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="var(--text)" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={3.5} fill="var(--text)" />
    </svg>
  );
}