// Render an AppFlowy document block tree + external text deltas to markdown.
//
// Blocks reference their rich text via external_id (a separate collab object
// of collab_type "text"). deltas: { [external_id]: Delta[] }

export function blocksToMarkdown(tree, deltas, { textTypes } = {}) {
  const lines = [];
  const walk = (node, depth) => {
    const md = blockToMarkdown(node, deltas, depth, textTypes);
    if (md !== null && md !== '') lines.push(md);
    for (const child of node.children) walk(child, depth + (md !== null && isNestable(node.ty) ? 1 : 0));
  };
  for (const root of tree.roots) walk(root, 0);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function isNestable(ty) {
  return ['bulleted_list', 'numbered_list', 'todo_list', 'toggle_list', 'quote', 'callout'].includes(ty);
}

function deltaToPlainText(delta) {
  if (!Array.isArray(delta)) return '';
  return delta
    .map((op) => (typeof op === 'string' ? op : op.insert ?? ''))
    .join('');
}

function deltaToMarkdown(delta) {
  if (!Array.isArray(delta)) return '';
  let out = '';
  let bold = false;
  let italic = false;
  let code = false;
  let strikethrough = false;
  let underline = false;
  const open = () => {
    let s = '';
    if (code) s += '`';
    if (bold) s += '**';
    if (italic) s += '*';
    if (strikethrough) s += '~~';
    return s;
  };
  const close = () => {
    let s = '';
    if (strikethrough) s += '~~';
    if (italic) s += '*';
    if (bold) s += '**';
    if (code) s += '`';
    return s;
  };
  const flush = (text) => {
    if (!text) return;
    const fmt = open() + text + close();
    out += underline ? `<u>${fmt}</u>` : fmt;
  };
  for (const op of delta) {
    const insert = typeof op === 'string' ? op : op.insert ?? '';
    const attrs = (op && op.attributes) || {};
    const next = {
      bold: !!attrs.bold,
      italic: !!attrs.italic,
      code: !!attrs.code,
      strikethrough: !!attrs.strikethrough,
      underline: !!attrs.underline,
    };
    if (
      next.bold !== bold || next.italic !== italic || next.code !== code ||
      next.strikethrough !== strikethrough || next.underline !== underline
    ) {
      flush('');
      bold = next.bold; italic = next.italic; code = next.code;
      strikethrough = next.strikethrough; underline = next.underline;
    }
    flush(insert);
  }
  flush('');
  return out.replace(/(<u>)([^]*?)<\/u>/g, (_, a, b) => `<u>${b.replace(/\*\*/g, '')}</u>`);
}

function blockToMarkdown(node, deltas, depth, textTypes = {}) {
  const key = node.external_id || node.id;
  const delta = deltas[key];
  const text = () => deltaToMarkdown(delta);
  const indent = '  '.repeat(depth);
  switch (node.ty) {
    case 'page':
      return null; // heading emitted by sync from view name
    case 'paragraph':
      return text();
    case 'heading':
    case 'heading1':
    case 'heading2':
    case 'heading3': {
      const level = Math.min(6, 1 + Number(node.data?.level ?? (node.ty.endsWith('1') ? 0 : node.ty.endsWith('2') ? 1 : 2)));
      return `${'#'.repeat(level)} ${text()}`;
    }
    case 'bulleted_list':
      return `${indent}- ${text()}`;
    case 'numbered_list':
      return `${indent}1. ${text()}`;
    case 'todo_list':
      return `${indent}- [${node.data?.checked ? 'x' : ' '}] ${text()}`;
    case 'toggle_list':
      return `${indent}- ${text()}`;
    case 'quote':
      return `${indent}> ${text()}`;
    case 'callout':
      return `${indent}> [!NOTE]\n${indent}> ${text()}`;
    case 'divider':
      return `${indent}---`;
    case 'code':
      return `${indent}\`\`\`${node.data?.language || ''}\n${deltaToPlainText(delta)}\n${indent}\`\`\``;
    case 'math_equation':
      return `$$\n${node.data?.formula || ''}\n$$`;
    case 'image': {
      const url = Array.isArray(node.data?.url) ? node.data.url[0] : node.data?.url;
      return url ? `![image](${url})` : null;
    }
    case 'grid':
    case 'board':
    case 'calendar':
      return null; // databases handled separately by kb-index
    default:
      return textTypes[node.ty] ? text() : (delta ? text() : null);
  }
}
