import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const smartBookDir = 'M:\\code\\vidismart\\smart-book';
let dataJs = readFileSync(path.join(smartBookDir, 'data.js'), 'utf8');

// Fix 1: Correct the chapters closing brace placement (lines 793-794 issue)
// Replace the malformed section with correct formatting
dataJs = dataJs.replace(
  /(\s+ch37: \{[\s\S]*?readingTime: 18\s+\}\s*\},\s*)\s*ch38:/,
  `$1    ch38:`
);

// Fix 2: Correct the knowledgeNodes opening (line 841 issue: },knowledgeNodes:)
dataJs = dataJs.replace(
  /(\s+ch39: \{[\s\S]*?readingTime: 10\s+\}\s*\}),knowledgeNodes:/,
  `$1\n  },\n  knowledgeNodes:`
);

// Fix 3: Ensure proper spacing for new nodes (line 868 issue)
dataJs = dataJs.replace(
  /(\s+)\{ id: "smart_stack", label: "Smart Stack"/,
  '$1    { id: "smart_stack", label: "Smart Stack"'
);

writeFileSync(path.join(smartBookDir, 'data.js'), dataJs, 'utf8');
console.log('✅ Formatting fixed!');
