/** LEX × OpenGloss — shared types + helpers for the /lex app. */

export type RelType =
  | 'synonym'
  | 'antonym'
  | 'hypernym'
  | 'hyponym'
  | 'collocation'
  | 'derivation'
  | 'inflection';

export const REL_TYPES: RelType[] = [
  'synonym',
  'antonym',
  'hypernym',
  'hyponym',
  'collocation',
  'derivation',
  'inflection',
];

export const REL_COLORS: Record<RelType, string> = {
  synonym: '#22d3ee',
  antonym: '#f87171',
  hypernym: '#fbbf24',
  hyponym: '#4ade80',
  collocation: '#a78bfa',
  derivation: '#34d399',
  inflection: '#94a3b8',
};

export const REL_LABELS: Record<RelType, string> = {
  synonym: 'synonyms',
  antonym: 'antonyms',
  hypernym: 'hypernyms · is a',
  hyponym: 'hyponyms · includes',
  collocation: 'collocations',
  derivation: 'derivations',
  inflection: 'inflections',
};

export interface LexIndexEntry {
  w: string;
  acr: string | null;
  c: boolean;
  n: number;
  rank: number | null;
  freq: number | null;
  d: string | null;
  s: string;
  full?: string;
  ol?: string;
}

export interface LexIndex {
  generated_at: string;
  source: string;
  total: number;
  terms: LexIndexEntry[];
}

export interface SenseEdge {
  t: string;
  r: RelType;
}

export interface LexSense {
  source_id: string;
  pos: string;
  sense_index: number;
  definition: string;
  examples: string[];
  synonyms: string[];
  antonyms: string[];
  hypernyms: string[];
  hyponyms: string[];
  collocations: string[];
  derivations: Record<string, string[]>;
  inflections: Record<string, string[]>;
  domain: string | null;
  tags: string[];
  reading_level: string | null;
  wiki_frequency: number | null;
  wiki_frequency_rank: number | null;
  edges: SenseEdge[];
}

export interface CuratedFlowStep {
  step?: string;
  title: string;
  desc: string;
  icon?: string;
  active?: boolean;
}

export interface CuratedAnatomyItem {
  letter: string;
  word: string;
  role?: string;
  desc?: string;
  icon?: string;
}

export interface CuratedStackItem {
  icon?: string;
  label: string;
  note?: string;
}

export interface CuratedSmartStack {
  label?: string;
  icon?: string;
  color?: string;
  headline?: string;
  description?: string;
  legacyStack?: CuratedStackItem[];
  newStack?: CuratedStackItem[];
}

export interface CuratedBrand {
  name: string;
  share?: string;
  tag?: string;
}

export interface CuratedTerm {
  acr: string;
  full: string;
  dept?: string;
  category?: string;
  logoSvg?: string;
  conceptDesc?: string;
  conceptImg?: string;
  conceptVideo?: string;
  keywords?: string[];
  oneLiner?: string;
  notes?: string;
  origin?: string;
  smartStack?: CuratedSmartStack | null;
  anatomy?: CuratedAnatomyItem[];
  flow?: CuratedFlowStep[];
  brands?: CuratedBrand[];
  replaces?: string[];
  connectsWith?: string[];
}

export interface LexTerm {
  word: string;
  w: string;
  acr: string | null;
  curated: CuratedTerm | null;
  generated_at: string;
  source: string;
  senses: LexSense[];
}

export interface AtlasNode {
  id: string;
  label: string;
  c: boolean;
  d: string | null;
  rank: number | null;
  n: number;
}

export interface AtlasEdge {
  s: string;
  t: string;
  r: RelType;
}

export interface LexAtlas {
  generated_at: string;
  source: string;
  node_count: number;
  edge_count: number;
  nodes: AtlasNode[];
  edges: AtlasEdge[];
}

export const CDN_BASE = 'https://cdn.vidi.news/';

/** Default sense: highest wiki_frequency, tie -> lowest sense_index (ETL parity). */
export function defaultSenseIdx(senses: LexSense[]): number {
  if (!senses.length) return -1;
  let best = 0;
  for (let i = 1; i < senses.length; i++) {
    const a = senses[i];
    const b = senses[best];
    const fa = a.wiki_frequency ?? 0;
    const fb = b.wiki_frequency ?? 0;
    if (fa > fb || (fa === fb && a.sense_index < b.sense_index)) best = i;
  }
  return best;
}

export function flattenStruct(struct: Record<string, string[]> | null | undefined): string[] {
  if (!struct) return [];
  const out: string[] = [];
  for (const key of Object.keys(struct)) out.push(...(struct[key] ?? []));
  return out;
}

export function formatFreq(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}
