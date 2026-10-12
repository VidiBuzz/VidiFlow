"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { media } from "@/lib/media";
import {
  FACTS_AS_OF,
  ageAsOf,
  engines,
  enginesByRelease,
  fmtDate,
  timelinePosition,
  type Engine,
} from "./engines";

function Logo({ e, size = "h-7 w-7" }: { e: Engine; size?: string }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-lg`}
      style={{ background: `${e.accent}22`, boxShadow: `0 0 12px ${e.accent}44` }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media(e.logo)}
        alt=""
        referrerPolicy="no-referrer"
        className={`h-full w-full object-contain p-0.5${e.logoInvert ? " invert" : ""}`}
      />
    </span>
  );
}

export function IntegrateHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-hx-border bg-hx-panel/70 px-6 py-10 shadow-glow sm:px-10 sm:py-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(91,140,255,0.22),_transparent_60%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-hx-cyan">
          Agent Army · {engines.length} agent harnesses
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white [text-wrap:balance] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          VidiFlow builds agent stacks{" "}
          <span className="bg-gradient-to-r from-hx-accent via-hx-cyan to-hx-violet bg-clip-text text-transparent">
            that work for businesses.
          </span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-hx-muted [text-wrap:balance] sm:text-lg">
          Grok Bot, OpenAI dots, and Meta&apos;s Muse put agents to work for you. VidiFlow runs the
          whole business at scale, with hundreds of agents working alongside your people on one
          mission board.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-hx-border bg-hx-bg/80 px-3 py-1 text-xs text-hx-muted">
            Personal agent stacks: one person, their agents
          </span>
          <span className="rounded-full border border-hx-cyan/40 bg-hx-cyan/10 px-3 py-1 text-xs font-medium text-hx-cyan">
            VidiFlow: every person, agent, and process
          </span>
        </div>
      </div>
    </motion.section>
  );
}

export function ReleaseTimeline() {
  return (
    <section id="timeline" className="mt-12 scroll-mt-20" aria-labelledby="release-timeline">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-hx-cyan">Release timeline</p>
          <h2 id="release-timeline" className="mt-2 text-2xl font-semibold text-white">
            Every engine, oldest first
          </h2>
        </div>
        <p className="text-xs text-hx-muted">Oldest to newest · facts as of {fmtDate(FACTS_AS_OF)}</p>
      </div>

      {/* Desktop: two rows of four, so each label has room to wrap cleanly */}
      <div className="mt-8 hidden lg:block">
        {[enginesByRelease.slice(0, 4), enginesByRelease.slice(4)].map((row, ri) => (
          <div key={ri} className={ri === 0 ? "relative" : "relative mt-10"}>
            <div className="absolute left-0 right-0 top-[13px] h-px bg-gradient-to-r from-hx-accent/60 via-hx-cyan/60 to-hx-violet/60" />
            <ol className="relative grid grid-cols-4 gap-4">
              {row.map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * (ri * 4 + i), duration: 0.3 }}
                  className="min-w-0"
                >
                  <span
                    className="relative z-10 block h-[27px] w-[27px] rounded-full border-2 bg-hx-bg"
                    style={{ borderColor: e.accent, boxShadow: `0 0 14px ${e.accent}66` }}
                    aria-hidden
                  />
                  <p className="mt-3 font-mono text-[11px] text-hx-muted">{fmtDate(e.firstRelease)}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Logo e={e} size="h-5 w-5" />
                    <a href={`#${e.id}`} className="min-w-0 text-[13px] font-semibold leading-tight text-white [text-wrap:balance] hover:text-hx-cyan">{e.name}</a>
                  </div>
                  <ul className="mt-2 space-y-1.5 border-l border-hx-border pl-2">
                    {e.milestones.map((m) => (
                      <li key={m.date + m.label} className="text-[11px] leading-snug text-hx-muted">
                        <span className="block font-mono text-[10px] text-hx-cyan/80">{fmtDate(m.date)}</span>
                        <span className="block [text-wrap:balance]" data-tl-label>{m.label}</span>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {/* Mobile + tablet: vertical */}
      <ol className="mt-6 space-y-5 border-l border-hx-border pl-5 lg:hidden">
        {enginesByRelease.map((e) => (
          <li key={e.id} className="relative">
            <span
              className="absolute -left-[29px] top-1 block h-4 w-4 rounded-full border-2 bg-hx-bg"
              style={{ borderColor: e.accent, boxShadow: `0 0 10px ${e.accent}66` }}
              aria-hidden
            />
            <p className="font-mono text-[11px] text-hx-muted">{fmtDate(e.firstRelease)}</p>
            <div className="mt-1 flex items-center gap-2">
              <Logo e={e} size="h-6 w-6" />
              <a href={`#${e.id}`} className="text-sm font-semibold text-white hover:text-hx-cyan">{e.name}</a>
              <span className="text-[11px] text-hx-muted">· {e.maker}</span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {e.milestones.map((m) => (
                <li
                  key={m.date + m.label}
                  className="rounded-full border border-hx-border bg-hx-bg/80 px-2 py-0.5 text-[11px] text-hx-muted"
                >
                  <span className="font-mono text-hx-cyan/80">{fmtDate(m.date)}</span> · {m.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function EngineFacts({ id }: { id: string }) {
  const e = engines.find((x) => x.id === id);
  if (!e) return null;
  return (
    <div className="mt-3 rounded-xl border border-hx-border bg-hx-bg/60 p-3">
      <p className="text-[13px] leading-relaxed text-white/90 [text-wrap:balance]">{e.what}</p>
      <dl className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 text-[11px] sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-hx-muted">First released</dt>
          <dd className="font-medium text-white">{fmtDate(e.firstRelease)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-hx-muted">Out for</dt>
          <dd className="font-medium text-white">{ageAsOf(e.firstRelease)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-hx-muted">Latest</dt>
          <dd className="font-medium text-white">
            {e.latest.label}
            <span className="block font-normal text-hx-muted">{fmtDate(e.latest.date)}</span>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-hx-muted">On the timeline</dt>
          <dd className="font-medium text-white">{timelinePosition(e.id)}</dd>
          <dd className="text-hx-muted [text-wrap:balance]">{e.maker}</dd>
        </div>
      </dl>
      <p className="mt-3 border-t border-hx-border/70 pt-2 text-[11px] leading-relaxed text-hx-muted [text-wrap:pretty]">
        <span className="font-semibold text-white/80">How it runs: </span>
        {e.howItRuns}
      </p>
    </div>
  );
}

export type HarnessStatus = { id: string; status: string; live: boolean };

const SECTIONS = [
  { href: "#harnesses", label: "Harnesses" },
  { href: "#timeline", label: "Timeline" },
  { href: "#adapters", label: "Adapters" },
  { href: "#dashboards", label: "Dashboards" },
  { href: "#at-work", label: "At work" },
];

/** In-page section bar, so every part of the page is one tap away. */
export function SectionNav() {
  return (
    <nav aria-label="On this page" className="mt-6 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
      {SECTIONS.map((s) => (
        <a
          key={s.href}
          href={s.href}
          className="rounded-full border border-hx-border bg-hx-bg/80 px-3 py-1 text-center text-xs text-hx-muted transition hover:border-hx-cyan/60 hover:text-white"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

/** All harnesses at a glance (release order), each linking to its card. */
export function HarnessIndex({ statuses }: { statuses: HarnessStatus[] }) {
  const byId = new Map(statuses.map((s) => [s.id, s]));
  return (
    <section id="harnesses" className="mt-12 scroll-mt-20" aria-labelledby="harness-index">
      <p className="text-xs uppercase tracking-[0.2em] text-hx-cyan">The Agent Army</p>
      <h2 id="harness-index" className="mt-2 text-2xl font-semibold text-white [text-wrap:balance]">
        {engines.length} harnesses,<br className="sm:hidden" /> one mission board
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enginesByRelease.map((e) => {
          const st = byId.get(e.id);
          return (
            <li key={e.id} className="min-w-0">
              <a
                href={`#${e.id}`}
                className="flex h-full min-w-0 items-center gap-3 rounded-xl border border-hx-border bg-hx-panel/80 p-3 transition hover:border-hx-cyan/50"
              >
                <Logo e={e} size="h-9 w-9" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight text-white [text-wrap:balance]">
                    {e.name}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-hx-muted">{e.maker}</span>
                  {st ? (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        st.live ? "bg-hx-cyan/10 text-hx-cyan" : "bg-hx-violet/10 text-hx-violet"
                      }`}
                    >
                      {st.status}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const AT_WORK = [
  { href: "/hx", label: "Mission Board", body: "Humans and agents as equal entities on one visual mission canvas." },
  { href: "/swarm", label: "Agent swarm", body: "The agent swarm board: idle, working, review, and blocked." },
  { href: "/org", label: "Org chart", body: "The VidiSmart employee wall and the Shared Experts bench." },
  { href: "/meeting", label: "Smart Meeting", body: "Lexi and Max on a call: answers, notes, and action items." },
];

/** Where the harnesses show up across VidiFlow HX (existing routes only). */
export function AtWork() {
  return (
    <section id="at-work" className="mt-12 scroll-mt-20" aria-labelledby="at-work-h">
      <p className="text-xs uppercase tracking-[0.2em] text-hx-cyan">At work</p>
      <h2 id="at-work-h" className="mt-2 text-2xl font-semibold text-white [text-wrap:balance]">
        See the Agent Army working
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {AT_WORK.map((w) => (
          <li key={w.href} className="min-w-0">
            <Link
              href={w.href}
              className="block h-full rounded-xl border border-hx-border bg-hx-panel/70 p-4 transition hover:border-hx-cyan/50"
            >
              <span className="text-sm font-semibold text-white">{w.label} →</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-hx-muted [text-wrap:balance]">{w.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
