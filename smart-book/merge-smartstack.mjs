import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Use absolute path to avoid directory issues
const smartBookDir = 'M:\\code\\vidismart\\smart-book';

// Read existing data.js
let dataJs = readFileSync(path.join(smartBookDir, 'data.js'), 'utf8');

// Smart Stack chapters content (ch38 + ch39)
const newChapters = `    ch38: {
      id: "ch38",
      title: "Ch38: Smart Stack — The 5-Layer Architecture Framework",
      part: 6,
      order: 38,
      content: \`<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The Smart Stack is not a single tool. It is the architecture that connects every AI capability into a coherent operating system for your business. The 5-layer model provides the framework: Strategy, Data, Models, Agents, and Interface — each layer building on the one below it.</p>
      </div>
      <p><strong>Layer 1: Strategic Layer (Why).</strong> This is where vision meets execution. The strategy defines what outcomes matter most — revenue growth, cost reduction, customer experience, innovation velocity. Every AI investment maps to a strategic outcome. Without this mapping, AI spending becomes a cost center instead of a value driver.</p>
      <p><strong>Layer 2: Data Layer (What).</strong> The fuel for every AI system. This layer covers data ingestion, cleaning, labeling, and governance. The businesses that win in 2026 are not the ones with the most data — they are the ones who have structured their proprietary data so it can be queried by AI agents in real time.</p>
      <p><strong>Layer 3: Model Layer (How).</strong> The ML models, foundation models, and fine-tuned systems that transform raw data into predictions. This includes LLMs, vision models, speech recognition — the actual intelligence engines. The key insight: you do not need every model to be state-of-the-art. You need every model to be production-grade for its specific task.</p>
      <p><strong>Layer 4: Agent Layer (Who).</strong> The orchestration layer where autonomous agents perform tasks. This is where AutoGen, CrewAI, and custom agent frameworks come together. Agents consume data, run models, make decisions, and execute workflows without human intervention for routine operations.</p>
      <p><strong>Layer 5: Interface Layer (How it's used).</strong> The user experience layer — dashboards, chat interfaces, voice agents, API endpoints. This is where humans interact with the system. A poor interface can sink even the best AI architecture. The goal is seamless integration into existing workflows.</p>
      <blockquote>"The 5-layer framework turns abstract AI strategy into a concrete architectural blueprint. Each layer must be designed together — not in isolation."</blockquote>\`,
      images: ["smart_stack_architecture.png", "ai_plan_people_1775340669016.png"],
      readingTime: 12
    },
    ch39: {
      id: "ch39",
      title: "Ch39: Smart Stack Issue Matrix — IT & Executive Alignment",
      part: 6,
      order: 39,
      content: \`<div class="strategic-context">
        <h3>Strategic Context</h3>
        <p>The Smart Stack Issue Matrix bridges the gap between IT technical debt and executive strategic priorities. It answers the question that keeps both parties up at night: "Are we building the right things, for the right reasons, with the resources we have?"</p>
      </div>
      <p><strong>For IT Professionals:</strong></p>
      <ul>
        <li>Which systems are most critical to AI performance?</li>
        <li>Where is technical debt blocking innovation?</li>
        <li>How do we measure the ROI of our AI infrastructure?</li>
        <li>What skills gaps exist in our current team?</li>
      </ul>
      <p><strong>For Executives:</strong></p>
      <ul>
        <li>Which use cases will move the needle most for our business?</li>
        <li>How do we prioritize AI investments across departments?</li>
        <li>What's our competitive advantage in 18 months?</li>
        <li>How do we measure success beyond cost savings?</li>
      </ul>
      <p>The matrix maps initiatives on two axes: Impact (low to transformative) vs. Feasibility (easy to complex). The result is a prioritization framework that both IT and executive leadership can agree on — because it's based on business outcomes, not technology for its own sake.</p>
      <blockquote>"The issue matrix doesn't just prioritize projects. It aligns technical execution with business strategy in a way that creates sustainable competitive advantage."</blockquote>\`,
      images: ["smart_stack_issue_matrix.png", "ai_plan_people_1775340669016.png"],
      readingTime: 10
    }`;

// Insert chapters after ch37 (before the closing brace of chapters object)
dataJs = dataJs.replace(
  /(\s+ch37: \{[\s\S]*?readingTime: 18\s+\}\s*\},\s*)/,
  `$1${newChapters}\n  },`
);

