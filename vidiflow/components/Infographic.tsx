// Corrected 2026 bandwidth infographic — deterministic SVG with real text.
// Replaces the garbled AI-generated steampunk poster (plan §1 corrections table).
// Export target: 2× screenshot → images/bandwidth-ladder-2026.png

interface Row {
  name: string;
  detail: string;
  bw: number;
  bwLabel: string;
  fill: string;
  fn: string;
  group: string;
}

const G = 'url(#gradGold)';
const C = 'url(#gradCyan)';
const P = 'url(#gradPurple)';
const N = 'url(#gradGreen)';
const R = 'url(#gradGrey)';

const ROWS: Row[] = [
  { name: 'Vera Rubin R200', detail: 'HBM4 · 288 GB', bw: 22000, bwLabel: '22,000', fill: G, fn: '[2]', group: 'DATACENTER ONLY' },
  { name: 'B200 / MI355X', detail: 'HBM3e · 192 / 288 GB', bw: 8000, bwLabel: '8,000', fill: G, fn: '[1][7]', group: 'DATACENTER ONLY' },
  { name: 'H100 SXM', detail: 'HBM3 · 80 GB', bw: 3350, bwLabel: '3,350', fill: G, fn: '[9]', group: 'DATACENTER ONLY' },
  { name: 'RTX 5090 / RTX PRO 6000', detail: 'GDDR7 · 32 / 96 GB', bw: 1792, bwLabel: '1,792', fill: C, fn: '[14][8]', group: 'DESKTOP & WORKSTATION GPU' },
  { name: 'RTX 4090', detail: 'GDDR6X · 24 GB', bw: 1008, bwLabel: '1,008', fill: C, fn: '[14]', group: 'DESKTOP & WORKSTATION GPU' },
  { name: 'RTX 5080', detail: 'GDDR7 · 16 GB', bw: 960, bwLabel: '960', fill: C, fn: '[14]', group: 'DESKTOP & WORKSTATION GPU' },
  { name: 'RTX 4060 Ti 16 GB', detail: 'GDDR6 · 128-bit', bw: 288, bwLabel: '288', fill: C, fn: '[14]', group: 'DESKTOP & WORKSTATION GPU' },
  { name: 'Mac Studio M5 Ultra', detail: 'LPDDR5X · 256–512 GB · peak', bw: 1200, bwLabel: '1,200', fill: P, fn: '[15]', group: 'UNIFIED MEMORY' },
  { name: 'Mac Studio M3 Ultra', detail: 'LPDDR5X · 96–512 GB', bw: 819, bwLabel: '819', fill: P, fn: '[5]', group: 'UNIFIED MEMORY' },
  { name: 'MacBook Pro M4 Max', detail: 'LPDDR5X · 64–128 GB', bw: 546, bwLabel: '546', fill: P, fn: '[6]', group: 'UNIFIED MEMORY' },
  { name: 'DGX Spark (GB10)', detail: 'LPDDR5X · 128 GB', bw: 273, bwLabel: '273', fill: P, fn: '[6]', group: 'UNIFIED MEMORY' },
  { name: 'Strix Halo AI Max+ 395', detail: 'LPDDR5X · 128 GB', bw: 256, bwLabel: '256', fill: P, fn: '[6]', group: 'UNIFIED MEMORY' },
  { name: 'TR Pro 9000WX', detail: 'DDR5-6400 8ch · ≤2 TB', bw: 409.6, bwLabel: '409.6', fill: N, fn: '[4]', group: 'CPU — DDR5' },
  { name: 'TR Pro 7000WX + WRX90', detail: 'DDR5-5200 8ch · 8 DIMMs', bw: 332.8, bwLabel: '332.8 (STREAM ≈ 200–280)', fill: N, fn: '[3]', group: 'CPU — DDR5' },
  { name: 'Consumer DDR5 2ch', detail: 'DDR5-5600→8000', bw: 89.6, bwLabel: '89.6–128 (OC)', fill: N, fn: '[3]', group: 'CPU — DDR5' },
  { name: 'NVLink 6 (Rubin)', detail: 'GPU↔GPU fabric', bw: 3600, bwLabel: '3,600', fill: R, fn: '[2]', group: 'LINKS & FABRIC' },
  { name: 'NVLink 5', detail: 'GPU↔GPU fabric', bw: 1800, bwLabel: '1,800', fill: R, fn: '[1]', group: 'LINKS & FABRIC' },
  { name: 'PCIe 6.0 x16', detail: 'per direction', bw: 128, bwLabel: '128', fill: R, fn: '[2]', group: 'LINKS & FABRIC' },
  { name: 'PCIe 5.0 x16', detail: 'per direction — not a 64–128 "range"', bw: 64, bwLabel: '64', fill: R, fn: '[1]', group: 'LINKS & FABRIC' },
  { name: 'PCIe 4.0 x16', detail: 'budget tier', bw: 32, bwLabel: '32', fill: R, fn: '[1]', group: 'LINKS & FABRIC' },
  { name: 'InfiniBand NDR', detail: '400 Gb/s', bw: 50, bwLabel: '50', fill: R, fn: '[12]', group: 'LINKS & FABRIC' },
  { name: '100 GbE', detail: 'line rate', bw: 12.5, bwLabel: '12.5', fill: R, fn: '', group: 'LINKS & FABRIC' },
  { name: '1 GbE', detail: 'typical NIC', bw: 0.125, bwLabel: '0.125', fill: R, fn: '', group: 'LINKS & FABRIC' },
];

