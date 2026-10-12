export type Modality = 'Text' | 'Image' | 'Video' | 'Audio' | 'PDF';

export type BenchmarkCell = {
  value: string;
  note?: string;
  independent?: boolean;
  familyProxy?: boolean;
};

export type ComparisonModel = {
  id: string;
  name: string;
  shortName: string;
  provider: string;
  modelId: string;
  context: string;
  output: string;
  price: string;
  priceNote: string;
  speed: string;
  speedNote: string;
  openness: string;
  modalities: Modality[];
  classification: string;
  classificationNote: string;
  accent: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose';
  verdict: string;
  summary: string;
  strength: string;
  caution: string;
  scores: Record<string, BenchmarkCell | null>;
};

export const BENCHMARKS = [
  { id: 'aa', name: 'AA Intelligence', version: 'v4.3.2', description: 'Independent broad reasoning and agentic composite. Higher is better.' },
  { id: 'terminal', name: 'Terminal-Bench', version: '2.1', description: 'Agentic terminal tasks. Vendor harnesses and sample counts can differ.' },
  { id: 'deepswe', name: 'DeepSWE', version: 'v1.1', description: 'Long-horizon software engineering. Harness choice is material.' },
  { id: 'automation', name: 'AutomationBench', version: 'mixed', description: 'Business workflow automation. Implementations and scaffolds are not identical.' },
  { id: 'osworld', name: 'OSWorld', version: '2.0 / Verified', description: 'Computer-use agents. Verified and 2.0 results are not interchangeable.' },
  { id: 'gdpval', name: 'GDPval-AA', version: 'v2 / v2.1', description: 'Economally valuable knowledge work. Reported as Elo, not percent.' },
  { id: 'gpqa', name: 'GPQA Diamond', version: 'expert science', description: 'Graduate-level science reasoning. Reporters may use different settings.' },
] as const;

export const BENCHMARK_LEADERS: Record<string, string> = {
  aa: 'muse', terminal: 'deepseek', deepswe: 'deepseek', automation: 'gemini',
  osworld: 'muse', gdpval: 'muse', gpqa: 'muse',
};

