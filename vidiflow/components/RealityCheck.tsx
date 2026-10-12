'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FOOTNOTES } from '@/lib/catalog';
import { REALITY_SCENES, SCENE_DURATION, type Scene } from '@/lib/realitycheck';

const TONE: Record<string, { fill: string; text: string; glow: string }> = {
  apple: { fill: 'var(--purple)', text: '#ddd6fe', glow: 'rgba(167,139,250,0.35)' },
  nvidia: { fill: 'var(--emerald)', text: '#a7f3d0', glow: 'rgba(52,211,153,0.35)' },
  neutral: { fill: 'var(--cyan)', text: '#a5f3fc', glow: 'rgba(34,211,238,0.3)' },
  warn: { fill: 'var(--amber)', text: '#fde68a', glow: 'rgba(251,191,36,0.35)' },
};

function Fn({ n }: { n: number }) {
  const f = FOOTNOTES[n];
  if (!f) return null;
  return (
    <a
      href={f.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mono"
      style={{ color: 'var(--cyan)', fontSize: '0.62rem', verticalAlign: 'super' }}
      title={f.label}
    >
      [{n}]
    </a>
  );
}

function Bars({ scene }: { scene: Scene }) {
  const bars = scene.bars ?? [];
  const max = useMemo(() => Math.max(...bars.map((b) => b.value), 1), [bars]);
  return (
    <div style={{ display: 'grid', gap: '0.85rem', marginBlockStart: '1.1rem' }}>
      {bars.map((b, i) => {
        const tone = TONE[b.tone] ?? TONE.neutral;
        const pct = Math.max((b.value / max) * 100, 2);
        return (
          <div key={b.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: '0.75rem',
                marginBlockEnd: '0.3rem',
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                {b.label}
              </span>
              <span className="mono tabular" style={{ fontSize: '0.82rem', color: tone.text, fontWeight: 700 }}>
                {b.display}
              </span>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 999,
                background: 'rgba(2,6,23,0.7)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${tone.fill}, ${tone.text})`,
                  boxShadow: `0 0 14px ${tone.glow}`,
                  transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${i * 90}ms`,
                }}
              />
            </div>
            {b.sub && (
              <p className="faint" style={{ marginBlockStart: '0.25rem' }}>
                {b.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Always-visible reference. Exists so the detail is readable without watching. */
function Reference() {
  const rows: Array<[string, string, string, string, string]> = [
    ['Qwen3.8-27B · 27B dense', '60 tok/s', '48 tok/s', '~59 vs ~48 tok/s measured', '16'],
    ['Qwen3.8-Flash-Next · 6B active', '119 tok/s', '135 tok/s', 'MoE — not comparable to dense', '18'],
    ['Llama 3.3 70B · 70B dense', 'not published', '21 tok/s', 'single-device MLX path', '16'],
    ['Concurrent serving', '381 agg / 24 per user', 'not published', 'MoE sparsity collapses', '19'],
  ];
  return (
    <details style={{ marginBlockStart: '1rem', borderTop: '1px solid var(--surface-border)', paddingBlockStart: '0.9rem' }}>
      <summary
        style={{
          cursor: 'pointer',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: 'var(--cyan)',
          listStyle: 'revert',
        }}
      >
        The full numbers, and how to check them yourself
      </summary>
      <div style={{ overflowX: 'auto', marginBlockStart: '0.85rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: 560 }}>
          <thead>
            <tr>
              {['Workload', 'RTX 5090', 'M5 Ultra', 'What it actually tells you', 'Src'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '0.45rem 0.6rem',
                    borderBottom: '1px solid var(--surface-border)',
                    color: 'var(--text-2)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td style={{ padding: '0.45rem 0.6rem', borderBottom: '1px solid rgba(148,163,184,0.08)', whiteSpace: 'nowrap' }}>
                  {r[0]}
                </td>
                <td className="tabular" style={{ padding: '0.45rem 0.6rem', color: 'var(--emerald)', whiteSpace: 'nowrap' }}>{r[1]}</td>
                <td className="tabular" style={{ padding: '0.45rem 0.6rem', color: 'var(--purple)', whiteSpace: 'nowrap' }}>{r[2]}</td>
                <td className="faint" style={{ padding: '0.45rem 0.6rem' }}>{r[3]}</td>
                <td style={{ padding: '0.45rem 0.6rem' }}>
                  <Fn n={Number(r[4])} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="faint" style={{ marginBlockStart: '0.9rem', fontSize: '0.76rem' }}>
        Before you accept anyone&rsquo;s number &mdash; including this one &mdash; you must match all six of these. If any
        differs, the comparison is meaningless:
      </p>
      <ol className="faint" style={{ marginBlockStart: '0.5rem', paddingInlineStart: '1.2rem', fontSize: '0.76rem', display: 'grid', gap: '0.25rem' }}>
        <li><strong>Dense or MoE</strong>, and if MoE, the <em>active</em> parameter count &mdash; not the total.</li>
        <li><strong>Speculation depth</strong> (MTP on/off, draft depth, acceptance rate).</li>
        <li><strong>Quantization</strong> &mdash; Q4_K_M, Q5_K_XL, Q6, IQ4_NL and oQ6e are not the same bytes.</li>
        <li><strong>Context length</strong> &mdash; decode falls off a cliff past 128K.</li>
        <li><strong>Batch size</strong> &mdash; single-stream vs aggregate. They differ by multiples.</li>
        <li><strong>Engine and version</strong> &mdash; two years of llama.cpp work is worth ~25% on its own.</li>
      </ol>
    </details>
  );
}

export default function RealityCheck() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number>(0);
  const scene = REALITY_SCENES[i];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      setReduced(mq.matches);
      if (mq.matches) setPlaying(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const go = useCallback((next: number) => {
    setI((next + REALITY_SCENES.length) % REALITY_SCENES.length);
    setProgress(0);
    start.current = 0;
  }, []);

  // Autoplay driven by rAF so it stays in sync with real time.
  useEffect(() => {
    if (!playing || reduced) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    if (!start.current) start.current = performance.now();
    const tick = (now: number) => {
      const t = now - start.current;
      if (t >= SCENE_DURATION) {
        go(i + 1);
        raf.current = requestAnimationFrame((n) => {
          start.current = n;
          tick(n);
        });
        return;
      }
      setProgress(t / SCENE_DURATION);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, reduced, i, go]);

  // Keyboard control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (e.key === 'ArrowRight') { setPlaying(false); go(i + 1); }
      else if (e.key === 'ArrowLeft') { setPlaying(false); go(i - 1); }
      else if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); start.current = performance.now(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, go]);

  return (
    <section
      className="glass card"
      style={{ marginBlockStart: '1.25rem', overflow: 'hidden' }}
      aria-label="Reality check: what 1.2 TB/s actually buys"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="eyebrow">Buyer beware</p>
          <h2 style={{ fontSize: '1.05rem', margin: '0.3rem 0 0' }}>
            &ldquo;1.2 TB/s&rdquo; is not what you are buying
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            className="chip"
            onClick={() => { setPlaying((p) => !p); start.current = performance.now(); }}
            aria-label={playing ? 'Pause explainer' : 'Play explainer'}
          >
            {playing ? '❚❚ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* stage */}
      <div
        style={{
          marginBlockStart: '1rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--surface-border)',
          background: 'linear-gradient(160deg, rgba(30,41,59,0.5), rgba(2,6,23,0.6))',
          padding: 'clamp(1.1rem, 3vw, 1.9rem)',
          minHeight: 300,
        }}
      >
        <div key={scene.id} style={{ animation: reduced ? undefined : 'rcFade 520ms ease both' }}>
          <p className="eyebrow" style={{ color: 'var(--gold)' }}>
            {scene.kicker}
            {scene.isClaim && (
              <span
                className="mono"
                style={{
                  marginInlineStart: '0.5rem',
                  color: 'var(--amber)',
                  border: '1px solid rgba(251,191,36,0.35)',
                  borderRadius: 999,
                  padding: '0.05rem 0.4rem',
                  fontSize: '0.58rem',
                  letterSpacing: '0.08em',
                }}
              >
                SPEC / MARKETING
              </span>
            )}
          </p>

          <h3
            style={{
              fontSize: 'clamp(1.15rem, 0.9rem + 1vw, 1.7rem)',
              marginBlock: '0.45rem 0.6rem',
              letterSpacing: '-0.01em',
            }}
          >
            {scene.headline}
          </h3>

          <p className="muted" style={{ fontSize: '0.92rem', maxWidth: '68ch' }}>
            {scene.body}
          </p>

          {scene.stat && (
            <div style={{ marginBlockStart: '1rem' }}>
              <div
                className="tabular"
                style={{
                  fontSize: 'clamp(2rem, 1.4rem + 2.4vw, 3.2rem)',
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(90deg, var(--gold), var(--amber))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {scene.stat.value}
              </div>
              <p style={{ fontSize: '0.9rem', marginBlockStart: '0.35rem' }}>{scene.stat.label}</p>
              {scene.stat.note && (
                <p className="faint" style={{ marginBlockStart: '0.2rem' }}>{scene.stat.note}</p>
              )}
            </div>
          )}

          {scene.bars && <Bars scene={scene} />}

          {scene.verdict && (
            <p
              style={{
                marginBlockStart: '1.1rem',
                padding: '0.6rem 0.85rem',
                borderInlineStart: '3px solid var(--gold)',
                background: 'rgba(251,191,36,0.07)',
                borderRadius: '0 10px 10px 0',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              {scene.verdict}
            </p>
          )}

          <p className="faint" style={{ marginBlockStart: '0.9rem' }}>
            Sources:{' '}
            {scene.fns.map((n) => (
              <span key={n}>
                <Fn n={n} />{' '}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* transport */}
      <div style={{ marginBlockStart: '0.9rem' }}>
        <div
          style={{ height: 3, borderRadius: 999, background: 'rgba(148,163,184,0.16)', overflow: 'hidden' }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={REALITY_SCENES.length}
          aria-valuenow={i + 1}
          aria-label={`Scene ${i + 1} of ${REALITY_SCENES.length}`}
        >
          <div
            style={{
              height: '100%',
              width: `${((i + progress) / REALITY_SCENES.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--gold), var(--amber))',
              transition: playing && !reduced ? 'none' : 'width 200ms linear',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            marginBlockStart: '0.65rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {REALITY_SCENES.map((s, n) => (
            <button
              key={s.id}
              className="chip"
              aria-pressed={n === i}
              onClick={() => { setPlaying(false); go(n); }}
              style={{ fontSize: '0.68rem', padding: '0.28rem 0.55rem' }}
            >
              {n + 1}. {s.kicker}
            </button>
          ))}
          <span className="faint" style={{ marginInlineStart: 'auto' }}>
            {i + 1} / {REALITY_SCENES.length} · ← → to step, space to play
          </span>
        </div>
      </div>

      <style>{`
        @keyframes rcFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>

      <Reference />
    </section>
  );
}