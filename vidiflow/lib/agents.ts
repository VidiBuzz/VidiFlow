'use client';

import { useEffect, useState } from 'react';

export type AgentState = 'idle' | 'thinking' | 'running' | 'error' | 'done';

export interface AgentRecord {
  key: string;
  name: string;
  project: string;
  type: string;
  status: AgentState;
  statusLine: string;
  progress: number | null;
  updated: string | null;
  source: string;
}

interface VADPBot {
  from?: string;
  agent?: string;
  project?: string;
  type?: string;
  id?: string;
  status?: string;
  updated?: string;
  rel?: string;
}

interface LiveAgent {
  progress?: number;
  note?: string;
  status?: string;
}

interface AgentsLive {
  updated?: string;
  agents?: Record<string, LiveAgent>;
}

const STATE_MAP: Record<string, AgentState> = {
  working: 'running',
  running: 'running',
  active: 'running',
  busy: 'running',
  in_progress: 'running',
  thinking: 'thinking',
  pending: 'thinking',
  queued: 'thinking',
  error: 'error',
  failed: 'error',
  blocked: 'error',
  done: 'done',
  complete: 'done',
  completed: 'done',
  ok: 'done',
  idle: 'idle',
  stopped: 'idle',
  paused: 'idle',
};

const DEFAULT_LINE: Record<AgentState, string> = {
  idle: 'Idle — waiting for work',
  thinking: 'Thinking…',
  running: 'Working…',
  error: 'Needs attention',
  done: 'Task complete',
};

const RANK: Record<AgentState, number> = { running: 0, thinking: 1, error: 2, idle: 3, done: 4 };

export function deriveState(raw?: string): AgentState | null {
  if (!raw) return null;
  return STATE_MAP[raw.toLowerCase().trim()] ?? null;
}

function progressFor(status: AgentState, progress: number | null): number | null {
  if (status === 'done') return 1;
  if (status === 'idle') return progress ?? null;
  return progress;
}

export function mergeFeeds(bots: VADPBot[], live: AgentsLive | null): AgentRecord[] {
  const liveAgents = new Map<string, LiveAgent>(Object.entries(live?.agents ?? {}));
  const latest = new Map<string, { bot: VADPBot }>();

  for (const bot of bots) {
    const key = bot.from || bot.agent || bot.rel || 'unknown-bot';
    const prev = latest.get(key);
    if (!prev || (bot.updated ?? '') >= (prev.bot.updated ?? '')) latest.set(key, { bot });
  }

  const records: AgentRecord[] = [];
  const coveredIds = new Set<string>();

  latest.forEach(({ bot }, key) => {
    const status = deriveState(bot.status) ?? 'idle';
    const liveEntry = bot.id ? liveAgents.get(bot.id) : undefined;
    if (bot.id) coveredIds.add(bot.id);
    const note = liveEntry?.note;
    const progress = typeof liveEntry?.progress === 'number' ? liveEntry.progress : null;
    records.push({
      key: `bot-${key}`,
      name: bot.agent || bot.from || key,
      project: bot.project || 'unassigned',
      type: bot.type || 'task',
      status,
      statusLine: note ?? DEFAULT_LINE[status],
      progress: progressFor(status, progress),
      updated: bot.updated ?? null,
      source: bot.rel ?? 'feed.json',
    });
  });

  liveAgents.forEach((entry, id) => {
    if (coveredIds.has(id)) return;
    const progress = typeof entry.progress === 'number' ? entry.progress : null;
    const status =
      deriveState(entry.status) ??
      (progress === null ? 'idle' : progress >= 1 ? 'done' : progress > 0 ? 'running' : 'idle');
    records.push({
      key: `live-${id}`,
      name: id,
      project: 'vidiflow-live',
      type: 'feed',
      status,
      statusLine: entry.note ?? DEFAULT_LINE[status],
      progress,
      updated: live?.updated ?? null,
      source: 'agents-live.json',
    });
  });

  return records.sort((a, b) => RANK[a.status] - RANK[b.status] || a.name.localeCompare(b.name));
}

export interface AgentsFeed {
  agents: AgentRecord[];
  updated: string | null;
  error: string | null;
}

export function useAgents(pollMs = 15000): AgentsFeed {
  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [updated, setUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const [botsRes, liveRes] = await Promise.allSettled([
          fetch('/agents/feed.json', { cache: 'no-store' }),
          fetch('/agents/agents-live.json', { cache: 'no-store' }),
        ]);
        const bots: VADPBot[] =
          botsRes.status === 'fulfilled' && botsRes.value.ok
            ? ((await botsRes.value.json())?.bots ?? [])
            : [];
        const live: AgentsLive | null =
          liveRes.status === 'fulfilled' && liveRes.value.ok ? await liveRes.value.json() : null;
        if (!alive) return;
        setAgents(mergeFeeds(bots, live));
        setUpdated(live?.updated ?? null);
        setError(null);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Feed unreachable');
      } finally {
        if (alive) timer = setTimeout(load, pollMs);
      }
    };

    void load();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [pollMs]);

  return { agents, updated, error };
}