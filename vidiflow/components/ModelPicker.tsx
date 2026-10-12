'use client';

import {
  CONTEXT_OPTIONS,
  MODELS,
  QUANTS,
  USER_OPTIONS,
  modelById,
  quantById,
  weightsGB,
  activeWeightsGB,
  kvGB,
} from '@/lib/models';
import type { LabState } from '@/lib/state';
import { formatNumber } from '@/lib/sim';

interface Props {
  state: LabState;
  update: (patch: Partial<LabState>) => void;
}

export default function ModelPicker({ state, update }: Props) {
  const model = modelById(state.model);
  const quant = quantById(state.quant);
  if (!model || !quant) return null;

  const wGB = weightsGB(model, quant);
  const aGB = activeWeightsGB(model, quant);
  const kv = kvGB(model, state.contextK, state.users);

  return (
    <section className="glass card" aria-label="Model picker">
      <p className="eyebrow">Workload</p>
      <h2 style={{ fontSize: '1.05rem', margin: '0.3rem 0 0.6rem' }}>Model & load</h2>

      <div className="field">
        <span>
          Model{' '}
          <sup className="fn">
            <a href={`#fn-${model.fn}`}>[{model.fn}]</a>
          </sup>
        </span>
        <select
          value={state.model}
          onChange={(e) => {
            const m = modelById(e.target.value);
            if (m) update({ model: m.id, quant: m.defaultQuant });
          }}
          aria-label="Model"
          style={selectStyle}
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
              {m.isMoE ? ' — MoE' : ''}
            </option>
          ))}
        </select>
        <p className="faint">{model.note}</p>
      </div>

      <div className="field">
        <span>Quantization</span>
        <div className="seg" role="group" aria-label="Quantization">
          {QUANTS.map((q) => (
            <button
              key={q.id}
              className="chip"
              aria-pressed={state.quant === q.id}
              onClick={() => update({ quant: q.id })}
            >
              {q.name}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Context (per user)</span>
        <div className="seg" role="group" aria-label="Context length">
          {CONTEXT_OPTIONS.map((c) => (
            <button
              key={c}
              className="chip"
              aria-pressed={state.contextK === c}
              onClick={() => update({ contextK: c })}
            >
              {c}K
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Concurrent users</span>
        <div className="seg" role="group" aria-label="Concurrent users">
          {USER_OPTIONS.map((u) => (
            <button
              key={u}
              className="chip"
              aria-pressed={state.users === u}
              onClick={() => update({ users: u })}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <p className="faint tabular" style={{ marginBlockStart: '0.9rem' }}>
        Weights (alloc): <strong>{formatNumber(wGB, 1)} GB</strong> · active per step:{' '}
        <strong>{formatNumber(aGB, 1)} GB</strong> · KV cache: <strong>{formatNumber(kv, 1)} GB</strong>
      </p>
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