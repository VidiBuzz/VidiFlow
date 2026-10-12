#!/usr/bin/env node
// Quick connectivity + permission check for the KB connector.
// Verifies: login, profile, workspaces, folder read on the first workspace.

import { AppFlowyClient, configFromEnv } from './client.mjs';

const cfg = configFromEnv();
const client = new AppFlowyClient(cfg);
await client.login();
console.log(`OK  login  (${cfg.email})`);

const profile = await client.whoAmI();
console.log(`OK  profile uid=${profile.uid} latest_workspace=${profile.latest_workspace_id}`);

const workspaces = await client.listWorkspaces();
console.log(`OK  workspaces: ${workspaces.map((w) => w.workspace_name).join(', ') || '(none — account needs to be invited to a workspace)'}`);

if (workspaces.length) {
  const folder = await client.getFolderTree(workspaces[0].workspace_id);
  const count = (node) => 1 + (node.children || []).reduce((n, c) => n + count(c), 0);
  console.log(`OK  folder tree of "${workspaces[0].workspace_name}": ${count(folder)} node(s)`);
  console.log('\nAll checks passed — run: node sync.mjs');
} else {
  console.log('\nPartial: auth + API work, but this account is not a member of any workspace yet.');
  console.log('Fix: in AppFlowy (as an owner) use Share -> invite kbservice@vidiflow.local to each workspace.');
}
