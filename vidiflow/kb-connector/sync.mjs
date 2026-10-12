#!/usr/bin/env node
// kb-sync — pull all AppFlowy (VidiFlow) notes into the local knowledgebase.
//
// Output:
//   <out>/kb-index.json     machine index for the smart media / graph system
//   <out>/kb/<workspace>/*.md   human-readable markdown mirror
//
// Usage: node sync.mjs [--base-url URL] [--out DIR]

import fs from 'node:fs';
import path from 'node:path';
import { AppFlowyClient, configFromEnv } from './client.mjs';
import { blocksToMarkdown } from './render.mjs';

// auto-load .env.local next to the script (never committed)
const envFile = path.join(path.dirname(new URL(import.meta.url).pathname), '.env.local');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

const argv = process.argv.slice(2);
const argOf = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const cfg = {
  ...configFromEnv(),
  baseUrl: argOf('--base-url', undefined) ? String(argOf('--base-url', '')).replace(/\/+$/, '') : undefined,
  outputDir: argOf('--out', undefined) || undefined,
};
cfg.baseUrl = cfg.baseUrl || (process.env.APPFLOWY_BASE_URL || 'https://cloud.0human.net').replace(/\/+$/, '');
cfg.outputDir = cfg.outputDir || process.env.KB_OUTPUT_DIR || './data';

const client = new AppFlowyClient({ ...cfg, password: process.env.KB_PASSWORD });
await client.login();

const profile = await client.whoAmI();
console.log(`Authenticated as ${profile.email} (uid ${profile.uid})`);

const workspaces = (await client.listWorkspaces()) || [];
console.log(`Found ${workspaces.length} workspace(s)`);

const outDir = cfg.outputDir;
const kbDir = path.join(outDir, 'kb');
fs.mkdirSync(kbDir, { recursive: true });

const index = {
  generated_at: new Date().toISOString(),
  base_url: cfg.baseUrl,
  account: profile.email,
  workspaces: [],
};

for (const ws of workspaces) {
  const wid = ws.workspace_id;
  const wname = ws.workspace_name || wid;
  console.log(`\n== Workspace: ${wname} (${wid})`);
  const safeWs = wname.replace(/[^\w.-]+/g, '_');
  const wsDir = path.join(kbDir, safeWs);
  fs.mkdirSync(wsDir, { recursive: true });

  const folder = await client.getFolderTree(wid);
  const docs = [];

  // depth-first walk of the folder tree; collect document pages
  const walk = async (node, breadcrumb, depth) => {
    const name = node.name || node.view_id;
    const crumb = [...breadcrumb, name];
    const isDoc = !node.is_space && Number(node.layout) === 0 && !node.is_published_only;
    if (isDoc && depth > 0) {
      docs.push({ view_id: node.view_id, name, breadcrumb: crumb, node });
    }
    for (const child of node.children || []) {
      await walk(child, crumb, depth + 1);
    }
  };
  await walk(folder, [], 0);
  console.log(`   ${docs.length} document page(s)`);

  const wsIndex = {
    workspace_id: wid,
    workspace_name: wname,
    documents: [],
  };

  for (const doc of docs) {
    let pv;
    try {
      pv = await client.getPageView(wid, doc.view_id);
    } catch (err) {
      console.error(`   ! skip ${doc.name}: ${err.message.slice(0, 120)}`);
      continue;
    }
    const view = pv?.view || {};
    const encoded = pv?.data?.encoded_collab;
    if (!encoded) {
      console.error(`   ! no content for ${doc.name}`);
      continue;
    }

    const decoded = client.decodeCollab(encoded);
    let markdown = '';
    const textRefs = [];
    if (decoded.kind === 'document') {
      const tree = client.blockTree(decoded.document.blocks || {});
      // collect external text collab ids to batch-fetch
      const need = new Set();
      for (const b of tree.byId.values()) {
        if (b.external_type === 'text' && b.external_id) need.add(b.external_id);
        else if (!b.external_id && b.ty !== 'page' && b.ty !== 'math_equation' && b.ty !== 'image' && b.ty !== 'divider') need.add(b.id);
      }
      const ids = [...need];
      const deltas = {};
      if (ids.length) {
        const res = await client.batchGetCollab(
          wid,
          ids.map((object_id) => ({ object_id, collab_type: 'text' }))
        );
        const items = res?.items || [];
        for (const item of items) {
          const ec = item?.data?.encoded_collab ?? item?.encoded_collab;
          if (!ec) continue;
          try {
            deltas[item.object_id || item.collab?.object_id] = client.decodeTextCollab(ec);
          } catch (e) {
            console.error(`   ! text decode failed for ${item.object_id}: ${e.message.slice(0, 100)}`);
          }
        }
        // direct-embedded blocks (no external id): deltas keyed by block id
        for (const b of tree.byId.values()) {
          if (!b.external_id && deltas[b.id]) {
            // already keyed by id; render uses external_id||id fallback
          }
        }
      }
      textRefs.push(...ids);
      markdown = blocksToMarkdown(tree, deltas);
    }

    const safeName = doc.name.replace(/[^\w.-]+/g, '_').slice(0, 80) || doc.view_id;
    const file = path.join(wsDir, `${safeName}--${doc.view_id.slice(0, 8)}.md`);
    const header = [
      `# ${doc.name}`,
      '',
      `- source: ${cfg.baseUrl}`,
      `- workspace: ${wname} (${wid})`,
      `- view_id: ${doc.view_id}`,
      `- path: ${doc.breadcrumb.join(' / ')}`,
      `- last_edited: ${view.last_edited_time || ''}`,
      '',
    ].join('\n');
    fs.writeFileSync(file, header + markdown, 'utf8');

    wsIndex.documents.push({
      view_id: doc.view_id,
      title: doc.name,
      path: doc.breadcrumb,
      markdown_file: path.relative(outDir, file),
      text_collab_ids: textRefs,
      last_edited: view.last_edited_time,
    });
    console.log(`   + ${doc.name} -> ${path.basename(file)}`);
  }

  index.workspaces.push(wsIndex);
}

fs.writeFileSync(
  path.join(outDir, 'kb-index.json'),
  JSON.stringify(index, null, 2),
  'utf8'
);
console.log(`\nIndex written to ${path.join(outDir, 'kb-index.json')}`);
