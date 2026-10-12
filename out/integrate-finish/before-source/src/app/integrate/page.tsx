"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { RuntimeMarks } from "@/components/RuntimeMarks";
import { IntegrateHero, ReleaseTimeline, EngineFacts } from "./IntegrateExtras";

const adapters = [
  {
    name: "Claude",
    runtime: "claude",
    logo: "/integrate/logos/claude.png",
    status: "Stub ready",
    accent: "#d4a574",
    blurb:
      "Maps Claude / Claude Code runs into VidiFlow HX entities and long-form reasoning tasks. Draft polish and briefs land on the Mission Board — HX visualizes, it does not replace Claude.",
    features: ["Desktop + terminal + IDE", "Opus / Sonnet steering", "Sessions & routines"],
    shot: "/integrate/shots/claude-code-home.png",
    endpoints: ["POST /adapters/claude/events", "GET /adapters/claude/entities"],
  },
  {
    name: "Grok Bot",
    runtime: "grok-bot",
    logo: "/integrate/logos/grok-bot.png",
    status: "Stub ready",
    accent: "#5b8cff",
    blurb:
      "Maps Grok Bot runs into VidiFlow HX entities and task nodes. Progress + HITL events surface on the Mission Board — HX visualizes, it does not replace Grok Bot.",
    features: ["Fleet of specialist bots", "Routines + connectors", "Desktop computer use"],
    shot: "/integrate/shots/grok-home.png",
    endpoints: ["POST /adapters/grok/events", "GET /adapters/grok/entities", "POST /adapters/grok-bot/events"],
  },
  {
    name: "Hermes Agent",
    runtime: "hermes",
    logo: "/integrate/logos/hermes.png",
    status: "Stub ready",
    accent: "#22d3ee",
    blurb:
      "Hermes research streams land as Research agent beats and VidiBuzz workstream tasks. Contingency nodes light up when Hermes waits on sources.",
    features: ["Native desktop app", "Skills + messaging", "Theme engine"],
    shot: "/integrate/shots/hermes-agent-home.png",
    endpoints: ["POST /adapters/hermes/events", "GET /adapters/hermes/stream", "GET /adapters/hermes/briefs"],
  },
  {
    name: "OpenClaw 2.0",
    runtime: "openclaw",
    logo: "/integrate/logos/openclaw.png",
    status: "Gateway stub",
    accent: "#a78bfa",
    blurb:
      "OpenClaw 2.0 gateway stub bridges tool-calls into ModalityVector jobs. Idle until claw jobs fire — then VidiBot / QA Sentinel pick up the canvas.",
    features: ["Agent harness V2", "Any OS / platform", "Plugin SDK"],
    shot: "/integrate/shots/openclaw-home.png",
    endpoints: ["POST /adapters/openclaw/events", "POST /adapters/openclaw/tools", "GET /adapters/openclaw/gateway"],
  },
  {
    name: "NVIDIA NeMo Agent Toolkit",
    runtime: "nvidia-nat",
    logo: "/integrate/logos/nvidia-nat.png",
    status: "Stub ready",
    accent: "#76b900",
    blurb:
      "NVIDIA NeMo Agent Toolkit (NAT) is the fifth harness — agent workflows, evaluation, and profiling map into HX entities so GPU-side agent graphs show up on the Mission Board.",
    features: ["Agent workflows", "Eval + profiling", "NVIDIA stack native"],
    shot: "/integrate/shots/nvidia-nemo-agent-toolkit-home.png",
    endpoints: ["POST /adapters/nvidia-nat/events", "GET /adapters/nvidia-nat/entities", "GET /adapters/nvidia-nat/graphs"],
  },
  {
    name: "OpenAI Codex",
    runtime: "codex",
    logo: "/integrate/logos/openai.png",
    status: "Adapter planned",
    accent: "#10a37f",
    blurb:
      "The developer-side agent next to Claude Code. Planned: Codex runs and pull requests land as Build tasks on the Mission Board so engineering work sits beside the rest of the company.",
    features: ["CLI + IDE + desktop", "Cloud sandboxes", "Pull requests"],
    shot: "",
    endpoints: [],
  },
  {
    name: "OpenAI dots",
    runtime: "openai-dots",
    logo: "/integrate/logos/openai.png",
    status: "Adapter planned",
    accent: "#e879f9",
    blurb:
      "Always-on personal coworkers in ChatGPT. Planned: each person's dot shows up next to them on the org grid, so personal agents become part of the company picture.",
    features: ["Own cloud computer", "ChatGPT, Slack, Teams", "Voice calls"],
    shot: "",
    endpoints: [],
  },
  {
    name: "Gemini",
    runtime: "gemini",
    logo: "/integrate/logos/gemini.png",
    status: "Adapter planned",
    accent: "#4f8df9",
    blurb:
      "Google's model family and Antigravity agent. Planned: Gemini and Antigravity jobs, including image renders, report into HX as SmartGen and Research tasks.",
    features: ["Gemini API", "Antigravity agent", "Image + video models"],
    shot: "",
    endpoints: [],
  },
];