const MIN_L = Math.log10(0.1);
const MAX_L = Math.log10(22000);
const ROW_H = 33;
const HEADER_H = 30;
const TOP = 196;
const LABEL_X = 130;
const BAR_X = 470;
const BAR_W = 780;

/** Interleave group header bands between rows; datacenter-only starts on top.
 *  Bars are LINEAR within each group (full bar = fastest entry of that group),
 *  so lengths are honest ratios; cross-group reads use the printed values. */
type LayoutItem =
  | { kind: 'header'; label: string; y: number; scaleMax: number }
  | { kind: 'row'; row: Row; y: number; w: number };

function layout(): LayoutItem[] {
  const out: LayoutItem[] = [];
  let y = TOP;
  let last: string | null = null;
  let groupMax = 0;
  for (const r of ROWS) {
    if (r.group !== last) {
      groupMax = r.bw;
      out.push({ kind: 'header', label: r.group, y, scaleMax: r.bw });
      y += HEADER_H;
      last = r.group;
    }
    out.push({
      kind: 'row',
      row: r,
      y,
      w: Math.max((r.bw / groupMax) * 640, 4),
    });
    y += ROW_H;
  }
  return out;
}
const LAYOUT = layout();
const CONTENT_H = LAYOUT[LAYOUT.length - 1].y + ROW_H - TOP;

