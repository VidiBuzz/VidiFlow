// Engine / agent facts for /integrate — live-verified 2026-10-11 (Grok Bot for James May).
// Sources: M:\code\VidiBot\docs\VIDIFLOW-INTEGRATE-UPDATE-2026-10-11.md
// Keep in sync with M:\code\VidiBot\docs\integrate-engines-2026-10-11.json

export const FACTS_AS_OF = "2026-10-11";

export type Milestone = { date: string; label: string };

export type Engine = {
  id: string;
  name: string;
  maker: string;
  logo: string;
  logoInvert?: boolean;
  accent: string;
  what: string;
  /** ISO date of first public release (YYYY-MM-DD) */
  firstRelease: string;
  firstLabel: string;
  latest: Milestone;
  milestones: Milestone[];
};

export const engines: Engine[] = [
  {
    id: "claude",
    name: "Claude",
    maker: "Anthropic",
    logo: "/integrate/logos/claude.png",
    accent: "#d4a574",
    what:
      "Anthropic's model family and assistant. Claude Code is its agentic coding tool for the terminal, IDE, and desktop.",
    firstRelease: "2023-03-14",
    firstLabel: "Claude launch",
    latest: { date: "2026-10-09", label: "Claude Code v2.1.296" },
    milestones: [
      { date: "2023-03-14", label: "Claude launches" },
      { date: "2025-02-24", label: "Claude Code preview" },
      { date: "2025-05-22", label: "Claude Code 1.0 GA" },
      { date: "2026-09-22", label: "Claude Opus 5.5" },
      { date: "2026-10-07", label: "Claude Haiku 5.5" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    maker: "Google",
    logo: "/integrate/logos/gemini.png",
    accent: "#4f8df9",
    what:
      "Google's multimodal model family behind the Gemini app, the Gemini API, and Google's Antigravity agent.",
    firstRelease: "2023-12-06",
    firstLabel: "Gemini 1.0 announced",
    latest: { date: "2026-09-02", label: "Gemini 3.8 Flash GA" },
    milestones: [
      { date: "2023-12-06", label: "Gemini 1.0 announced" },
      { date: "2025-11-18", label: "Gemini 3 Pro preview" },
      { date: "2026-05-19", label: "Antigravity Agent preview" },
      { date: "2026-09-02", label: "Gemini 3.8 Flash GA" },
    ],
  },
  {
    id: "nvidia-nat",
    name: "NVIDIA NeMo Agent Toolkit",
    maker: "NVIDIA",
    logo: "/integrate/logos/nvidia-nat.png",
    accent: "#76b900",
    what:
      "NVIDIA's open-source (Apache-2.0) library that connects, evaluates, and profiles agents across frameworks. It instruments agents rather than being one.",
    firstRelease: "2025-03-18",
    firstLabel: "v1.0.0 as AgentIQ",
    latest: { date: "2026-09-10", label: "v1.9.0" },
    milestones: [
      { date: "2025-03-18", label: "v1.0.0 (AgentIQ)" },
      { date: "2025-06-11", label: "Renamed NeMo Agent Toolkit" },
      { date: "2026-06-16", label: "v1.8.0" },
      { date: "2026-09-10", label: "v1.9.0" },
    ],
  },
  {
    id: "codex",
    name: "OpenAI Codex",
    maker: "OpenAI",
    logo: "/integrate/logos/openai.png",
    logoInvert: true,
    accent: "#10a37f",
    what:
      "OpenAI's software-engineering agent. It writes and tests code locally (CLI, IDE, desktop) or in cloud sandboxes and opens PRs, the developer-side counterpart to Claude Code.",
    firstRelease: "2025-04-16",
    firstLabel: "Codex CLI launch",
    latest: { date: "2026-10-09", label: "Codex CLI 0.162.1" },
    milestones: [
      { date: "2025-04-16", label: "Codex CLI (open source)" },
      { date: "2025-05-16", label: "Codex cloud agent" },
      { date: "2026-10-09", label: "CLI 0.162.1" },
    ],
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    maker: "OpenClaw community (MIT)",
    logo: "/integrate/logos/openclaw.png",
    accent: "#a78bfa",
    what:
      "Open-source, self-hosted, model-agnostic agent that runs on your machine or server and works through WhatsApp, Telegram, Slack, Discord and more.",
    firstRelease: "2025-11-25",
    firstLabel: "v0.1.1, as WhatsApp Relay",
    latest: { date: "2026-10-10", label: "v2026.10.1" },
    milestones: [
      { date: "2025-11-25", label: "First release (WhatsApp Relay)" },
      { date: "2026-01-29", label: "Renamed OpenClaw" },
      { date: "2026-08-30", label: "OpenClaw 2.0 (v2026.8.1)" },
      { date: "2026-10-10", label: "v2026.10.1" },
    ],
  },
  {
    id: "hermes",
    name: "Hermes Agent",
    maker: "Nous Research",
    logo: "/integrate/logos/hermes.png",
    accent: "#22d3ee",
    what:
      "Nous Research's open-source (MIT), self-hosted agent with persistent memory, self-improving skills, and a messaging gateway.",
    firstRelease: "2026-03-12",
    firstLabel: "v0.2.0, first public release",
    latest: { date: "2026-10-08", label: "v0.21.6" },
    milestones: [
      { date: "2026-03-12", label: "v0.2.0 public release" },
      { date: "2026-08-31", label: "v0.21.0 Pantheon" },
      { date: "2026-10-08", label: "v0.21.6" },
    ],
  },
  {
    id: "grok-bot",
    name: "Grok Bot",
    maker: "xAI (SpaceX)",
    logo: "/integrate/logos/grok-bot.png",
    accent: "#5b8cff",
    what:
      "Always-on AI teammates. Each Bot gets a cloud computer, signs into your apps, works in parallel with other Bots, and checks back for approval.",
    firstRelease: "2026-08-11",
    firstLabel: "Beta launch",
    latest: { date: "2026-09-03", label: "Grok Bot for Enterprise" },
    milestones: [
      { date: "2026-08-11", label: "Beta launch" },
      { date: "2026-09-03", label: "Enterprise availability" },
    ],
  },
  {
    id: "openai-dots",
    name: "OpenAI dots",
    maker: "OpenAI",
    logo: "/integrate/logos/openai.png",
    logoInvert: true,
    accent: "#e879f9",
    what:
      "Always-on agents in ChatGPT, powered by GPT-6 Astra. Each dot has its own cloud computer and browser and works in ChatGPT, Slack, Teams, or by voice.",
    firstRelease: "2026-09-29",
    firstLabel: "Launched at DevDay",
    latest: { date: "2026-09-29", label: "Rolling out (Pro, Business Premium)" },
    milestones: [{ date: "2026-09-29", label: "Launch (DevDay 2026)" }],
  },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Age of an engine as of FACTS_AS_OF, e.g. "3 yr 6 mo", "2 mo", "12 days". Deterministic (no Date.now). */
export function ageAsOf(iso: string, asOf: string = FACTS_AS_OF): string {
  const [y1, m1, d1] = iso.split("-").map(Number);
  const [y2, m2, d2] = asOf.split("-").map(Number);
  let months = (y2 - y1) * 12 + (m2 - m1);
  if (d2 < d1) months -= 1;
  if (months < 1) {
    const days = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
    return `${days} days`;
  }
  const yr = Math.floor(months / 12);
  const mo = months % 12;
  if (yr === 0) return `${mo} mo`;
  return mo === 0 ? `${yr} yr` : `${yr} yr ${mo} mo`;
}

/** Engines sorted oldest → newest by first public release. */
export const enginesByRelease = [...engines].sort((a, b) => a.firstRelease.localeCompare(b.firstRelease));

export function timelinePosition(id: string): string {
  const i = enginesByRelease.findIndex((e) => e.id === id);
  const n = enginesByRelease.length;
  if (i === 0) return `1st of ${n} · earliest`;
  if (i === n - 1) return `${n}th of ${n} · newest`;
  const ord = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"][i];
  return `${ord} of ${n}`;
}
