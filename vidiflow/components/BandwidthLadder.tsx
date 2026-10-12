'use client';

import { useLayoutEffect, useRef } from 'react';
import {
  ACCELERATORS,
  LINK_TIERS,
  MEM_COLORS,
  MEM_LABELS,
  type Accelerator,
  type MemType,
} from '@/lib/catalog';
import { formatNumber } from '@/lib/sim';

export interface LadderEntry {
  id: string;
  name: string;
  bandwidthGBs: number;
  memType: MemType;
  fn: number;
  custom?: boolean;
  /** Memory capacity in GB. 0 for links/fabric, which have no pool. */
  poolGB?: number;
}

interface BandwidthLadderProps {
  entries: LadderEntry[];
  /** ids of the rows belonging to the current rig (gold ring + YOU marker) */
  highlighted: Set<string>;
}

const ROW_H = 27;
const AXIS_H = 26;
const LABEL_W = 232;
const VALUE_W = 96;
/** Width reserved for the capacity (GB) column — a separate axis from speed. */
const CAP_W = 104;
const CHART_W = 560;
const TOP_PAD = 8;

const GROUP_LABELS: Record<MemType, string> = {
  hbm4: 'DATACENTER ONLY',
  hbm3e: 'DATACENTER ONLY',
  hbm3: 'DATACENTER ONLY',
  gddr7: 'DESKTOP GPU — GDDR',
  gddr6x: 'DESKTOP GPU — GDDR',
  gddr6: 'DESKTOP GPU — GDDR',
  lpddr5x: 'UNIFIED MEMORY',
  ddr5: 'CPU — DDR5',
  link: 'LINKS & FABRIC',
  net: 'LINKS & FABRIC',
};

type DispRow =
  | { kind: 'header'; key: string; label: string; y: number; scaleMax: number }
  | { kind: 'entry'; key: string; y: number; w: number; entry: LadderEntry };

type GsapLike = {
  fromTo: (
    el: Element,
    from: Record<string, unknown>,
    to: Record<string, unknown>,
  ) => unknown;
};

function getGsap(): GsapLike | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { gsap?: GsapLike };
  return w.gsap ?? null;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function gradFor(memType: MemType): string {
  switch (MEM_COLORS[memType]) {
    case 'var(--gold)':
      return 'url(#barGold)';
    case 'var(--purple)':
      return 'url(#barPurple)';
    case 'var(--cyan)':
    case 'var(--cyan-deep)':
      return 'url(#barCyan)';
    case 'var(--green)':
      return 'url(#barGreen)';
    default:
      return 'url(#barGrey)';
  }
}

function strokeFor(memType: MemType): string {
  return MEM_COLORS[memType] ?? 'var(--grey)';
}

