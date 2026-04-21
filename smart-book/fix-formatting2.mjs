import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

const smartBookDir = 'M:\\code\\vidismart\\smart-book';
let dataJs = readFileSync(path.join(smartBookDir, 'data.js'), 'utf8');

// Fix 1: Remove duplicate closing brace (line 841 issue)
dataJs = dataJs.replace(
  /(\s+ch39: \{[\s\S]*?readingTime: 10\s+\}\s*\})\n\s+\}\n\s+\},/,
  `$1\n  },`
);

// Fix 2: Correct ch38 indentation (line 795 issue)
dataJs = dataJs.replace(
  /(\s+ch37: \{[\s\S]*?readingTime: 18\s+\}\s*\},)\n\s+ch38:/,
  `$1\n    ch38:`
);

// Fix 3: Correct smart_stack node indentation (line 870 issue)
dataJs = dataJs.replace(
  /(\s+)\{ id: "smart_stack", label: "Smart Stack"/,
  '$1    { id: "smart_stack", label: "Smart Stack"'
);

writeFileSync(path.join(smartBookDir, 'data.js'), dataJs, 'utf8');
console.log('✅ Formatting fixed (v2)!');
