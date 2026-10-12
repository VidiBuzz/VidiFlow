'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import LexGraphCanvas, {
  type GraphEdgeSpec,
  type GraphNodeSpec,
} from '@/components/LexGraphCanvas';
import {
  CDN_BASE,
  REL_COLORS,
  REL_LABELS,
  REL_TYPES,
  defaultSenseIdx,
  flattenStruct,
  formatFreq,
  type LexAtlas,
  type LexIndex,
  type LexIndexEntry,
  type LexSense,
  type LexTerm,
  type RelType,
} from '@/lib/lex';

type Mode = 'focus' | 'atlas';

function senseRelGroups(sense: LexSense): [RelType, string[]][] {
  return [
    ['synonym', sense.synonyms],
    ['antonym', sense.antonyms],
    ['hypernym', sense.hypernyms],
    ['hyponym', sense.hyponyms],
    ['collocation', sense.collocations],
    ['derivation', flattenStruct(sense.derivations)],
    ['inflection', flattenStruct(sense.inflections)],
  ];
}

export default function LexExplorer() {
  const [index, setIndex] = useState<LexIndex | null>(null);
  const [indexError, setIndexError] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [term, setTerm] = useState<LexTerm | null>(null);
  const [termLoading, setTermLoading] = useState(false);
  const [senseIdx, setSenseIdx] = useState(0);
  const [mode, setMode] = useState<Mode>('focus');
  const [atlas, setAtlas] = useState<LexAtlas | null>(null);
  const [imgOk, setImgOk] = useState(true);
  const initialSense = useRef<number | null>(null);

  const indexByW = useMemo(() => {
    const m = new Map<string, LexIndexEntry>();
    for (const t of index?.terms ?? []) m.set(t.w, t);
    return m;
  }, [index]);

  // ---- load index + initial ?t= selection --------------------------------
  useEffect(() => {
    let cancelled = false;
    // capture once, before the URL-sync effect can rewrite the address bar
    const initialParams = new URLSearchParams(window.location.search);
    const sRaw = Number(initialParams.get('s'));
    if (Number.isInteger(sRaw) && sRaw >= 0) initialSense.current = sRaw;
    fetch('/lex/index.json')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: LexIndex) => {
        if (cancelled) return;
        setIndex(d);
        const t = initialParams.get('t');
        const byW = new Set(d.terms.map((e) => e.w));
        if (t && byW.has(t.toLowerCase())) {
          setSelected(t.toLowerCase());
        } else {
          const first = d.terms.find((e) => e.c && e.n > 0) ?? d.terms[0];
          if (first) setSelected(first.w);
        }
      })
      .catch(() => !cancelled && setIndexError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- load term file on selection ----------------------------------------
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setTermLoading(true);
    setImgOk(true);
    fetch(`/lex/terms/${selected}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: LexTerm) => {
        if (cancelled) return;
        setTerm(d);
        // deep-linked ?s applies to the first term only; after that the
        // default sense is highest wiki_frequency, tie -> lowest sense_index
        const s = initialSense.current;
        initialSense.current = null;
        setSenseIdx(
          s != null && s < d.senses.length
            ? s
            : defaultSenseIdx(d.senses),
        );
      })
      .catch(() => !cancelled && setTerm(null))
      .finally(() => !cancelled && setTermLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  // ---- shareable URL state (?t=&s=) ----------------------------------------
  useEffect(() => {
    if (!selected || typeof window === 'undefined') return;
    const qs = new URLSearchParams();
    if (selected) qs.set('t', selected);
    if (selected && term && term.senses.length > 1 && senseIdx >= 0) qs.set('s', String(senseIdx));
    const q = qs.toString();
    window.history.replaceState(null, '', q ? `${window.location.pathname}?${q}` : window.location.pathname);
  }, [selected, senseIdx, term]);

  // ---- lazy atlas fetch -----------------------------------------------------
  useEffect(() => {
    if (mode !== 'atlas' || atlas) return;
    fetch('/lex/graph.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAtlas(d as LexAtlas))
      .catch(() => {});
  }, [mode, atlas]);

  // ---- search ----------------------------------------------------------------
  const results = useMemo(() => {
    const all = index?.terms ?? [];
    const q = query.trim().toLowerCase();
    if (!q) {
      return all.filter((e) => e.c || e.rank !== null).slice(0, 48);
    }
    const scored = all
      .map((e) => {
        const w = e.w;
        const acr = (e.acr ?? '').toLowerCase();
        const full = (e.full ?? '').toLowerCase();
        const ol = (e.ol ?? '').toLowerCase();
        const snip = (e.s ?? '').toLowerCase();
        let score = -1;
        if (w === q || acr === q) score = 0;
        else if (w.startsWith(q) || acr.startsWith(q)) score = 1;
        else if (w.includes(q) || acr.includes(q)) score = 2;
        else if (full.includes(q)) score = 3;
        else if (ol.includes(q) || snip.includes(q)) score = 4;
        return score < 0 ? null : { e, score };
      })
      .filter((x): x is { e: LexIndexEntry; score: number } => x !== null);
    scored.sort(
      (a, b) =>
        a.score - b.score ||
        Number(b.e.c) - Number(a.e.c) ||
        (a.e.rank ?? 1e9) - (b.e.rank ?? 1e9),
    );
    return scored.slice(0, 60).map((x) => x.e);
  }, [index, query]);

  // ---- ego graph spec ---------------------------------------------------------
  const ego = useMemo(() => {
    if (!term || !selected || senseIdx < 0 || !term.senses[senseIdx]) {
      return { nodes: [] as GraphNodeSpec[], edges: [] as GraphEdgeSpec[] };
    }
    const sense = term.senses[senseIdx];
    const nodes: GraphNodeSpec[] = [
      {
        id: selected,
        label: term.acr ?? term.word,
        kind: 'center',
      },
    ];
    const edges: GraphEdgeSpec[] = [];
    const seenNode = new Set<string>([selected]);
    const seenEdge = new Set<string>();
    for (const e of sense.edges) {
      const t = (e.t ?? '').trim();
      if (!t) continue;
      const low = t.toLowerCase();
      if (low === selected) continue;
      const ek = `${low}\u0000${e.r}`;
      if (!seenEdge.has(ek)) {
        seenEdge.add(ek);
        edges.push({ s: selected, t: low, r: e.r });
      }
      if (!seenNode.has(low)) {
        seenNode.add(low);
        const hit = indexByW.get(low);
        nodes.push({
          id: low,
          label: t,
          kind: hit ? (hit.c ? 'curated' : 'term') : 'external',
        });
      }
    }
    return { nodes, edges };
  }, [term, selected, senseIdx, indexByW]);

  const atlasSpec = useMemo(() => {
    if (!atlas) return { nodes: [] as GraphNodeSpec[], edges: [] as GraphEdgeSpec[] };
    return {
      nodes: atlas.nodes.map((n) => ({
        id: n.id,
        label: n.label,
        kind: (n.id === selected ? 'center' : n.c ? 'curated' : 'term') as GraphNodeSpec['kind'],
      })),
      edges: atlas.edges.map((e) => ({ s: e.s, t: e.t, r: e.r })),
    };
  }, [atlas, selected]);

  const handleSelect = (id: string) => {
    if (!indexByW.has(id)) return;
    setSelected(id);
    setMode('focus');
    if (window.innerWidth < 1180) {
      document.getElementById('lex-term-card')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const entry = selected ? indexByW.get(selected) : undefined;
  const sense = term && senseIdx >= 0 ? term.senses[senseIdx] : undefined;
  const curated = term?.curated ?? null;

  return (
    <main className="lex-main">
      <header className="lex-header">
        <div>
          <p className="eyebrow">VidiFlow · Lexi</p>
          <h1 className="lex-title">
            Lexi — every tech term, explained
          </h1>
          <p className="muted lex-subtitle">
            {index ? (
              <>
                <strong>{index.total}</strong> terms · <strong>OpenGloss v1.1</strong> sense-level
                graph. Lexi is VidiFlow&apos;s tech-term expert — search a term, see what it actually
                means, walk its typed edges, hop sense by sense.
              </>
            ) : (
              'Loading corpus index…'
            )}
          </p>
        </div>
        <nav className="lex-nav" aria-label="Site">
          <Link href="/" className="chip">← VidiFlow</Link>
          <Link href="/agents" className="chip">🎛️ Agent Fleet</Link>
        </nav>
      </header>

      <section className="glass card lex-intro" aria-label="What Lexi is">
        <div className="lex-intro-item">
          <p className="eyebrow">Who Lexi is</p>
          <p className="muted">
            VidiFlow&apos;s in-house expert on every tech term ever coined — each acronym and word
            gets a visualization and a demonstration, not a wall of text.
          </p>
        </div>
        <div className="lex-intro-item">
          <p className="eyebrow">Where it runs</p>
          <p className="muted">
            The LEX browser extension — hover any tech term in any document, save it, and stack it —
            plus this live atlas, where the whole corpus is explorable.
          </p>
        </div>
        <div className="lex-intro-item">
          <p className="eyebrow">Why it matters</p>
          <p className="muted">
            Saved terms feed your Smart Stack, and your Smart Stack feeds VidiFlow&apos;s visual view
            of your whole agentic + human workforce.
          </p>
        </div>
      </section>

      <div className="lex-grid">
        {/* ---------------- left: search ---------------- */}
        <section className="glass card lex-search-col" aria-label="Term search">
          <label className="field" style={{ marginBlockStart: 0 }}>
            <span>Search the corpus</span>
            <input
              className="lex-search"
              type="search"
              placeholder="api, rag, saas, interface…"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
              aria-label="Search terms"
            />
          </label>
          <p className="faint lex-results-count">
            {query.trim()
              ? `${results.length} match${results.length === 1 ? '' : 'es'}`
              : `Featured — ${index?.total ?? 0} terms in corpus`}
          </p>
          <div className="lex-results" role="list">
            {results.map((e) => (
              <button
                key={e.w}
                role="listitem"
                className="lex-result"
                aria-pressed={e.w === selected}
                onClick={() => handleSelect(e.w)}
              >
                <span className="lex-result-name">
                  {e.acr ?? e.w}
                  {e.c && <i className="lex-star" title="Curated LEX term">★</i>}
                </span>
                <span className="lex-result-meta">
                  {e.d && <b className="lex-dom">{e.d}</b>}
                  {e.n > 0 ? `${e.n} sense${e.n === 1 ? '' : 's'}` : 'curated only'}
                  {e.rank != null && ` · rank ${formatFreq(e.rank)}`}
                </span>
                <span className="lex-result-snip">{e.ol || e.s || e.full}</span>
              </button>
            ))}
            {!results.length && <p className="faint">No matches.</p>}
          </div>
          <div className="lex-legend" aria-label="Edge type legend">
            {REL_TYPES.map((r) => (
              <span key={r}>
                <i style={{ background: REL_COLORS[r] }} /> {REL_LABELS[r].split(' · ')[0]}
              </span>
            ))}
          </div>
        </section>

        {/* ---------------- center: graph ---------------- */}
        <section className="glass card lex-graph-card" aria-label="Relationship graph">
          <div className="lex-graph-head">
            <div>
              <p className="eyebrow">{mode === 'focus' ? 'Ego graph' : 'Corpus atlas'}</p>
              <h2 className="lex-graph-title">
                {mode === 'focus'
                  ? sense
                    ? `${term?.acr ?? term?.word ?? selected} — sense ${sense.sense_index} (${sense.pos})`
                    : (term?.acr ?? term?.word ?? selected ?? '—')
                  : 'Featured tech constellation'}
              </h2>
            </div>
            <div className="seg" role="group" aria-label="Graph mode">
              <button className="chip" aria-pressed={mode === 'focus'} onClick={() => setMode('focus')}>
                Focus
              </button>
              <button className="chip" aria-pressed={mode === 'atlas'} onClick={() => setMode('atlas')}>
                Atlas
              </button>
            </div>
          </div>
          {mode === 'focus' ? (
            ego.nodes.length > 1 ? (
              <LexGraphCanvas
                key={`ego:${selected}:${senseIdx}`}
                specKey={`ego:${selected}:${senseIdx}:${term?.generated_at ?? ''}`}
                nodes={ego.nodes}
                edges={ego.edges}
                centerId={selected}
                onSelect={handleSelect}
                ariaLabel={`Relationship graph for ${term?.word ?? selected}, sense ${senseIdx}`}
              />
            ) : (
              <div className="lex-canvas-wrap lex-empty" style={{ height: 520 }}>
                <p className="faint">
                  {termLoading
                    ? 'Loading term…'
                    : 'This term has no OpenGloss edges yet — curated card only.'}
                </p>
              </div>
            )
          ) : atlas ? (
            <LexGraphCanvas
              specKey={`atlas:${atlas.generated_at}:${selected ?? ''}`}
              nodes={atlasSpec.nodes}
              edges={atlasSpec.edges}
              onSelect={handleSelect}
              height={560}
              ariaLabel="Featured terms constellation from the technology-domain sweep"
            />
          ) : (
            <div className="lex-canvas-wrap lex-empty" style={{ height: 560 }}>
              <p className="faint">Loading atlas…</p>
            </div>
          )}
          <p className="faint lex-graph-hint">
            drag nodes · scroll to zoom · click a glowing node to travel · dimmed nodes are
            outside tonight&apos;s corpus
          </p>
        </section>

        {/* ---------------- right: term card ---------------- */}
        <section className="glass card lex-card" id="lex-term-card" aria-label="Term detail">
          {indexError && (
            <p className="lex-error">Could not load /lex/index.json — rebuild the ETL artifacts.</p>
          )}
          {termLoading && !term && <p className="faint">Loading term…</p>}
          {!termLoading && !term && !indexError && (
            <p className="faint">Pick a term from the list.</p>
          )}
          {term && (
            <>
              <div className="lex-term-head">
                <div>
                  <h2 className="lex-term-name">{term.acr ?? term.word}</h2>
                  {curated?.full && <p className="muted lex-term-full">{curated.full}</p>}
                </div>
                <div className="lex-badges">
                  {curated && <span className="lex-badge lex-badge-gold">★ curated LEX</span>}
                  {sense?.domain && <span className="lex-badge">{sense.domain}</span>}
                  {sense?.reading_level && <span className="lex-badge">read · {sense.reading_level}</span>}
                  {sense?.wiki_frequency != null && (
                    <span className="lex-badge tabular">
                      wiki {formatFreq(sense.wiki_frequency)}
                      {sense.wiki_frequency_rank != null && ` · #${formatFreq(sense.wiki_frequency_rank)}`}
                    </span>
                  )}
                  {entry && entry.n === 0 && <span className="lex-badge">no OpenGloss senses</span>}
                </div>
              </div>

              {curated?.oneLiner && <p className="lex-oneliner">{curated.oneLiner}</p>}

              {curated?.conceptImg && imgOk && (
                <figure className="lex-concept">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${CDN_BASE}${curated.conceptImg}`}
                    alt={curated.conceptDesc || `${curated.acr} concept art`}
                    loading="lazy"
                    onError={() => setImgOk(false)}
                  />
                  {curated.conceptDesc && <figcaption className="faint">{curated.conceptDesc}</figcaption>}
                </figure>
              )}

              {curated && curated.anatomy && curated.anatomy.length > 0 && (
                <div className="lex-anatomy" aria-label="Acronym anatomy">
                  {curated.anatomy.map((a, i) => (
                    <span key={i} className="lex-anatomy-item" title={a.desc}>
                      <b>{a.letter}</b>
                      {a.icon} {a.word}
                      {a.role && <i>{a.role}</i>}
                    </span>
                  ))}
                </div>
              )}

              {curated?.flow && curated.flow.length > 0 && (
                <div className="lex-flow" aria-label="How it flows">
                  {curated.flow.slice(0, 4).map((f, i) => (
                    <div key={i} className={`lex-flow-step${f.active ? ' active' : ''}`}>
                      <span className="lex-flow-icon">{f.icon ?? '▸'}</span>
                      <b>{f.title}</b>
                      <span className="faint">{f.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {curated?.smartStack?.legacyStack && curated?.smartStack?.newStack && (
                <details className="lex-stack" open>
                  <summary>
                    {curated.smartStack.icon ?? '⚡'} {curated.smartStack.headline || 'Smart Stack'}
                  </summary>
                  {curated.smartStack.description && (
                    <p className="faint lex-stack-desc">{curated.smartStack.description}</p>
                  )}
                  <div className="lex-stack-cols">
                    <div className="lex-stack-col legacy">
                      <h4>Legacy</h4>
                      {curated.smartStack.legacyStack.map((s, i) => (
                        <p key={i}>
                          <span>{s.icon}</span>
                          <b>{s.label}</b>
                          {s.note && <i className="faint">{s.note}</i>}
                        </p>
                      ))}
                    </div>
                    <div className="lex-stack-col fresh">
                      <h4>Smart</h4>
                      {curated.smartStack.newStack.map((s, i) => (
                        <p key={i}>
                          <span>{s.icon}</span>
                          <b>{s.label}</b>
                          {s.note && <i className="faint">{s.note}</i>}
                        </p>
                      ))}
                    </div>
                  </div>
                </details>
              )}

              {curated?.keywords && curated.keywords.length > 0 && (
                <div className="lex-keywords">
                  {curated.keywords.map((k) => (
                    <span key={k} className="lex-kw">{k}</span>
                  ))}
                </div>
              )}

              {term.senses.length > 0 && (
                <>
                  <div className="lex-senses" role="group" aria-label="Sense switcher">
                    {term.senses.map((s, i) => (
                      <button
                        key={s.source_id}
                        className="lex-sense-btn"
                        aria-pressed={i === senseIdx}
                        onClick={() => setSenseIdx(i)}
                        title={s.definition.slice(0, 120)}
                      >
                        <b>{s.sense_index}</b> {s.pos}
                        {s.domain && <i>{s.domain}</i>}
                      </button>
                    ))}
                  </div>

                  {sense && (
                    <div className="lex-sense">
                      <p className="lex-definition">{sense.definition}</p>
                      {sense.examples.length > 0 && (
                        <div className="lex-examples">
                          {sense.examples.map((ex, i) => (
                            <p key={i} className="lex-example">“{ex}”</p>
                          ))}
                        </div>
                      )}
                      {senseRelGroups(sense).map(
                        ([rel, items]) =>
                          items.length > 0 && (
                            <div key={rel} className="lex-relgroup">
                              <h4 style={{ color: REL_COLORS[rel] }}>{REL_LABELS[rel]}</h4>
                              <div className="lex-relchips">
                                {items.map((t, i) => {
                                  const low = t.toLowerCase();
                                  const internal = indexByW.has(low);
                                  return internal ? (
                                    <button
                                      key={`${t}-${i}`}
                                      className="lex-relchip"
                                      style={{ borderColor: REL_COLORS[rel] }}
                                      onClick={() => handleSelect(low)}
                                    >
                                      {t}
                                    </button>
                                  ) : (
                                    <span
                                      key={`${t}-${i}`}
                                      className="lex-relchip static"
                                      style={{ borderColor: `${REL_COLORS[rel]}55` }}
                                    >
                                      {t}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ),
                      )}
                    </div>
                  )}
                </>
              )}

              {term.senses.length === 0 && (
                <p className="faint lex-no-senses">
                  No OpenGloss senses for this acronym — curated LEX card only. Run{' '}
                  <code className="mono">etl_term.py {term.w}</code> if the dataset grows.
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <footer className="lex-footer">
        <p className="faint">
          Lexi is part of <strong>VidiFlow</strong> — visualize your Smart Stack, then run the
          company with a live view of your agentic + human workforce.
        </p>
        <p className="faint">
          Definitions from{' '}
          <a
            href="https://huggingface.co/datasets/mjbommar/opengloss-v1.1-definitions"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenGloss v1.1
          </a>{' '}
          (CC-BY-4.0) · index built {index?.generated_at ?? '—'} · static-first: zero browser
          dependency on Postgres/Directus
        </p>
      </footer>
    </main>
  );
}