export default function BandwidthLadder({ entries, highlighted }: BandwidthLadderProps) {
  const sorted = [...entries].sort((a, b) => b.bandwidthGBs - a.bandwidthGBs);

  // Layout: one band per tier group; bars are LINEAR within each group
  // (full bar = fastest entry of that group), so lengths are honest ratios.
  // Cross-group comparisons must use the printed GB/s values.
  const disp: DispRow[] = [];
  let y = TOP_PAD;
  let lastGroup: string | null = null;
  let groupMax = 0;
  for (const e of sorted) {
    const group = GROUP_LABELS[e.memType] ?? 'OTHER';
    if (group !== lastGroup) {
      groupMax = e.bandwidthGBs;
      disp.push({ kind: 'header', key: `hdr-${group}`, label: group, y, scaleMax: e.bandwidthGBs });
      y += ROW_H;
      lastGroup = group;
    }
    disp.push({
      kind: 'entry',
      key: e.id,
      y,
      w: Math.max((e.bandwidthGBs / groupMax) * CHART_W, 2),
      entry: e,
    });
    y += ROW_H;
  }
  const rows = disp.filter((d): d is Extract<DispRow, { kind: 'entry' }> => d.kind === 'entry');
  const totalRowsH = y - TOP_PAD;
  const svgW = LABEL_W + CHART_W + VALUE_W + CAP_W + 28;
  const svgH = y + AXIS_H + 16;
  const groupRefs = useRef(new Map<string, SVGGElement>());
  const barRefs = useRef(new Map<string, SVGRectElement>());
  const prevRef = useRef<Map<string, { y: number; w: number }>>(new Map());
  const mounted = useRef(false);

  useLayoutEffect(() => {
    const gsap = getGsap();
    const animate = Boolean(gsap) && !prefersReducedMotion() && mounted.current;
    rows.forEach((r) => {
      const prev = prevRef.current.get(r.key);
      if (animate && prev && (Math.abs(prev.y - r.y) > 0.5 || Math.abs(prev.w - r.w) > 0.5)) {
        const g = groupRefs.current.get(r.key);
        if (g) {
          gsap!.fromTo(
            g,
            { attr: { transform: `translate(0, ${prev.y})` } },
            { attr: { transform: `translate(0, ${r.y})` }, duration: 0.6, ease: 'power3.out' },
          );
        }
        const rect = barRefs.current.get(r.key);
        if (rect) {
          gsap!.fromTo(
            rect,
            { attr: { width: prev.w } },
            { attr: { width: r.w }, duration: 0.6, ease: 'power3.out' },
          );
        }
      }
      prevRef.current.set(r.key, { y: r.y, w: r.w });
    });
    mounted.current = true;
  });

  return (
    <div className="ladder-wrap">
      <svg
        className="ladder-svg"
        viewBox={`0 0 ${svgW} ${svgH}`}
        role="img"
        aria-label="Memory bandwidth ladder — bar length is linear within each tier group; full bar equals the fastest entry of that group. Compare across groups by the printed GB/s values."
      >
        <defs>
          <linearGradient id="barGold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#92400e" />
            <stop offset="1" stopColor="#fbbf24" />
          </linearGradient>
          <linearGradient id="barCyan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#155e75" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="barPurple" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5b21b6" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="barGreen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#166534" />
            <stop offset="1" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="barGrey" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#334155" />
            <stop offset="1" stopColor="#94a3b8" />
          </linearGradient>
        </defs>

        {disp.map((d) =>
          d.kind === 'header' ? (
            <g key={d.key} transform={`translate(0, ${d.y})`}>
              <line
                x1={8}
                y1={ROW_H - 6}
                x2={svgW - 16}
                y2={ROW_H - 6}
                stroke="rgba(148,163,184,0.22)"
              />
              <text
                x={8}
                y={12}
                fontSize={9.5}
                fontWeight={800}
                letterSpacing={2.2}
                fill="var(--cyan)"
                style={{ textTransform: 'uppercase' }}
              >
                {d.label}
              </text>
              <text
                x={LABEL_W}
                y={12}
                fontSize={9}
                fill="var(--text-3)"
                className="tabular"
              >
                linear scale · full bar = {formatNumber(d.scaleMax)} GB/s
              </text>
            </g>
          ) : (
            <g
              key={d.key}
              ref={(el) => {
                if (el) groupRefs.current.set(d.key, el);
              }}
              transform={`translate(0, ${d.y})`}
            >
              <rect
                ref={(el) => {
                  if (el) barRefs.current.set(d.key, el);
                }}
                x={LABEL_W}
                y={4}
                width={d.w}
                height={ROW_H - 10}
                rx={5}
                fill={d.entry.custom ? 'url(#barGold)' : gradFor(d.entry.memType)}
                opacity={d.entry.custom || highlighted.has(d.key) ? 1 : 0.7}
              />
              {highlighted.has(d.key) ? (
                <rect
                  x={LABEL_W - 3}
                  y={1}
                  width={CHART_W + 6}
                  height={ROW_H - 4}
                  rx={7}
                  fill="none"
                  stroke="var(--cyan)"
                  strokeWidth={1.4}
                />
              ) : null}
              <text x={8} y={16} fontSize={12} fontWeight={700} fill="var(--text)">
                {d.entry.name}
                {highlighted.has(d.key) ? (
                  <tspan fill="var(--cyan)" fontWeight={800} fontSize={10}>
                    {' '}
                    ◀ YOU
                  </tspan>
                ) : null}
              </text>
              <text x={8} y={27} fontSize={9} fill="var(--text-3)">
                {d.entry.custom ? 'aggregate effective' : MEM_LABELS[d.entry.memType]}
              </text>
              {d.entry.fn > 0 ? (
                <text x={LABEL_W - 16} y={16} fontSize={9} fill="var(--cyan-deep)" className="mono">
                  [{d.entry.fn}]
                </text>
              ) : null}
              <text
                x={LABEL_W + CHART_W + 6}
                y={16}
                fontSize={11.5}
                fontWeight={700}
                fill={d.entry.custom ? 'var(--gold)' : MEM_COLORS[d.entry.memType]}
                className="tabular"
              >
                {formatNumber(d.entry.bandwidthGBs, d.entry.bandwidthGBs < 100 ? 1 : 0)}
                <tspan fill="var(--text-3)" fontSize={9}>
                  {' '}
                  GB/s
                </tspan>
              </text>
              {/* Capacity is a different axis — never let the bar imply it. */}
              <text
                x={LABEL_W + CHART_W + VALUE_W + 18}
                y={16}
                fontSize={11.5}
                fontWeight={700}
                fill="var(--text-3)"
                className="tabular"
              >
                {d.entry.poolGB > 0 ? (
                  <>
                    {formatNumber(d.entry.poolGB, 0)}
                    <tspan fill="var(--text-3)" fontSize={9}>
                      {' '}
                      GB cap
                    </tspan>
                  </>
                ) : (
                  <tspan fill="var(--text-3)" fontSize={9}>
                    link — no capacity
                  </tspan>
                )}
              </text>
            </g>
          )
        )}

        <text x={8} y={TOP_PAD + totalRowsH + 15} fontSize={10} fill="var(--text-3)">
          GB/s = SPEED · GB cap = CAPACITY · two independent axes — a long bar is not a big pool
        </text>
      </svg>

      <ol className="ladder-list" aria-label="Memory bandwidth ranking, fastest first">
        {disp.map((d) =>
          d.kind === 'header' ? (
            <li key={d.key} className="faint" style={{ textTransform: 'uppercase' }}>
              {d.label}
            </li>
          ) : (
            <li key={d.key}>
              <span className="mono tabular">{formatNumber(d.entry.bandwidthGBs, d.entry.bandwidthGBs < 10 ? 2 : 0)}</span>{' '}
              GB/s — <strong>{d.entry.name}</strong>{' '}
              <span className="faint">({d.entry.custom ? 'aggregate effective' : MEM_LABELS[d.entry.memType]})</span>
              {d.entry.fn > 0 ? <sup className="fn">[{d.entry.fn}]</sup> : null}
            </li>
          )
        )}
      </ol>
    </div>
  );
}

