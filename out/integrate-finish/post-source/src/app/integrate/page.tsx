"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { media } from "@/lib/media";
import {
  AtWork,
  EngineFacts,
  HarnessIndex,
  IntegrateHero,
  ReleaseTimeline,
  SectionNav,
  type HarnessStatus,
} from "./IntegrateExtras";
import { engines, enginesByRelease } from "./engines";

// Adapter status: "Demo endpoints" = the listed routes exist on this site and answer
// with sample JSON (stub: true, demo: true). "Adapter planned" = no routes yet.
type Adapter = {
  id: string;
  status: "Demo endpoints" | "Adapter planned";
  blurb: string;
  features: string[];
  shot?: { src: string; caption: string };
  endpoints: string[];
};

const adapters: Adapter[] = [
  {
    id: "claude",
    status: "Demo endpoints",
    blurb:
      "Maps Claude / Claude Code runs into VidiFlow HX entities and long-form reasoning tasks. Draft polish and briefs land on the Mission Board. HX visualizes Claude; it does not replace it.",
    features: ["Desktop + terminal + IDE", "Opus / Sonnet steering", "Sessions & routines"],
    shot: { src: "/integrate/shots/claude-code-home.png", caption: "Claude Code" },
    endpoints: ["POST /adapters/claude/events", "GET /adapters/claude/entities"],
  },
  {
    id: "gemini",
    status: "Adapter planned",
    blurb:
      "Planned: Gemini and Antigravity jobs, including image renders, report into HX as SmartGen and Research tasks.",
    features: ["Gemini API", "Antigravity agent", "Image + video models"],
    shot: { src: "/integrate/shots/gemini-api-home.jpg", caption: "Gemini API (Google AI for Developers)" },
    endpoints: [],
  },
  {
    id: "nvidia-nat",
    status: "Demo endpoints",
    blurb:
      "Agent workflows, evaluation, and profiling from NVIDIA NeMo Agent Toolkit map into HX entities, so GPU-side agent graphs show up on the Mission Board.",
    features: ["Agent workflows", "Eval + profiling", "NVIDIA stack native"],
    shot: { src: "/integrate/shots/nvidia-nemo-agent-toolkit-home.png", caption: "NVIDIA NeMo Agent Toolkit" },
    endpoints: ["POST /adapters/nvidia-nat/events", "GET /adapters/nvidia-nat/entities", "GET /adapters/nvidia-nat/graphs"],
  },
  {
    id: "codex",
    status: "Adapter planned",
    blurb:
      "Planned: Codex runs and pull requests land as Build tasks on the Mission Board, so engineering work sits beside the rest of the company.",
    features: ["CLI + IDE + desktop", "Cloud sandboxes", "Pull requests"],
    endpoints: [],
  },
  {
    id: "openclaw",
    status: "Demo endpoints",
    blurb:
      "The OpenClaw gateway adapter bridges tool calls into ModalityVector jobs. It stays idle until claw jobs fire, then VidiBot and QA Sentinel pick up the canvas.",
    features: ["OpenClaw 2.0 (v2026.8.1)", "Any OS / platform", "Plugin SDK"],
    shot: { src: "/integrate/shots/openclaw-home.png", caption: "OpenClaw" },
    endpoints: ["POST /adapters/openclaw/events", "POST /adapters/openclaw/tools", "GET /adapters/openclaw/gateway"],
  },
  {
    id: "hermes",
    status: "Demo endpoints",
    blurb:
      "Hermes research streams land as Research agent beats and VidiBuzz workstream tasks. Contingency nodes light up when Hermes waits on sources.",
    features: ["Native desktop app", "Skills + messaging", "Theme engine"],
    shot: { src: "/integrate/shots/hermes-agent-home.png", caption: "Hermes Agent" },
    endpoints: ["POST /adapters/hermes/events", "GET /adapters/hermes/stream", "GET /adapters/hermes/briefs"],
  },
  {
    id: "grok-bot",
    status: "Demo endpoints",
    blurb:
      "Maps Grok Bot runs into VidiFlow HX entities and task nodes. Progress and approval events surface on the Mission Board. HX visualizes Grok Bot; it does not replace it.",
    features: ["Fleet of specialist bots", "Routines + connectors", "Desktop computer use"],
    shot: { src: "/integrate/shots/grok-home.png", caption: "Grok Bot" },
    endpoints: ["POST /adapters/grok/events", "GET /adapters/grok/entities", "POST /adapters/grok-bot/events"],
  },
  {
    id: "openai-dots",
    status: "Adapter planned",
    blurb:
      "Planned: each person's dot shows up next to them on the org grid, so personal agents become part of the company picture.",
    features: ["Own cloud computer", "ChatGPT, Slack, Teams", "Voice calls"],
    endpoints: [],
  },
];