export default function Infographic() {
  const height = CONTENT_H + 300;
  return (
    <svg
      viewBox={`0 0 1600 ${height}`}
      width="1600"
      role="img"
      aria-label="Corrected 2026 bandwidth infographic: tiered ladder with bars linear within each group (datacenter, desktop GPU, unified memory, DDR5, links), with the decode tokens-per-second formula"
      style={{ maxWidth: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#78350f" />
          <stop offset="0.7" stopColor="#d97706" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="gradCyan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#155e75" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="gradPurple" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4c1d95" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="gradGreen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#14532d" />
          <stop offset="1" stopColor="#4ade80" />
        </linearGradient>
        <linearGradient id="gradGrey" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1e293b" />
          <stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id="glowBg" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="rgba(8,145,178,0.25)" />
          <stop offset="1" stopColor="rgba(8,145,178,0)" />
        </radialGradient>
      </defs>

      <rect width="1600" height={height} fill="#020617" />
      <rect width="1600" height="420" fill="url(#glowBg)" />
      <rect x="24" y="24" width="1552" height={height - 48} rx="22" fill="none" stroke="#78350f" strokeWidth="2.5" />
      <rect x="34" y="34" width="1532" height={height - 68} rx="16" fill="none" stroke="rgba(251,191,36,0.25)" strokeWidth="1" />

      {/* Header */}
      <text x="80" y="96" fill="#fbbf24" fontSize="15" fontWeight="700" letterSpacing="6">
        VIDISMART · BANDWIDTH LAB
      </text>
      <text x="80" y="136" fill="#e2e8f0" fontSize="40" fontWeight="800" letterSpacing="-0.5">
        The Bandwidth Ladder — 2026, Corrected
      </text>
      <text x="80" y="160" fill="#94a3b8" fontSize="14">
        Peak memory bandwidth per tier (GB/s). Bars are linear within each group — full bar = fastest of that group. Decode tok/s ≈ bandwidth ÷ model bytes.
      </text>
      <g>
        <rect x="1080" y="62" width="440" height="66" rx="10" fill="rgba(2,6,23,0.7)" stroke="rgba(148,163,184,0.25)" />
        <text x="1096" y="84" fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="2">
          CORRECTIONS vs THE OLD POSTER
        </text>
        <text x="1096" y="101" fill="#e2e8f0" fontSize="12">
          NVL72 (not “NVIX 72”) · 332.8 GB/s 8ch DDR5-5200, 8 DIMMs
        </text>
        <text x="1096" y="118" fill="#e2e8f0" fontSize="12">
          PCIe 5.0 x16 = 64 GB/s per direction · GDDR6 spans 288–1,008
        </text>
      </g>

      {/* Column headers */}
      <text x={LABEL_X} y={TOP - 12} fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="2">
        SYSTEM / LINK
      </text>
      <text x={BAR_X} y={TOP - 12} fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="2">
        BANDWIDTH (LINEAR WITHIN GROUP — GB/s)
      </text>

      {/* Rows + group header bands */}
      {LAYOUT.map((d) =>
        d.kind === 'header' ? (
          <g key={`hdr-${d.label}`} transform={`translate(0 ${d.y})`}>
            <line x1={LABEL_X} y1={HEADER_H - 8} x2={BAR_X + 640} y2={HEADER_H - 8} stroke="rgba(148,163,184,0.25)" />
            <text x={LABEL_X} y={13} fill="#22d3ee" fontSize="11.5" fontWeight="800" letterSpacing="3">
              {d.label}
            </text>
            <text x={BAR_X} y={13} fill="#64748b" fontSize="10.5" className="tabular">
              linear scale · full bar = {d.scaleMax.toLocaleString('en-US')} GB/s
            </text>
          </g>
        ) : (
          <g key={d.row.name} transform={`translate(0 ${d.y})`}>
            <text x={LABEL_X} y={17} fill="#e2e8f0" fontSize="14.5" fontWeight="700">
              {d.row.name} <tspan fill="#22d3ee" fontSize="10.5">{d.row.fn}</tspan>
            </text>
            <text x={LABEL_X} y={31} fill="#64748b" fontSize="11">
              {d.row.detail}
            </text>
            <rect x={BAR_X} y={4} width={d.w} height={26} rx={6} fill={d.row.fill} opacity={0.92} />
            <text x={BAR_X + d.w + 12} y={17} fill={d.row.fill === R ? '#94a3b8' : '#e2e8f0'} fontSize="13" fontWeight="700" className="tabular">
              {d.row.bwLabel}
            </text>
            <text x={BAR_X + d.w + 12} y={31} fill="#64748b" fontSize="10.5">
              GB/s
            </text>
          </g>
        )
      )}

      {/* Group axis baseline */}
      <line x1={BAR_X} y1={TOP} x2={BAR_X} y2={CONTENT_H} stroke="rgba(148,163,184,0.25)" />
      <text x={BAR_X - 8} y={CONTENT_H + 18} fill="#64748b" fontSize="10" textAnchor="end">
        0 GB/s
      </text>

      {/* Formula box */}
      {(() => {
        const fy = CONTENT_H + 44;
        return (
          <g transform={`translate(80 ${fy})`}>
            <rect width="700" height="150" rx="14" fill="rgba(15,23,42,0.8)" stroke="#78350f" strokeWidth="1.5" />
            <text x="24" y="34" fill="#fbbf24" fontSize="13" fontWeight="700" letterSpacing="3">
              THE ONE FORMULA THAT MAKES THE LADDER MEAN SOMETHING
            </text>
            <text x="24" y="68" fill="#e2e8f0" fontSize="19" fontWeight="700" fontFamily="ui-monospace, monospace">
              decode tok/s ≈ bandwidth ÷ model bytes
            </text>
            <text x="24" y="96" fill="#94a3b8" fontSize="12">
              Qwen 3.8 27B Q4 (~17 GB weights + KV fits in single 24 GB card):
            </text>
            <text x="24" y="116" fill="#e2e8f0" fontSize="12" className="tabular">
              RTX 5090 ≈ <tspan fill="#22d3ee" fontWeight="700">94 tok/s</tspan> (prefill 6,800) · 4090 ≈ 52 tok/s · M3 Ultra (eff. 150–180 GB/s) ≈ <tspan fill="#f87171">8.8–10.5 tok/s</tspan> (lucky ~18–20)
            </text>
            <text x="24" y="136" fill="#64748b" fontSize="11">
              70B Q4 (~40 GB): RTX 5090 ≈ 40+ tok/s · M3 Ultra ≈ 15–18 · Strix Halo ≈ 5–6 · DDR5 CPU ≈ 2
            </text>
          </g>
        );
      })()}

      {/* Offload lesson */}
      <g transform={`translate(820 ${CONTENT_H + 44})`}>
        <rect width="700" height="150" rx="14" fill="rgba(15,23,42,0.8)" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" />
        <text x="24" y="34" fill="#f87171" fontSize="13" fontWeight="700" letterSpacing="2">
          THE OFFLOAD TRAP
        </text>
        <text x="24" y="62" fill="#e2e8f0" fontSize="13.5">
          When a model outgrows VRAM, weights stream over PCIe 5.0 x16 (64 GB/s/direction) —
        </text>
        <text x="24" y="82" fill="#e2e8f0" fontSize="13.5">
          host RAM is not a VRAM substitute. Decode collapses ~30×.
        </text>
        <text x="24" y="112" fill="#94a3b8" fontSize="12.5">
          Unified LPDDR5X pools (Strix Halo 256 · Spark 273 · M3 Ultra 819 GB/s) skip the
        </text>
        <text x="24" y="132" fill="#94a3b8" fontSize="12.5">
          PCIe funnel — they buy CAPACITY, not speed. See “1.2 TB/s is not what you buy”.
        </text>
      </g>

      {/* Sources */}
      <g transform={`translate(80 ${CONTENT_H + 214})`}>
        <text fill="#64748b" fontSize="11" fontWeight="700" letterSpacing="2">
          SOURCES
        </text>
        <text y="20" fill="#64748b" fontSize="10.5">
          [1] NVIDIA Blackwell technical brief · [2] NVIDIA Rubin dev blog (Jul 21 2026) · [3] AMD Threadripper PRO white paper (332.8 GB/s) · [4] AMD TR PRO 9000 WX specs (DDR5-6400, 8ch)
        </text>
        <text y="38" fill="#64748b" fontSize="10.5">
          [5] Apple Mac Studio tech specs (122211) · [6] Tom&apos;s Hardware unified-memory study · [7] AMD Instinct MI355X · [8] NVIDIA RTX PRO 6000 · [9] NVIDIA H100 · [12] NVIDIA InfiniBand NDR · [14] GeForce RTX 5090
        </text>
        <text y="56" fill="#475569" fontSize="10">
          Generated by VidiSmart Bandwidth Lab — every number source-linked. Prices are estimates. Peak bandwidth values; real-world ≈ 65–90% (see lab).
        </text>
      </g>
    </svg>
  );
}