// Add Smart Stack knowledge nodes after robotics node
const newNodes = `    { id: "smart_stack", label: "Smart Stack", type: "strategy", color: "#8B5CF6" },
    { id: "five_layer_model", label: "5-Layer Model", type: "concept", color: "#FF6B35" },
    { id: "issue_matrix", label: "Issue Matrix", type: "strategy", color: "#F59E0B" },
    { id: "vendor_lockin", label: "Vendor Lock-in Risk", type: "concept", color: "#EF4444" },
    { id: "integration_patterns", label: "Integration Patterns", type: "technology", color: "#10B981" }`;

dataJs = dataJs.replace(
  /(\{ id: "robotics", label: "Robotics", type: "technology", color: "#3B82F6" \}\s*\])/,
  `${newNodes},\n  ]`
);

// Add edges for ch38/ch39 after the last existing edge
const newEdges = `    { source: "ch32", target: "ch38", type: "sequence", label: "stack framework" },
    { source: "ch28", target: "ch38", type: "conceptual", label: "architecture" },
    { source: "ch30", target: "ch38", type: "conceptual", label: "local deployment" },
    { source: "ch38", target: "ch39", type: "sequence" },
    { source: "ch17", target: "ch39", type: "conceptual", label: "compliance" },
    { source: "ch24", target: "ch39", type: "conceptual", label: "ROI" }`;

dataJs = dataJs.replace(
  /(\{ source: "ch8", target: "ch5", type: "conceptual", label: "30-40 agents" \}\s*\])/,
  `${newEdges},\n  ]`
);

// Update persona filters - IT Professional (add ch38 to critical, ch39 to high)
dataJs = dataJs.replace(
  /critical: \["foreword", "ch1", "ch3", "ch6", "ch8", "ch10", "ch12", "ch13", "ch13b", "ch17", "ch20", "ch22", "ch23", "ch23b", "ch25", "ch27", "ch30", "ch34"\],/,
  'critical: ["foreword", "ch1", "ch3", "ch6", "ch8", "ch10", "ch12", "ch13", "ch13b", "ch17", "ch20", "ch22", "ch23", "ch23b", "ch25", "ch27", "ch30", "ch34", "ch38"],'
);

dataJs = dataJs.replace(
  /high: \["ch2", "ch5", "ch11", "ch14", "ch15", "ch18", "ch19", "ch21", "ch26", "ch28", "ch35"\],/,
  'high: ["ch2", "ch5", "ch11", "ch14", "ch15", "ch18", "ch19", "ch21", "ch26", "ch28", "ch35", "ch39"],'
);

// Update persona filters - Executive (add ch38, ch39 to critical)
dataJs = dataJs.replace(
  /critical: \["foreword", "ch1", "ch2", "ch4", "ch5", "ch6", "ch7", "ch8", "ch9", "ch10", "ch12", "ch13", "ch15", "ch16", "ch17", "ch18", "ch19", "ch28", "ch31", "ch32", "ch32b", "ch35", "ch36"\],/,
  'critical: ["foreword", "ch1", "ch2", "ch4", "ch5", "ch6", "ch7", "ch8", "ch9", "ch10", "ch12", "ch13", "ch15", "ch16", "ch17", "ch18", "ch19", "ch28", "ch31", "ch32", "ch32b", "ch35", "ch36", "ch38", "ch39"],'
);

// Update persona filters - Consumer (add ch38, ch39 to hide)
dataJs = dataJs.replace(
  /hide: \["ch5", "ch8", "ch10", "ch11", "ch16", "ch20", "ch23", "ch24", "ch25", "ch26", "ch27", "ch28", "ch29", "ch31", "ch34", "ch35", "ch37"\],/,
  'hide: ["ch5", "ch8", "ch10", "ch11", "ch16", "ch20", "ch23", "ch24", "ch25", "ch26", "ch27", "ch28", "ch29", "ch31", "ch34", "ch35", "ch37", "ch38", "ch39"],'
);

// Write updated data.js
writeFileSync(path.join(smartBookDir, 'data.js'), dataJs, 'utf8');

console.log('✅ Smart Stack chapters merged successfully!');
console.log('- Added ch38: 5-Layer Architecture Framework');
console.log('- Added ch39: Issue Matrix — IT & Executive Alignment');
console.log('- Added 5 new knowledge nodes');
console.log('- Added 6 new edges');
console.log('- Updated persona filters (IT Pro, Executive, Consumer)');
