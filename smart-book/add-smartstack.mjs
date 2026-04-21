import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = '.';

// Read the existing data.js
let dataContent = readFileSync('smart-book/data.js', 'utf8');

// New chapters to add - Smart Stack Architecture Framework (5-layer model)
const newChapter37 = `    ch38: {
      id: "ch38",
      title: "Ch38: Smart Stack — The 5-Layer Architecture Framework",
      part: 6,
      order: 38,
      content: \`<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The Smart Stack is not a single tool. It is the architecture that connects every AI capability into a coherent operating system for your business. The 5-layer model provides the framework: Strategy, Data, Models, Agents, and Interface — each layer building on the one below it.</
</p>
      </div>
      <p><strong>Layer 1: Strategic Layer (Why).</strong> This is where vision meets execution. The strategy defines what outcomes matter most — revenue growth, cost reduction, customer experience, innovation velocity. Every AI investment maps to a strategic outcome. Without this mapping, AI spending becomes a cost center instead of a value driver.</p>
      <p><strong>Layer 2: Data Layer (What).</strong> The fuel for every AI system. This layer covers data ingestion, cleaning, labeling, and governance. The businesses that win in 2026 are not the ones with the most data — they are the ones who have structured their proprietary data so it can be queried by AI agents in real time.</p>
      <p><strong>Layer 3: Model Layer (How).</strong> The ML models, foundation models, and fine-tuned systems that transform raw data into predictions. This includes LLMs, vision models, speech recognition — the actual intelligence engines. The key insight: you do not need every model to be state-of-the-art. You need every model to be production-grade for its specific task.</p>
      <p><strong