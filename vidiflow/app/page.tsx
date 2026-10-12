'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import BandwidthLadder, { buildLadderEntries } from '@/components/BandwidthLadder';
import Infographic from '@/components/Infographic';
import ModelPicker from '@/components/ModelPicker';
import OutcomePanel from '@/components/OutcomePanel';
import StackConfigurator from '@/components/StackConfigurator';
import RealityCheck from '@/components/RealityCheck';
import { FOOTNOTES, platformById } from '@/lib/catalog';
import { modelById, quantById } from '@/lib/models';
import {
  DEFAULT_STATE,
  encodeState,
  decodeState,
  resolveAccelerators,
  type LabState,
} from '@/lib/state';
import { simulate } from '@/lib/sim';

export default function Page() {
  const [state, setState] = useState<LabState>(DEFAULT_STATE);
  const hydrated = useRef(false);

  // Shareable URL state (read once on mount; avoid useSearchParams/Suspense).
  useEffect(() => {
    const decoded = decodeState(window.location.search);
    if (decoded) setState(decoded);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const qs = encodeState(state);
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [state]);

  const update = (patch: Partial<LabState>) => setState((s) => ({ ...s, ...patch }));

  const platform = platformById(state.platform) ?? platformById(DEFAULT_STATE.platform)!;
  const accels = useMemo(() => resolveAccelerators(state), [state]);
  const model = modelById(state.model) ?? modelById(DEFAULT_STATE.model)!;
  const quant = quantById(state.quant)!;

  const result = useMemo(
    () => simulate(platform, accels, state.memGB, model, quant.bytesPerParam, state.contextK, state.users),
    [platform, accels, state.memGB, model, quant, state.contextK, state.users],
  );

  const highlighted = useMemo(() => {
    const set = new Set(accels.map((a) => a.id));
    set.add(state.nic);
    return set;
  }, [accels, state.nic]);

  const rigBW = accels.length
    ? accels.reduce((s, a) => s + a.bandwidthGBs, 0)
    : platform.cpuBandwidthGBs;

  const entries = useMemo(
    () => buildLadderEntries(accels, platform.name, platform.cpuBandwidthGBs, platform.memType, rigBW),
    [accels, platform, rigBW],
  );

  return (
    <main style={{ maxWidth: 1560, marginInline: 'auto', padding: '1.5rem clamp(1rem, 3vw, 2rem) 4rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: '1.25rem' }}>
        <div>
          <p className="eyebrow">VidiSmart · Sovereign AI Node</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 1.1rem + 2.4vw, 2.6rem)', margin: '0.2rem 0 0.2rem' }}>
            Bandwidth Lab
          </h1>
          <p className="muted" style={{ fontSize: '0.95rem', maxWidth: 640 }}>
            Swap parts, watch the ladder re-sort, see whether your stack <strong>fits</strong>,{' '}
            <strong>offloads</strong>, or <strong>collapses</strong> — every number footnote-linked.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link href="/models" className="chip" title="Compare Gemini, MiMo, DeepSeek, Muse, and Space-Bunny">
            ◫ Model comparison
          </Link>
          <Link href="/agents" className="chip" title="Live agent fleet dashboard">
            🎛️ Agent Fleet
          </Link>
          <Link href="/lex" className="chip" title="Lexi — every tech term, explained (VidiFlow LEX atlas)">
            📖 Lexi — tech terms
          </Link>
          <button
            className="chip"
            style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?${encodeState(state)}`;
              void navigator.clipboard?.writeText(url).catch(() => {});
            }}
            title="Copy a shareable link of the current configuration"
          >
            ⧉ Copy share link
          </button>
        </div>
      </header>

      {/* Hero */}
      <figure style={{ margin: '0 0 1.5rem', position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-bandwidth-forge.png"
          alt="Steampunk bandwidth forge: molten data rivers flowing from furnace crucibles down through brass machinery tiers"
          style={{
            width: '100%',
            height: 'clamp(190px, 42vh, 440px)',
            objectFit: 'cover',
            objectPosition: 'center 45%',
            display: 'block',
          }}
          width={1280}
          height={720}
          fetchPriority="high"
        />
        <div
          className="steam"
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            padding: '0.9rem 1.2rem',
            background:
              'linear-gradient(to top, rgba(2,6,23,0.96) 0%, rgba(2,6,23,0.75) 55%, rgba(2,6,23,0))',
            color: 'var(--text-2)',
            fontSize: '0.78rem',
            textShadow: '0 1px 3px rgba(2,6,23,0.9)',
          }}
        >
          The forge: HBM crucibles at the top, GDDR forges mid-hall, DDR5 pipes at the floor — pick a tier, watch the token river flow.
        </div>
      </figure>

      {/* Lab grid */}
      <div className="lab-grid">
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <StackConfigurator state={state} update={update} />
          <ModelPicker state={state} update={update} />
        </div>

        <section className="glass card ladder-wrap" aria-label="Bandwidth ladder">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div>
              <p className="eyebrow">Live ladder</p>
              <h2 style={{ fontSize: '1.05rem', margin: '0.3rem 0 0.2rem' }}>
                The bandwidth ladder, log scale — 0.1 → 22,000 GB/s
              </h2>
            </div>
            <p className="faint">chips re-sort as you swap parts</p>
          </div>
          <div className="footnote-row" style={{ color: 'var(--text-3)' }}>
            <span><i style={{ color: 'var(--gold)' }}>■</i> HBM</span>
            <span><i style={{ color: 'var(--cyan)' }}>■</i> GDDR7/6X/6</span>
            <span><i style={{ color: 'var(--purple)' }}>■</i> LPDDR5X</span>
            <span><i style={{ color: 'var(--green)' }}>■</i> DDR5</span>
            <span><i style={{ color: 'var(--grey)' }}>■</i> links / network</span>
          </div>
          <BandwidthLadder entries={entries} highlighted={highlighted} />
        </section>

        <OutcomePanel result={result} modelFn={model.fn} />
      </div>

      {/* Reality check explainer */}
      <RealityCheck />

      {/* Teaching strip */}
      <section className="glass card" style={{ marginBlockStart: '1.25rem' }} aria-label="How to read this lab">
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div>
            <p className="eyebrow">The teaching formula</p>
            <p className="mono" style={{ fontSize: '0.95rem', marginBlock: '0.4rem', color: 'var(--cyan)' }}>
              decode tok/s ≈ bandwidth ÷ model bytes
            </p>
            <p className="faint">
              Decode is memory-bound: every token streams the active weights once through the memory
              system. Prefill is compute-bound — that&apos;s why tiny models feel instant and huge ones
              crawl on slow pipes.
            </p>
          </div>
          <div>
            <p className="eyebrow">Capacity vs speed</p>
            <p className="faint">
              Fit = weights (×1.1 alloc overhead) + KV cache + 2 GB OS headroom. Multi-GPU pools add
              10% NCCL overhead. MoE models allocate all parameters but <em>decode</em> only the
              active experts.
            </p>
          </div>
          <div>
            <p className="eyebrow">The offload lesson</p>
            <p className="faint">
              Push the model past the pool and watch the bottleneck chain flip to PCIe: tok/s
              collapses ~30× because host RAM funnels through ~64 GB/s links instead of 1,792–22,000
              GB/s of memory.
            </p>
          </div>
        </div>
      </section>

      {/* Corrected infographic */}
      <section className="glass card" style={{ marginBlockStart: '1.25rem', overflowX: 'auto' }} aria-label="Corrected bandwidth infographic">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <p className="eyebrow">Deliverable B</p>
            <h2 style={{ fontSize: '1.05rem', margin: '0.3rem 0' }}>
              The corrected infographic (SVG, real text — no AI garbling)
            </h2>
          </div>
          <p className="faint">Exported to images/bandwidth-ladder-2026.png at 2×</p>
        </div>
        <Infographic />
      </section>

      {/* Sources */}
      <footer style={{ marginBlockStart: '2rem' }} id="sources">
        <p className="eyebrow">Footnotes — every number traceable</p>
        <ol style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '0.3rem', marginBlockStart: '0.6rem' }}>
          {Object.entries(FOOTNOTES).map(([n, f]) => (
            <li key={n} id={`fn-${n}`} className="faint">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="mono">
                [{n}]
              </a>{' '}
              {f.label} —{' '}
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                source
              </a>
            </li>
          ))}
        </ol>
        <p className="faint" style={{ marginBlockStart: '1rem' }}>
          Prices are estimates for relative comparison. Peak bandwidth shown on the ladder; the sim
          applies real-world factors (GDDR7 ≈ 90% of peak, LPDDR5X ≈ 76% per measured MLX studies,
          DDR5 STREAM ≈ 65%). Quantization: FP16 = 2 B/param, FP8 = 1, Q4_K_M ≈ 0.56, ×1.1 alloc overhead.
        </p>
      </footer>
    </main>
  );
}