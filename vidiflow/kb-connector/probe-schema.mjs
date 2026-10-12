// Decode a real AppFlowy document through the REST API to learn the exact
// Yjs schema, using the proven kb-connector client.
import { AppFlowyClient } from './client.mjs';

const BASE = 'http://127.0.0.1:4000';
const WS = process.argv[2] || 'd2ba6e62-8ebe-4289-b0dc-07ea5856651a';

const c = new AppFlowyClient({
baseUrl: BASE,
email: process.env.KB_EMAIL,
password: process.env.KB_PASSWORD,
outputDir: './data',
});
if (!process.env.KB_EMAIL || !process.env.KB_PASSWORD) {
  console.error('set KB_EMAIL and KB_PASSWORD (see kb-connector/.env.local)');
  process.exit(1);
}
await c.login();
console.log('logged in');

const tree = await c.getFolderTree(WS);
console.log('\n--- raw folder tree shape ---');
console.log(JSON.stringify(tree, null, 1).slice(0, 2500));


const all = [];
(function walk(n) {
  if (!n) return;
  all.push(n);
  for (const ch of n.children || []) walk(ch);
})(tree);
console.log(`\ntotal views: ${all.length}`);

const byLayout = {};
for (const v of all) byLayout[v.layout] = (byLayout[v.layout] || 0) + 1;
console.log('layout histogram:', JSON.stringify(byLayout), '(0=document? per AppFlowy: 0=Document,1=Board,2=Calendar,3=Grid)');
console.log('\n--- sample views ---');
for (const v of all.slice(0, 15)) console.log(`  L${v.layout} ${v.view_id.slice(0,8)} ${JSON.stringify(v.name)}`);

const docs = all.filter((v) => v.layout === 0 && v.view_id !== WS);
console.log(`\ndocument views: ${docs.length}`);
if (!docs.length) { console.log('no docs to sample'); process.exit(0); }

const res = await c.batchGetCollab(WS, [{ object_id: docs[0].view_id, collab_type: 0 }]);
const enc = res[docs[0].view_id]?.Success?.encode_collab_v1;
const bytes = Uint8Array.from(Buffer.from(enc, 'base64'));
console.log(`\nbytes=${bytes.length} first16=${Buffer.from(bytes.slice(0, 16)).toString('hex')}`);

const view = c.decodeCollab(bytes);
console.log(`kind: ${view.kind}`);
const doc = view.document || {};
console.log('document keys:', JSON.stringify(Object.keys(doc)));
const blocks = doc.blocks || {};
const ids = Object.keys(blocks);
console.log(`blocks: ${ids.length}`);
for (const id of ids.slice(0, 10)) {
  const b = blocks[id];
  console.log(`  id=${id.slice(0, 12)} ty=${b.ty} parent=${String(b.parent).slice(0,12)} ext_type=${b.external_type} ext_id=${String(b.external_id).slice(0,12)}`);
  console.log(`     data=${String(b.data).slice(0, 240)}`);
}
process.exit(0);