const engineIdFor: Record<string, string> = {
  claude: "claude",
  "grok-bot": "grok-bot",
  hermes: "hermes",
  openclaw: "openclaw",
  "nvidia-nat": "nvidia-nat",
  codex: "codex",
  "openai-dots": "openai-dots",
  gemini: "gemini",
};

export default function IntegratePage() {
  return (
    <div className="hx-grid mx-auto max-w-5xl px-4 py-16">
      <IntegrateHero />
      <ReleaseTimeline />

      <motion.div className="mt-16" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.2em] text-hx-cyan">Adapters</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Integrate runtimes</h2>
        <p className="mt-3 max-w-2xl text-sm text-hx-muted">
          VidiFlow HX visualizes Claude, Grok Bot, Hermes Agent, OpenClaw 2.0, and NVIDIA NeMo
          Agent Toolkit as first-class entities. These stubs show the contract — wire real
          EventSource / webhooks later. OpenAI Codex, OpenAI dots, and Gemini adapters are planned.
        </p>
        <div className="mt-6 flex justify-center sm:justify-start">
          <RuntimeMarks compact />
        </div>
      </motion.div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {adapters.map((a, i) => (
          <motion.article
            key={a.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i }}
            className="min-w-0 rounded-2xl border border-hx-border bg-hx-panel/80 p-5 shadow-glow"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                  style={{ background: `${a.accent}22`, boxShadow: `0 0 12px ${a.accent}44` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.logo}
                    alt=""
                    className={`h-full w-full object-contain p-0.5${a.logo.endsWith("openai.png") ? " invert" : ""}`}
                  />
                </span>
                <h2 className="truncate text-lg font-semibold text-white">{a.name}</h2>
              </div>
              <span className="shrink-0 rounded-full bg-hx-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-hx-cyan">
                {a.status}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-hx-muted">{a.runtime}</p>
            <EngineFacts id={engineIdFor[a.runtime]} />
            <p className="mt-3 text-sm leading-relaxed text-hx-muted">{a.blurb}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {a.features.map((f) => (
                <li
                  key={f}
                  className="rounded-full border border-hx-border bg-hx-bg/80 px-2 py-0.5 text-[10px] text-hx-muted"
                >
                  {f}
                </li>
              ))}
            </ul>
            {a.endpoints.length > 0 && (
            <ul className="mt-4 space-y-1">
              {a.endpoints.map((ep) => (
                <li
                  key={ep}
                  className="break-all rounded-md border border-hx-border bg-hx-bg px-2 py-1.5 font-mono text-[10px] text-hx-accent"
                >
                  {ep}
                </li>
              ))}
            </ul>
            )}
          </motion.article>
        ))}
      </div>

      <div className="mt-12">
        <h3 className="text-sm font-semibold text-white">What the dashboard looks like</h3>
        <p className="mt-1 text-sm text-hx-muted">
          Home / product UI for each runtime — so you can spot them when you see them again.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adapters.filter((a) => a.shot).map((a) => (
            <figure
              key={a.shot}
              className="overflow-hidden rounded-xl border border-hx-border bg-hx-panel/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.shot}
                alt={`${a.name} home screen`}
                className="aspect-video w-full object-cover object-top"
              />
              <figcaption className="flex items-center gap-2 border-t border-hx-border px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.logo} alt="" className="h-5 w-5 rounded object-contain" />
                <span className="text-xs font-medium text-white">{a.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-hx-border bg-hx-panel/50 p-6">
        <h3 className="text-sm font-semibold text-white">Brand note</h3>
        <p className="mt-2 text-sm text-hx-muted">
          Built for VidiStudios products including VidiBuzz and ModalityVector. See live
          visualization on the{" "}
          <Link href="/hx" className="text-hx-cyan hover:underline">
            Mission Board
          </Link>
          {" "}and relationship maps on{" "}
          <Link href="/visuals" className="text-hx-cyan hover:underline">
            Visuals
          </Link>
          . Product home:{" "}
          <a
            href="https://vidiflow.net"
            className="text-hx-cyan hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            vidiflow.net
          </a>
          .
        </p>
      </div>
    </div>
  );
}