/** Build the full ladder row set: every catalog accelerator + link tier, plus the
 *  live "your stack" chip and the platform host-DDR5 chip. */
export function buildLadderEntries(
  accelerators: Accelerator[],
  platformName: string,
  platformBW: number,
  platformMemType: MemType,
  rigBW: number,
): LadderEntry[] {
  const catalogRows: LadderEntry[] = [
    ...ACCELERATORS.map((a) => ({
      id: a.id,
      name: a.name,
      bandwidthGBs: a.bandwidthGBs,
      memType: a.memType,
      fn: a.fn,
      poolGB: a.poolGB,
    })),
    ...LINK_TIERS.map((l) => ({
      id: l.id,
      name: l.name,
      bandwidthGBs: l.bandwidthGBs,
      memType: l.memType,
      fn: l.fn,
    })),
  ];
  return [
    ...catalogRows,
    ...(platformBW > 0
      ? [
          {
            id: 'platform-host',
            name: `Host DDR5 · ${platformName}`,
            bandwidthGBs: platformBW,
            memType: platformMemType,
            fn: 3,
          },
        ]
      : []),
    {
      id: 'rig',
      name: 'Your stack',
      bandwidthGBs: rigBW,
      memType: platformMemType,
      fn: 0,
      custom: true,
    },
  ];
}