export const MODELS: ComparisonModel[] = [
  {
    id: 'gemini', name: 'Gemini 3.8 Flash', shortName: 'Gemini', provider: 'Google',
    modelId: 'gemini-3.8-flash', context: '1,048,576 in · 65,536 out', output: 'Text',
    price: '$0.75 / $3.75', priceNote: 'promotional input / output per 1M; $1.50 / $7.50 regular',
    speed: '288 tok/s', speedNote: 'Independent high-reasoning measurement', openness: 'Proprietary',
    modalities: ['Text', 'Image', 'Video', 'Audio', 'PDF'], classification: 'Omni-input',
    classificationNote: 'Understands every major input modality, but generates text only.',
    accent: 'cyan', verdict: 'Best fast all-rounder',
    summary: 'The fastest established model in this set, with the broadest documented input coverage and near-leading software-agent results.',
    strength: 'Speed, multimodal coverage, and a mature first-party API.',
    caution: 'Quality trails Muse and DeepSeek on the strongest coding measures.',
    scores: {
      aa: { value: '41', note: 'high reasoning', independent: true },
      terminal: { value: '89.4%' }, deepswe: { value: '73.7%' },
      automation: { value: '60%', note: 'AA v4.3.2', independent: true },
      osworld: { value: '59.0%', note: 'OSWorld 2.0' }, gdpval: { value: '1545', note: 'v2 Elo' }, gpqa: null,
    },
  },
  {
    id: 'space', name: 'Space-Bunny Alpha', shortName: 'Space-Bunny', provider: 'Anonymous third party',
    modelId: 'stealth/space-bunny-alpha', context: '1M · 524,288 completion ceiling', output: 'Text',
    price: '$0 / $0', priceNote: 'free preview per 1M input / output tokens',
    speed: '82 tok/s', speedNote: 'OpenRouter P50 snapshot', openness: 'Stealth terms',
    modalities: ['Text', 'Image', 'Video'], classification: 'Multimodal',
    classificationNote: 'Video-capable multimodal input, but no documented audio input.',
    accent: 'rose', verdict: 'Promising but unverified',
    summary: 'A free 1M-context preview with images and video, but no reproducible standard benchmark table and no disclosed developer.',
    strength: 'Low price, long context, and fast provider telemetry.',
    caution: 'Opaque identity, retained-prompt risk, and no auditable quality ranking.',
    scores: { aa: null, terminal: null, deepswe: null, automation: null, osworld: null, gdpval: null, gpqa: null },
  },
  {
    id: 'mimo', name: 'MiMo-V2.6-Flash', shortName: 'MiMo', provider: 'Xiaomi',
    modelId: 'xiaomi/mimo-v2.6-flash', context: '1M', output: 'Text',
    price: '$0.14 / $0.28', priceNote: 'OpenRouter observed price per 1M input / output',
    speed: '42 tok/s', speedNote: 'OpenRouter P50 across routes', openness: 'MIT · 309B / 15B active',
    modalities: ['Text', 'Image', 'Video', 'Audio'], classification: 'Omni-input',
    classificationNote: 'Native text, image, video, and audio understanding; text output only.',
    accent: 'amber', verdict: 'Best open omnimodal',
    summary: 'The strongest open-weight option here for native image, video, and audio input, with one-million-token context.',
    strength: 'Open weights, native audio/video perception, and competitive terminal scores.',
    caution: 'Slower routing and weaker DeepSWE/Terminal results than the leaders.',
    scores: {
      aa: null, terminal: { value: '87.6%' }, deepswe: { value: '67.9%' },
      automation: { value: '52.3%', note: 'v1.0.6' },
      osworld: { value: '80.8%', note: 'OSWorld-Verified' }, gdpval: null,
      gpqa: { value: '75.0%', note: 'DeepInfra via OR', independent: true },
    },
  },
  {
    id: 'deepseek', name: 'DeepSeek V4.1 Flash', shortName: 'DeepSeek', provider: 'DeepSeek',
    modelId: 'deepseek-ai/DeepSeek-V4.1-Flash', context: '1M', output: 'Text',
    price: '$0.30 / $1.20', priceNote: 'first-party input / output per 1M',
    speed: '232 tok/s', speedNote: 'Independent max-reasoning measurement', openness: 'MIT · 552B / 16B active',
    modalities: ['Text', 'Image'], classification: 'Vision-language',
    classificationNote: 'Native image understanding, but no documented audio or video input.',
    accent: 'emerald', verdict: 'Best coding agent',
    summary: 'The benchmark leader for terminal and long-horizon software engineering, with open MIT weights and low active compute.',
    strength: 'Terminal-Bench and DeepSWE leadership plus reproducible open artifacts.',
    caution: 'Vision-only input; no audio or video understanding.',
    scores: {
      aa: { value: '39', note: 'max effort', independent: true },
      terminal: { value: '90.6%', note: 'DSH Minimal' }, deepswe: { value: '74.2%', note: 'mini-SWE' },
      automation: { value: '54.8%' }, osworld: null, gdpval: null, gpqa: { value: '90.9%' },
    },
  },
  {
    id: 'muse', name: 'Muse Spark 1.3 Contributor', shortName: 'Muse', provider: 'Meta',
    modelId: 'muse-spark-1.3-contributor', context: '1,048,576', output: 'Text',
    price: '$0.10 / $0.20', priceNote: 'contributor input / output; $0.002 cached input',
    speed: 'NR', speedNote: 'standard max measures ~222 tok/s; Contributor not measured', openness: 'Proprietary',
    modalities: ['Text', 'Image', 'Video', 'Audio', 'PDF'], classification: 'Omni-input',
    classificationNote: 'Understands text, images, video, audio, and PDF; returns text only.',
    accent: 'violet', verdict: 'Best measured quality',
    summary: 'The highest broad quality and computer-use evidence in the set, offered cheaply through a data-sharing Contributor tier.',
    strength: 'Broad intelligence, GDPval, GPQA, and OSWorld family results.',
    caution: 'Public scores are for xhigh/max, not the Contributor SKU; submitted data may improve Meta products.',
    scores: {
      aa: { value: '45 / 48', note: 'xhigh / max', independent: true, familyProxy: true },
      terminal: { value: '85% / 86%', note: 'xhigh / max', familyProxy: true },
      deepswe: { value: '59.1%', note: 'max family proxy', familyProxy: true },
      automation: { value: '58%', note: 'max; AA v4.3.2', independent: true, familyProxy: true },
      osworld: { value: '90.3%', note: 'max family proxy', familyProxy: true },
      gdpval: { value: '1754', note: 'max, v2 Elo', familyProxy: true },
      gpqa: { value: '94%', note: 'max / xhigh', familyProxy: true },
    },
  },
];

export const SOURCES = [
  { label: 'Google · Gemini 3.8 Flash model card', url: 'https://deepmind.google/models/model-cards/gemini-3-8-flash/' },
  { label: 'Google · Gemini API model specification', url: 'https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash' },
  { label: 'OpenRouter · Space-Bunny Alpha', url: 'https://openrouter.ai/stealth/space-bunny-alpha' },
  { label: 'Xiaomi · MiMo-V2.6-Flash-RL model card', url: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL' },
  { label: 'OpenRouter · MiMo-V2.6-Flash telemetry', url: 'https://openrouter.ai/xiaomi/mimo-v2.6-flash' },
  { label: 'DeepSeek · V4.1 Flash model card', url: 'https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash' },
  { label: 'Meta · Muse Spark 1.3 benchmarks', url: 'https://developer.meta.com/ai/models/muse-spark/' },
  { label: 'Meta · model modalities and Contributor tier', url: 'https://ai.developer.meta.com/docs/models' },
  { label: 'Artificial Analysis · current model evaluations', url: 'https://artificialanalysis.ai/models' },
] as const;
