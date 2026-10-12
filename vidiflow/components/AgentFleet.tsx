'use client';

import { useEffect, useRef, useState } from 'react';
import { useAgents, type AgentRecord, type AgentState } from '@/lib/agents';
import '@/app/agents/agents.css';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useTypewriter(text: string, speed = 24): string {
  const [out, setOut] = useState('');
  useEffect(() => {
    if (prefersReducedMotion()) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length && t) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return out;
}

function useAnimatedNumber(target: number | null, duration = 700): number | null {
  const [val, setVal] = useState<number | null>(target);
  const valRef = useRef<number | null>(target);
  valRef.current = val;

  useEffect(() => {
    if (target === null) {
      setVal(null);
      return;
    }
    if (prefersReducedMotion()) {
      setVal(target);
      return;
    }
    const from = valRef.current ?? 0;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return val;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return iso;
  const s = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function WavyProgress({ agent }: { agent: AgentRecord }) {
  const indeterminate = agent.progress === null;
  const pct = useAnimatedNumber(agent.progress === null ? null : agent.progress * 100);
  const shown = pct === null ? null : Math.round(pct * 100);
  return (
    <div className="fa-proj">
      <div className="row">
        <span className="label" title={agent.project}>{agent.project}</span>
        <span className="pct">{shown === null ? '···' : `${shown}%`}</span>
      </div>
      <div
        className="wbar"
        data-state={agent.status}
        data-indeterminate={indeterminate}
        role="progressbar"
        aria-label={`${agent.name} — ${agent.project} progress`}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        aria-valuenow={indeterminate ? undefined : (shown ?? undefined)}
      >
        <div className="fill" style={{ width: agent.progress === null ? undefined : `${agent.progress * 100}%` }} />
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentRecord }) {
  const prompt = useTypewriter(agent.statusLine);
  const busy = agent.status === 'running' || agent.status === 'thinking';
  return (
    <article className="glass agent-card" data-state={agent.status}>
      <div className="ac-top">
        <div className="status-orb" aria-hidden="true">
          <span className="ring ring-1" />
          <span className="ring ring-2" />
          <span className="core" />
        </div>
        <span className="ac-name" title={agent.name}>{agent.name}</span>
        <span className="ac-chip">{agent.project}</span>
        <span className="ac-chip">{agent.type}</span>
      </div>

      <div className="fa-prompt" role="status" aria-live="polite">
        <span className="fa-eq" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </span>
        <span className="text">{prompt}</span>
        {busy && <span className="caret" aria-hidden="true" />}
      </div>

      <WavyProgress agent={agent} />

      <div className="ac-meta">
        <span>{timeAgo(agent.updated)}</span>
        <span className="src" title={agent.source}>{agent.source}</span>
      </div>
    </article>
  );
}

function StatCard({ label, count, state }: { label: string; count: number; state: AgentState }) {
  return (
    <div className="glass fleet-stat" data-state={state}>
      <span className="stat-val">{count}</span>
      <span className="faint">{label}</span>
    </div>
  );
}

export default function AgentFleet() {
  const { agents, updated, error } = useAgents(15000);

  const byState = (s: AgentState) => agents.filter((a) => a.status === s).length;

  return (
    <>
      <div className="fleet-aurora" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div className="fleet-page">
        <header className="fleet-header">
          <div>
            <p className="eyebrow">VidiFlow · Live Fleet</p>
            <h1 style={{ fontSize: 'clamp(1.6rem, 1.1rem + 2.4vw, 2.4rem)' }}>Agent Fleet</h1>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              Per-agent status prompts and project bars — fed by vADP-1 bot reports and the live
              feed. Refreshes every 15s.
            </p>
          </div>
          <div style={{ display: 'grid', gap: '0.3rem', justifyItems: 'end' }}>
            <span className="faint mono">feed updated {updated ? timeAgo(updated) : '—'}</span>
            <span className="faint mono">{agents.length} agents tracked</span>
          </div>
        </header>

        {error && <p className="fleet-error">⚠ feed error: {error} — showing last known state</p>}

        <div className="fleet-stats">
          <StatCard label="running" count={byState('running')} state="running" />
          <StatCard label="thinking" count={byState('thinking')} state="thinking" />
          <StatCard label="done" count={byState('done')} state="done" />
          <StatCard label="errors" count={byState('error')} state="error" />
          <StatCard label="idle" count={byState('idle')} state="idle" />
        </div>

        <div className="fleet-grid">
          {agents.map((a) => (
            <AgentCard key={a.key} agent={a} />
          ))}
          {agents.length === 0 && !error && <p className="faint">Waiting for feed…</p>}
        </div>

        <footer className="fleet-foot">
          <p className="faint">
            Sources: <span className="mono">/agents/feed.json</span> (VidiBot vADP-1 reports) ·{' '}
            <span className="mono">/agents/agents-live.json</span> (Hermes live feed). Progress and
            notes attach by task id; agents without telemetry show an indeterminate bar.
          </p>
        </footer>
      </div>
    </>
  );
}