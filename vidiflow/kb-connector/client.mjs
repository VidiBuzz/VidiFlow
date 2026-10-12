// VidiSmart KB Connector — AppFlowy Cloud (VidiFlow) REST client
//
// Auth: GoTrue password grant (service account), auto token refresh.
// Reads: workspaces -> folder tree -> page views -> collab documents (yrs binary)
// Content: yjs decode, blocks tree + external text collabs -> markdown.
//
// Env:
//   APPFLOWY_BASE_URL  e.g. https://cloud.0human.net
//   KB_EMAIL           service account email (kbservice@vidiflow.local)
//   KB_PASSWORD        service account password
//   KB_OUTPUT_DIR      default ./data

import * as Y from 'yjs';

export function configFromEnv(env = process.env) {
  const cfg = {
    baseUrl: (env.APPFLOWY_BASE_URL || 'https://cloud.0human.net').replace(/\/+$/, ''),
    email: env.KB_EMAIL || 'kbservice@vidiflow.local',
    password: env.KB_PASSWORD || '',
    outputDir: env.KB_OUTPUT_DIR || './data',
  };
  if (!cfg.password) throw new Error('KB_PASSWORD is required');
  return cfg;
}

export class AppFlowyClient {
  constructor(cfg) {
    this.cfg = cfg;
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
  }

  async login() {
    const res = await fetch(
      `${this.cfg.baseUrl}/gotrue/token?grant_type=password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.cfg.email, password: this.cfg.password }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(`GoTrue login failed (${res.status}): ${JSON.stringify(data).slice(0, 300)}`);
    }
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
    return data;
  }

  async refresh() {
    const res = await fetch(
      `${this.cfg.baseUrl}/gotrue/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }
    );
    const data = await res.json();
    if (!res.ok || !data.access_token) throw new Error(`Token refresh failed: ${res.status}`);
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + ((data.expires_in || 3600) - 60) * 1000;
  }

  async token() {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      if (this.refreshToken) await this.refresh();
      else await this.login();
    }
    return this.accessToken;
  }

  async api(path, { method = 'GET', body } = {}) {
    const token = await this.token();
    const res = await fetch(`${this.cfg.baseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(`Non-JSON response from ${path} (${res.status}): ${text.slice(0, 200)}`);
    }
    if (!res.ok || (data && typeof data.code === 'number' && data.code !== 0)) {
      throw new Error(`API ${method} ${path} failed (${res.status}): ${text.slice(0, 300)}`);
    }
    return data && data.data !== undefined ? data.data : data;
  }

  // ---- API surface ----

  async whoAmI() {
    return this.api('/api/user/profile');
  }

  async listWorkspaces() {
    return this.api('/api/workspace');
  }

  async getFolderTree(workspaceId) {
    return this.api(`/api/workspace/${workspaceId}/folder`);
  }

  async getPageView(workspaceId, viewId) {
    return this.api(`/api/workspace/${workspaceId}/page-view/${viewId}`);
  }

  // Batch fetch collab objects (documents / external text docs).
  // NOTE: the server expects a bare JSON array of queries, not {queries:[...]}.
  async batchGetCollab(workspaceId, queries) {
    return this.api(`/api/workspace/${workspaceId}/collab_list`, {
      method: 'POST',
      body: queries.map(({ object_id, collab_type }) => ({ object_id, collab_type })),
    });
  }

  // ---- Collab decoding ----

  // encoded_collab (yrs update bytes) -> plain JS view
  decodeCollab(encodedCollab) {
    const bytes = encodedCollab instanceof Uint8Array
      ? encodedCollab
      : Uint8Array.from(encodedCollab);
    const ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, bytes);
    const data = ydoc.getMap('data');
    const document = data && data.get ? data.get('document') : null;
    if (document) return { kind: 'document', document: mapToJson(document) };
    const text = data && data.get ? data.get('text') : null;
    if (text) return { kind: 'text', text: mapToJson(text) };
    return { kind: 'unknown', share: Array.from(ydoc.share.keys()) };
  }

  decodeTextCollab(encodedCollab) {
    const bytes = encodedCollab instanceof Uint8Array
      ? encodedCollab
      : Uint8Array.from(encodedCollab);
    const ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, bytes);
    const data = ydoc.getMap('data');
    const text = data && data.get ? data.get('text') : null;
    if (!text) return [];
    const t = mapToJson(text);
    if (Array.isArray(t.delta)) return t.delta;
    if (t.delta && typeof t.delta.toJSON === 'function') return t.delta.toJSON();
    return [];
  }

  // blocks map (from decodeCollab) -> ordered tree
  blockTree(blocks) {
    const byId = new Map();
    const roots = [];
    for (const [id, b] of Object.entries(blocks || {})) {
      let data = {};
      try {
        data = typeof b.data === 'string' ? JSON.parse(b.data || '{}') : b.data || {};
      } catch {
        data = {};
      }
      byId.set(id, { id, ty: b.ty, parent: b.parent, external_id: b.external_id, external_type: b.external_type, data, children: [] });
    }
    for (const b of byId.values()) {
      const p = b.parent && byId.get(b.parent);
      if (p) p.children.push(b);
      else if (b.ty === 'page') roots.push(b);
      else if (!b.parent) roots.push(b);
    }
    const sortKids = (b) => {
      b.children.sort((x, y) => (x.data?.index ?? 0) - (y.data?.index ?? 0) || String(x.id).localeCompare(String(y.id)));
      b.children.forEach(sortKids);
    };
    roots.forEach(sortKids);
    return { roots, byId };
  }
}

function mapToJson(any) {
  if (any == null) return any;
  if (typeof any === 'object' && typeof any.entries === 'function') {
    const out = {};
    for (const [k, v] of any.entries()) out[k] = mapToJson(v);
    return out;
  }
  return any;
}
