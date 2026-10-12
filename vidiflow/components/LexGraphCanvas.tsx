'use client';

import { useEffect, useRef, useState } from 'react';
import { REL_COLORS, type RelType } from '@/lib/lex';

export type NodeKind = 'center' | 'curated' | 'term' | 'external';

export interface GraphNodeSpec {
  id: string;
  label: string;
  kind: NodeKind;
}

export interface GraphEdgeSpec {
  s: string;
  t: string;
  r: RelType;
}

interface SimNode extends GraphNodeSpec {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  degree: number;
}

interface Tooltip {
  x: number;
  y: number;
  label: string;
  detail: string;
  selectable: boolean;
}

interface Props {
  /** Rebuild the simulation when this changes. */
  specKey: string;
  nodes: GraphNodeSpec[];
  edges: GraphEdgeSpec[];
  centerId?: string | null;
  onSelect?: (id: string) => void;
  height?: number;
  ariaLabel?: string;
}

const KIND_FILL: Record<NodeKind, string> = {
  center: '#22d3ee',
  curated: '#fbbf24',
  term: '#67e8f9',
  external: '#334155',
};

export default function LexGraphCanvas({
  specKey,
  nodes,
  edges,
  centerId = null,
  onSelect,
  height = 520,
  ariaLabel = 'Relationship graph',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  // Mutable sim state lives in refs (rebuilt on specKey change).
  const simRef = useRef<{
    nodes: SimNode[];
    byId: Map<string, SimNode>;
    edges: { s: SimNode; t: SimNode; r: RelType; off: number }[];
    alpha: number;
    transform: { x: number; y: number; k: number };
    hover: SimNode | null;
    drag: SimNode | null;
    panning: boolean;
    lastPointer: { x: number; y: number } | null;
    downPos: { x: number; y: number } | null;
    pulse: { node: SimNode; t0: number } | null;
    raf: number;
    running: boolean;
    reduced: boolean;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cleanupFns: (() => void)[] = [];

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---- build sim -------------------------------------------------------
    const degree = new Map<string, number>();
    for (const e of edges) {
      degree.set(e.s, (degree.get(e.s) ?? 0) + 1);
      degree.set(e.t, (degree.get(e.t) ?? 0) + 1);
    }
    const width = wrap.clientWidth || 800;
    const snodes: SimNode[] = nodes.map((n, i) => {
      const deg = degree.get(n.id) ?? 0;
      const isCenter = n.id === centerId;
      const angle = (i / Math.max(1, nodes.length)) * Math.PI * 2;
      const radius = isCenter ? 0 : 90 + (i % 7) * 26;
      return {
        ...n,
        degree: deg,
        r: isCenter ? 13 : n.kind === 'curated' ? 9 : n.kind === 'term' ? 6.5 : 4.5,
        x: Math.cos(angle) * radius + (Math.random() - 0.5) * 12,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 12,
        vx: 0,
        vy: 0,
      };
    });
    const byId = new Map(snodes.map((n) => [n.id, n]));
    // multi-edge offsets so parallel typed edges between a pair stay visible
    const pairCount = new Map<string, number>();
    const sedges = edges.flatMap((e) => {
      const s = byId.get(e.s);
      const t = byId.get(e.t);
      if (!s || !t || s === t) return [];
      const key = s.id < t.id ? `${s.id}\u0000${t.id}` : `${t.id}\u0000${s.id}`;
      const idx = pairCount.get(key) ?? 0;
      pairCount.set(key, idx + 1);
      return [{ s, t, r: e.r, off: idx * 4 }];
    });

    const sim = {
      nodes: snodes,
      byId,
      edges: sedges,
      alpha: 1,
      transform: { x: width / 2, y: height / 2, k: 1 },
      hover: null as SimNode | null,
      drag: null as SimNode | null,
      panning: false,
      lastPointer: null as { x: number; y: number } | null,
      downPos: null as { x: number; y: number } | null,
      pulse: null as { node: SimNode; t0: number } | null,
      raf: 0,
      running: false,
      reduced,
      width,
      height,
    };
    simRef.current = sim;

    // ---- physics ---------------------------------------------------------
    const big = snodes.length > 120;
    const SPRING = big ? 235 : 78;
    const REPULSE = big ? 30000 : 1700;
    const DECAY = big ? 0.9955 : 0.988;
    const GRAV = big ? 0.001 : 0.004;
    const PULSE_LIFE = 2600;

    function tick() {
      const { nodes: ns, edges: es } = sim;
      const center = centerId ? byId.get(centerId) : undefined;
      // repulsion (O(n^2), fine for <= ~400 nodes)
      for (let i = 0; i < ns.length; i++) {
        const a = ns[i];
        for (let j = i + 1; j < ns.length; j++) {
          const b = ns[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            dx = (Math.random() - 0.5) * 2;
            dy = (Math.random() - 0.5) * 2;
            d2 = dx * dx + dy * dy;
          }
          if (d2 > 250000) continue;
          const f = (REPULSE * sim.alpha) / d2;
          const d = Math.sqrt(d2);
          const fx = (dx / d) * f;
          const fy = (dy / d) * f;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }
      // springs
      for (const e of es) {
        const dx = e.t.x - e.s.x;
        const dy = e.t.y - e.s.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const f = ((d - SPRING) / d) * 0.035 * sim.alpha;
        e.s.vx += dx * f;
        e.s.vy += dy * f;
        e.t.vx -= dx * f;
        e.t.vy -= dy * f;
      }
      // gravity + integrate
      for (const n of ns) {
        if (center && n !== center && centerId) {
          n.vx += (center.x - n.x) * 0.008 * sim.alpha;
          n.vy += (center.y - n.y) * 0.008 * sim.alpha;
        } else if (!center) {
          n.vx += -n.x * GRAV * sim.alpha;
          n.vy += -n.y * GRAV * sim.alpha;
        }
        if (n === center || n === sim.drag) {
          n.vx = 0;
          n.vy = 0;
          continue;
        }
        n.vx *= 0.82;
        n.vy *= 0.82;
        if (big) {
          if (n.vx > 7) n.vx = 7;
          else if (n.vx < -7) n.vx = -7;
          if (n.vy > 7) n.vy = 7;
          else if (n.vy < -7) n.vy = -7;
        }
        n.x += n.vx;
        n.y += n.vy;
      }
      if (center) {
        center.x = 0;
        center.y = 0;
      }
      sim.alpha *= DECAY;
    }

    // ---- render ------------------------------------------------------------
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sim.width = wrap!.clientWidth || 800;
      sim.height = height;
      canvas!.width = Math.round(sim.width * dpr);
      canvas!.height = Math.round(sim.height * dpr);
      canvas!.style.width = `${sim.width}px`;
      canvas!.style.height = `${sim.height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function toScreen(n: { x: number; y: number }) {
      return {
        x: n.x * sim.transform.k + sim.transform.x,
        y: n.y * sim.transform.k + sim.transform.y,
      };
    }

    function draw() {
      if (!ctx) return;
      const { width: w, height: h, transform: tr } = sim;
      ctx.clearRect(0, 0, w, h);
      // edges
      for (const e of sim.edges) {
        const a = toScreen(e.s);
        const b = toScreen(e.t);
        const hot =
          sim.hover && (e.s === sim.hover || e.t === sim.hover);
        ctx.strokeStyle = REL_COLORS[e.r] ?? '#475569';
        ctx.globalAlpha = hot ? 0.95 : e.s.kind === 'external' && e.t.kind === 'external' ? 0.14 : 0.34;
        ctx.lineWidth = (hot ? 1.8 : 1) * (e.off ? 1 : 1);
        ctx.beginPath();
        if (e.off) {
          // slight quadratic bow so parallel typed edges separate visually
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.max(1, Math.hypot(dx, dy));
          const ox = (-dy / d) * e.off * 2 * tr.k;
          const oy = (dx / d) * e.off * 2 * tr.k;
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx + ox, my + oy, b.x, b.y);
        } else {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // activation pulse ring (under nodes)
      const pulseAge = sim.pulse ? (performance.now() - sim.pulse.t0) / 1000 : -1;
      if (sim.pulse && pulseAge >= 0 && pulseAge < PULSE_LIFE / 1000) {
        const n = sim.pulse.node;
        const p = toScreen(n);
        const r = Math.max(2, n.r * Math.min(1.6, Math.max(0.55, tr.k)));
        const prog = pulseAge / (PULSE_LIFE / 1000);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.globalAlpha = (1 - prog) * 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3 + prog * 36, 0, Math.PI * 2);
        ctx.stroke();
        if (prog < 0.75) {
          ctx.globalAlpha = (0.75 - prog) * 0.6;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 2 + prog * 62, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // nodes
      const egoMode = sim.nodes.length <= 80;
      const showAllLabels = egoMode || tr.k > 1.5;
      for (const n of sim.nodes) {
        const p = toScreen(n);
        if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) continue;
        const r = Math.max(2, n.r * Math.min(1.6, Math.max(0.55, tr.k)));
        if (n === sim.hover || n.id === centerId) {
          ctx.shadowColor = REL_COLORS.synonym;
          ctx.shadowBlur = 14;
        } else if (sim.pulse && n === sim.pulse.node) {
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 22;
        }
        ctx.fillStyle = KIND_FILL[n.kind];
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (n.kind === 'external') {
          ctx.strokeStyle = 'rgba(148,163,184,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        if (n.id === centerId) {
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r + 3.5, 0, Math.PI * 2);
          ctx.stroke();
        }
        const labelWorthy =
          n === sim.hover ||
          n.id === centerId ||
          n.kind === 'curated' ||
          (showAllLabels && (egoMode || n.kind !== 'external')) ||
          (tr.k > 1 && n.kind === 'term') ||
          n.degree >= 6;
        if (labelWorthy) {
          ctx.font = `${n === sim.hover || n.id === centerId ? 700 : 600} ${
            n.kind === 'external' ? 10 : 11
          }px 'Kumbh Sans', system-ui, sans-serif`;
          ctx.fillStyle =
            n === sim.hover || n.id === centerId
              ? '#e2e8f0'
              : n.kind === 'external'
                ? 'rgba(148,163,184,0.75)'
                : 'rgba(226,232,240,0.9)';
          ctx.textAlign = 'center';
          ctx.fillText(n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label, p.x, p.y - r - 5);
        }
      }
      // activation popup card (on top)
      if (sim.pulse && pulseAge >= 0 && pulseAge < PULSE_LIFE / 1000) {
        const n = sim.pulse.node;
        const p = toScreen(n);
        const prog = pulseAge / (PULSE_LIFE / 1000);
        const appear = Math.min(1, pulseAge / 0.25);
        const fade = Math.min(1, ((PULSE_LIFE / 1000 - pulseAge) / 0.4));
        const a = appear * Math.max(0, fade);
        const label = n.label.length > 24 ? `${n.label.slice(0, 23)}…` : n.label;
        const sub = `${n.degree} link${n.degree === 1 ? '' : 's'}${n.kind === 'curated' ? ' · curated' : ''}`;
        ctx.font = `700 12px 'Kumbh Sans', system-ui, sans-serif`;
        const cw = Math.max(96, ctx.measureText(label).width + 26);
        const ch = 40;
        const cx = Math.min(w - cw - 6, Math.max(6, p.x - cw / 2));
        const cy = p.y - 78;
        ctx.globalAlpha = a;
        ctx.fillStyle = 'rgba(3,12,26,0.94)';
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const cr = 8;
        ctx.moveTo(cx + cr, cy);
        ctx.arcTo(cx + cw, cy, cx + cw, cy + ch, cr);
        ctx.arcTo(cx + cw, cy + ch, cx, cy + ch, cr);
        ctx.arcTo(cx, cy + ch, cx, cy, cr);
        ctx.arcTo(cx, cy, cx + cw, cy, cr);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, cy + ch);
        ctx.lineTo(p.x + 4, cy + ch);
        ctx.closePath();
        ctx.fillStyle = 'rgba(3,12,26,0.94)';
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.stroke();
        ctx.fillStyle = 'rgba(3,12,26,1)';
        ctx.fillRect(p.x - 3, cy + ch - 1, 6, 2);
        ctx.fillStyle = '#e2e8f0';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx + cw / 2, cy + 16);
        ctx.font = `500 10px 'Kumbh Sans', system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(103,232,249,0.85)';
        ctx.fillText(sub, cx + cw / 2, cy + 30);
        ctx.globalAlpha = 1;
      }
    }

    function fit() {
      if (!sim.nodes.length) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      if (big) {
        // percentile bbox: ignore the few flung outliers so the core fills the view
        const xs = sim.nodes.map((n) => n.x).sort((a, b) => a - b);
        const ys = sim.nodes.map((n) => n.y).sort((a, b) => a - b);
        const q = (arr: number[], p: number) => arr[Math.floor(p * (arr.length - 1))];
        minX = q(xs, 0.03); maxX = q(xs, 0.97);
        minY = q(ys, 0.03); maxY = q(ys, 0.97);
      } else {
        for (const n of sim.nodes) {
          minX = Math.min(minX, n.x);
          minY = Math.min(minY, n.y);
          maxX = Math.max(maxX, n.x);
          maxY = Math.max(maxY, n.y);
        }
      }
      const pad = 48;
      const bw = Math.max(1, maxX - minX);
      const bh = Math.max(1, maxY - minY);
      const k = Math.min(1.6, Math.min((sim.width - pad * 2) / bw, (sim.height - pad * 2) / bh));
      sim.transform.k = k;
      if (centerId) {
        sim.transform.x = sim.width / 2;
        sim.transform.y = sim.height / 2;
      } else {
        sim.transform.x = sim.width / 2 - ((minX + maxX) / 2) * k;
        sim.transform.y = sim.height / 2 - ((minY + maxY) / 2) * k;
      }
    }

    function loop() {
      if (!simRef.current || simRef.current !== sim) return;
      const pulseAlive =
        sim.pulse && performance.now() - sim.pulse.t0 < PULSE_LIFE;
      if (sim.alpha > 0.004 || sim.drag || pulseAlive) {
        tick();
        draw();
        sim.raf = requestAnimationFrame(loop);
      } else {
        if (sim.pulse) {
          sim.pulse = null;
          draw();
        }
        sim.running = false;
      }
    }

    function reheat(a = 0.5) {
      sim.alpha = Math.max(sim.alpha, a);
      if (!sim.running && !sim.reduced) {
        sim.running = true;
        sim.raf = requestAnimationFrame(loop);
      }
    }

    // ---- warmup + initial fit ---------------------------------------------
    resize();
    const warmTicks = reduced ? 320 : big ? 420 : 140;
    for (let i = 0; i < warmTicks; i++) tick();
    sim.alpha = reduced ? 0 : 0.42;
    fit();
    draw();
    if (!reduced) {
      sim.running = true;
      sim.raf = requestAnimationFrame(loop);
    }

    // ---- activation pulses (atlas core) ------------------------------------
    let firstPulse = 0;
    function startPulse() {
      if (simRef.current !== sim || sim.hover) return;
      const pool = sim.nodes.filter(
        (n) => n.kind === 'curated' || (n.kind === 'term' && n.degree >= 3),
      );
      const bag = pool.length ? pool : sim.nodes.filter((n) => n.kind !== 'external');
      if (!bag.length) return;
      const node = bag[Math.floor(Math.random() * bag.length)];
      sim.pulse = { node, t0: performance.now() };
      if (sim.reduced) draw();
      else if (!sim.running) {
        sim.running = true;
        sim.raf = requestAnimationFrame(loop);
      }
    }
    if (sim.nodes.length > 1) {
      firstPulse = window.setTimeout(startPulse, 900);
      const pulseTimer = window.setInterval(startPulse, 4000);
      cleanupFns.push(() => {
        window.clearTimeout(firstPulse);
        window.clearInterval(pulseTimer);
      });
    }

    // ---- interaction --------------------------------------------------------
    function pick(cx: number, cy: number): SimNode | null {
      let best: SimNode | null = null;
      let bestD = 14;
      for (const n of sim.nodes) {
        const p = toScreen(n);
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < bestD + n.r) {
          if (!best || d < bestD) {
            best = n;
            bestD = d;
          }
        }
      }
      return best;
    }

    function onPointerDown(ev: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      sim.downPos = { x: cx, y: cy };
      sim.lastPointer = { x: cx, y: cy };
      const hit = pick(cx, cy);
      if (hit && hit.kind !== 'external') {
        sim.drag = hit;
        canvas!.setPointerCapture(ev.pointerId);
      } else {
        sim.panning = true;
      }
      canvas!.style.cursor = hit ? 'grabbing' : 'move';
    }

    function onPointerMove(ev: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const last = sim.lastPointer ?? { x: cx, y: cy };
      if (sim.drag) {
        sim.drag.x = (cx - sim.transform.x) / sim.transform.k;
        sim.drag.y = (cy - sim.transform.y) / sim.transform.k;
        reheat(0.28);
        if (sim.reduced) draw();
      } else if (sim.panning) {
        sim.transform.x += cx - last.x;
        sim.transform.y += cy - last.y;
        if (sim.reduced) draw();
        else draw();
      } else {
        const hit = pick(cx, cy);
        if (hit !== sim.hover) {
          sim.hover = hit;
          canvas!.style.cursor = hit ? (hit.kind === 'external' ? 'default' : 'pointer') : 'default';
          if (hit) {
            setTooltip({
              x: cx,
              y: cy,
              label: hit.label,
              detail:
                hit.kind === 'external'
                  ? `${hit.degree} link${hit.degree === 1 ? '' : 's'} · not in corpus yet`
                  : `${hit.degree} link${hit.degree === 1 ? '' : 's'} · click to open`,
              selectable: hit.kind !== 'external',
            });
          } else {
            setTooltip(null);
          }
          if (sim.reduced) draw();
          else reheat(0.06);
        } else if (hit) {
          setTooltip((tt) => (tt ? { ...tt, x: cx, y: cy } : tt));
        }
      }
      sim.lastPointer = { x: cx, y: cy };
    }

    function onPointerUp(ev: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const moved = sim.downPos ? Math.hypot(cx - sim.downPos.x, cy - sim.downPos.y) : 99;
      if (moved < 5) {
        const hit = pick(cx, cy);
        if (hit && hit.kind !== 'external' && onSelect) onSelect(hit.id);
      }
      sim.drag = null;
      sim.panning = false;
      sim.downPos = null;
      canvas!.style.cursor = 'default';
      reheat(0.12);
    }

    function onWheel(ev: WheelEvent) {
      ev.preventDefault();
      const rect = canvas!.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const factor = Math.exp(-ev.deltaY * 0.0016);
      const k2 = Math.min(4, Math.max(0.25, sim.transform.k * factor));
      const ratio = k2 / sim.transform.k;
      sim.transform.x = cx - (cx - sim.transform.x) * ratio;
      sim.transform.y = cy - (cy - sim.transform.y) * ratio;
      sim.transform.k = k2;
      draw();
    }

    function onLeave() {
      sim.hover = null;
      setTooltip(null);
      if (sim.reduced) draw();
    }

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(wrap);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      for (const fn of cleanupFns) fn();
      cancelAnimationFrame(sim.raf);
      ro.disconnect();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('wheel', onWheel);
      if (simRef.current === sim) simRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey, height]);

  return (
    <div ref={wrapRef} className="lex-canvas-wrap" style={{ height }}>
      <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />
      {tooltip && (
        <div
          className="lex-tooltip"
          style={{
            left: Math.min(tooltip.x + 14, (wrapRef.current?.clientWidth ?? 400) - 190),
            top: Math.max(4, tooltip.y - 40),
          }}
        >
          <strong>{tooltip.label}</strong>
          <span className={tooltip.selectable ? 'lex-tip-go' : 'lex-tip-dim'}>
            {tooltip.detail}
          </span>
        </div>
      )}
    </div>
  );
}