const byId = new Map(engines.map((e) => [e.id, e]));
const statuses: HarnessStatus[] = adapters.map((a) => ({
  id: a.id,
  status: a.status,
  live: a.status === "Demo endpoints",
}));
const demoCount = adapters.filter((a) => a.status === "Demo endpoints").length;
const plannedNames = enginesByRelease
  .filter((e) => adapters.find((a) => a.id === e.id)?.status === "Adapter planned")
  .map((e) => e.name);

export default function IntegratePage() {
  return (
    <div className="hx-grid mx-auto max-w-5xl px-4 py-16">
      <IntegrateHero />
      <SectionNav />
      <HarnessIndex statuses={statuses} />
      <ReleaseTimeline />

      <motion.section
        id="adapters"
        className="mt-16 scroll-mt-20"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        aria-labelledby="adapters-h"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-hx-cyan">Adapters</p>
        <h2 id="adapters-h" className="mt-2 text-3xl font-semibold text-white">
          Integrate runtimes
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hx-muted [text-wrap:balance]">
          Each harness becomes a first-class entity on the VidiFlow HX Mission Board. {demoCount} adapters
          have demo endpoints on this site today. They answer with sample data while live event wiring is
          built. Adapters for {plannedNames.join(", ").replace(/, ([^,]*)$/, ", and $1")} are planned.
        </p>
        <p className="mt-2 text-xs text-hx-muted">Cards follow release order, oldest first.</p>
      </motion.section>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {enginesByRelease.map((e, i) => {
          const a = adapters.find((x) => x.id === e.id);
          if (!a) return null;
          const live = a.status === "Demo endpoints";
          return (
            <motion.article
              key={e.id}
              id={e.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
              className="min-w-0 scroll-mt-20 rounded-2xl border border-hx-border bg-hx-panel/80 p-5 shadow-glow"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="flex min-w-[13rem] items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                    style={{ background: `${e.accent}22`, boxShadow: `0 0 12px ${e.accent}44` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media(e.logo)}
                      alt=""
                      referrerPolicy="no-referrer"
                      className={`h-full w-full object-contain p-0.5${e.logoInvert ? " invert" : ""}`}
                    />
                  </span>
                  <h3 className="min-w-0 text-lg font-semibold leading-tight text-white [text-wrap:balance]">
                    {e.name}
                  </h3>
                </div>
                <span
                  className={`mt-1 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    live ? "bg-hx-cyan/10 text-hx-cyan" : "bg-hx-violet/10 text-hx-violet"
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-hx-muted">{e.id}</p>
              <EngineFacts id={e.id} />
              <p className="mt-3 text-sm leading-relaxed text-hx-muted [text-wrap:balance]">{a.blurb}</p>
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
                <ul className="mt-4 space-y-1" aria-label={`${e.name} demo endpoints`}>
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
          );
        })}
      </div>

      <section id="dashboards" className="mt-12 scroll-mt-20" aria-labelledby="dashboards-h">
        <h2 id="dashboards-h" className="text-sm font-semibold text-white">
          What the dashboards look like
        </h2>
        <p className="mt-1 text-sm text-hx-muted [text-wrap:balance]">
          Home or product screens for each harness, so you can spot them when you see them again.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enginesByRelease.map((e) => {
            const a = adapters.find((x) => x.id === e.id);
            if (!a?.shot) return null;
            return (
              <figure key={e.id} className="overflow-hidden rounded-xl border border-hx-border bg-hx-panel/60">
                <a href={`#${e.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media(a.shot.src)}
                    alt={`${a.shot.caption} home screen`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="aspect-video w-full object-cover object-top"
                  />
                </a>
                <figcaption className="flex min-w-0 items-center gap-2 border-t border-hx-border px-3 py-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media(e.logo)}
                    alt=""
                    referrerPolicy="no-referrer"
                    className={`h-5 w-5 shrink-0 rounded object-contain${e.logoInvert ? " invert" : ""}`}
                  />
                  <span className="min-w-0 text-xs font-medium text-white">{a.shot.caption}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <AtWork />

      <div className="mt-12 rounded-2xl border border-hx-border bg-hx-panel/50 p-6">
        <h2 className="text-sm font-semibold text-white">Brand note</h2>
        <p className="mt-2 text-sm text-hx-muted [text-wrap:balance]">
          Built for VidiStudios products including VidiBuzz and ModalityVector. See live
          visualization on the{" "}
          <Link href="/hx" className="text-hx-cyan hover:underline">
            Mission Board
          </Link>{" "}
          and relationship maps on{" "}
          <Link href="/visuals" className="text-hx-cyan hover:underline">
            Visuals
          </Link>
          . Product home:{" "}
          <a href="https://vidiflow.net" className="text-hx-cyan hover:underline" target="_blank" rel="noreferrer">
            vidiflow.net
          </a>
          .
        </p>
      </div>
    </div>
  );
}
