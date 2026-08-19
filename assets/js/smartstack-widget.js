/**
 * VidiSmart SmartStack Widget
 * Floating AI stack configurator + page diagnostics
 * Drop <script src="assets/js/smartstack-widget.js"></script> into any page.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'vs-smartstack-v1';
    const POS_KEY     = 'vs-smartstack-pos';

    // ── Role definitions ────────────────────────────────────────────────────
    const ROLES = [
        { id: 'vision',    icon: '👁️',  label: 'Vision',    color: '#22d3ee', desc: 'Image & UI analysis' },
        { id: 'reasoning', icon: '🧠',  label: 'Reasoning', color: '#c084fc', desc: 'Planning & strategy' },
        { id: 'code',      icon: '⌨️',  label: 'Code',      color: '#60a5fa', desc: 'Coding & agents' },
        { id: 'video',     icon: '🎬',  label: 'Video',     color: '#f472b6', desc: 'Video generation' },
        { id: 'image',     icon: '🎨',  label: 'Image',     color: '#fcd34d', desc: 'Image synthesis' },
        { id: 'local',     icon: '💻',  label: 'Local',     color: '#4ade80', desc: 'Offline / private' },
    ];

    // ── Model catalog ────────────────────────────────────────────────────────
    const MODELS = {
        vision: [
            { name: 'MiniMax M3 (May 2026)',      sub: 'MiniMax',   price: '$0.30/$1.20', ctx: '1M',   note: 'Frontier Omni — best all-round vision' },
            { name: 'Qwen 3.8 Max (Aug 2026)',    sub: 'Alibaba',   price: '$1.20/$3.60', ctx: '1M',   note: '2.4T MoE · Top 5 globally · Native vision' },
            { name: 'MiMo 2.5 Omni (Apr 2026)',   sub: 'Xiaomi',    price: 'Free / Local',ctx: '512K', note: 'Open-weight · runs on ~8 GB VRAM', local: true },
            { name: 'MiMo 2.5 Pro (Apr 2026)',    sub: 'Xiaomi',    price: '$0.44/$0.87', ctx: '512K', note: 'Pro vision tier · higher precision' },
            { name: 'Qwen 3.8 Plus (Aug 2026)',   sub: 'Alibaba',   price: '$0.30/$1.20', ctx: '1M',   note: 'Vision + agentic code in one model' },
            { name: 'GLM-5V Turbo (Jun 2026)',    sub: 'Zhipu AI',  price: '$0.20/$0.80', ctx: '1M',   note: 'Agent-grade visual QA & layout analysis' },
            { name: 'Gemini 3.1 Pro (Feb 2026)',  sub: 'Google',    price: '$2.00/$12.00',ctx: '10M',  note: '10M context window · Math/Science' },
        ],
        reasoning: [
            { name: 'Qwen 3.8 Max (Aug 2026)',    sub: 'Alibaba',   price: '$1.20/$3.60', ctx: '1M',   note: '2.4T MoE · Top 5 globally · Reasoning' },
            { name: 'DeepSeek V4 Pro 0813 (Aug 2026)', sub: 'DeepSeek',  price: '$0.44/$0.87', ctx: '1M',   note: 'Frontier reasoning · dual thinking modes' },
            { name: 'Claude Opus 5 (Aug 2026)',   sub: 'Anthropic', price: '$5.00/$25.00',ctx: '1M',   note: 'Maximum capability · deep refactoring' },
            { name: 'GLM-5.3 (Aug 2026)',         sub: 'Zhipu AI',  price: '$1.35/$4.20', ctx: '1M',   note: 'MIT-licensed · deep recursive debugging' },
            { name: 'Moonshot AI Kimi K3 (Jul 2026)', sub: 'Moonshot',  price: '$3.00/$15.00', ctx: '1M',   note: '2.8T MoE · #4 globally · 1M context' },
        ],
        code: [
            { name: 'Qwen 3.8 Max (Aug 2026)',      sub: 'Alibaba',   price: '$1.20/$3.60', ctx: '1M',   note: '#1 Code Arena · 2.4T coding superagent' },
            { name: 'DeepSeek V4 Flash 0731 (Jul 2026)', sub: 'DeepSeek', price: '$0.09/$0.18', ctx: '1M', note: 'Speculative decoding · DeepSWE 54.4%' },
            { name: 'DeepSeek V4 Pro 0813 (Aug 2026)', sub: 'DeepSeek',  price: '$0.44/$0.87', ctx: '1M',   note: 'Best value frontier coder' },
            { name: 'Claude Sonnet 5 (Jun 2026)',   sub: 'Anthropic', price: '$2.00/$10.00',ctx: '1M',   note: 'Premium code · autonomous tool use' },
            { name: 'Moonshot AI Kimi K3 (Jul 2026)', sub: 'Moonshot',  price: '$3.00/$15.00', ctx: '1M',   note: '2.8T MoE · autonomous tool loops' },
            { name: 'Qwen 3.8 27B (Aug 2026)',      sub: 'Alibaba',   price: 'Free / Local',ctx: '128K', note: 'Local 27B · fits RTX 4090 (~17GB)', local: true },
        ],
        video: [
            { name: 'Seedance 2.5 (Jul 2026)',  sub: 'ByteDance', price: '~$0.09 / sec', note: '4K single-pass · 50 references · audio' },
            { name: 'MiniMax H3 (Jul 2026)',    sub: 'MiniMax',   price: '$0.13 / sec',  note: 'Unified Any-to-Video · native Foley audio' },
            { name: 'Kling 3.0 (Jul 2026)',     sub: 'Kuaishou',  price: '$0.09–0.14/s', note: 'Realistic high-motion I2V at scale' },
            { name: 'Veo 3.1 (Jun 2026)',       sub: 'Google',    price: '$0.50–0.75/s', note: '4K cinematic · integrated into editors' },
            { name: 'Runway Gen-4.5 (Jun 2026)',sub: 'Runway ML', price: '$0.08–0.40/s', note: 'Advanced physics · 4K HD output' },
        ],
        image: [
            { name: 'Midjourney v7 (Jul 2026)',  sub: 'Midjourney', price: '$0.04 / img',  note: 'Artistic gold standard · unmatched aesthetics' },
            { name: 'FLUX 1.1 Pro (Aug 2026)',   sub: 'Black Forest', price: '$0.04 / img',note: 'Commercial grade · ComfyUI compatible' },
            { name: 'Ideogram 3.0 (Jul 2026)',   sub: 'Ideogram',   price: '$0.05 / img',  note: 'Best-in-class text rendering in images' },
            { name: 'SD 3.5 Large (Jun 2026)',   sub: 'Stability',  price: 'Free (OSS)',   note: 'Open source · full fine-tuning ecosystem' },
            { name: 'Imagen 4 Ultra (Jun 2026)', sub: 'Google',     price: 'Vertex AI',    note: 'Photorealism · rich detail + text render' },
        ],
        local: [
            { name: 'Qwen 3.8 27B (Aug 2026)',  sub: 'Alibaba', price: 'Free', ctx: '128K', note: 'Q4_K_M · ~17 GB · fits RTX 4090 (24 GB)', local: true },
            { name: 'MiMo 2.5 Omni (Apr 2026)', sub: 'Xiaomi',  price: 'Free', ctx: '512K', note: 'Omni vision+audio+text · ~8 GB VRAM', local: true },
        ],
    };

    const DEFAULT_STACK = {
        vision: 'Qwen 3.8 Max (Aug 2026)', reasoning: 'DeepSeek V4 Pro 0813 (Aug 2026)',
        code:   'DeepSeek V4 Flash 0731 (Jul 2026)', video: 'Seedance 2.5 (Jul 2026)',
        image:  'FLUX 1.1 Pro (Aug 2026)', local: 'Qwen 3.8 27B (Aug 2026)',
    };

    // ── CSS ──────────────────────────────────────────────────────────────────
    const CSS = `
#ss-root{position:fixed;bottom:24px;left:24px;z-index:2147483647;font-family:'Kumbh Sans','Segoe UI',sans-serif}
#ss-root *{box-sizing:border-box;font-family:inherit}
#ss-trigger{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:1px solid rgba(255,255,255,.2);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(99,102,241,.55);animation:ssPulse 3s ease-in-out infinite;transition:transform .2s,box-shadow .2s;padding:0}
#ss-trigger:hover{transform:scale(1.09);box-shadow:0 8px 32px rgba(99,102,241,.8)}
#ss-trigger svg{width:26px;height:26px;flex-shrink:0}
@keyframes ssPulse{0%,100%{box-shadow:0 4px 24px rgba(99,102,241,.55),0 0 0 0 rgba(99,102,241,.4)}50%{box-shadow:0 4px 24px rgba(99,102,241,.55),0 0 0 9px rgba(99,102,241,0)}}
#ss-panel{position:absolute;bottom:62px;left:0;width:340px;height:500px;background:rgba(7,10,28,.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(99,102,241,.28);border-radius:20px;box-shadow:0 24px 70px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.04);display:none;flex-direction:column;overflow:hidden}
#ss-panel.ss-open{display:flex;animation:ssPanelIn .22s cubic-bezier(.34,1.56,.64,1)}
@keyframes ssPanelIn{from{opacity:0;transform:translateY(14px) scale(.95)}to{opacity:1;transform:none}}
#ss-handle{padding:11px 14px 10px;background:rgba(99,102,241,.1);border-bottom:1px solid rgba(255,255,255,.06);cursor:grab;display:flex;align-items:center;gap:8px;flex-shrink:0;height:46px}
#ss-handle.dragging{cursor:grabbing}
#ss-title{font-size:.72rem;font-weight:800;color:rgba(255,255,255,.9);letter-spacing:.05em;text-transform:uppercase;flex:1;display:flex;align-items:center;gap:6px}
#ss-title svg{width:13px;height:13px;color:#818cf8;flex-shrink:0}
.ss-tabs{display:flex;gap:3px;background:rgba(0,0,0,.3);border-radius:8px;padding:3px}
.ss-tab-btn{padding:3px 10px;border:none;border-radius:6px;background:transparent;color:rgba(148,163,184,.7);font-size:.65rem;font-weight:800;cursor:pointer;font-family:inherit;transition:all .18s;letter-spacing:.04em;text-transform:uppercase}
.ss-tab-btn.active{background:rgba(99,102,241,.45);color:#fff}
#ss-close{width:24px;height:24px;border:1px solid rgba(255,255,255,.1);border-radius:6px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .18s;flex-shrink:0;padding:0;line-height:1}
#ss-close:hover{background:rgba(239,68,68,.3);color:#fff;border-color:rgba(239,68,68,.5)}
.ss-body{flex:1;overflow:hidden;position:relative}
.ss-tab-pane{display:none;height:100%;overflow-y:auto;padding:12px}
.ss-tab-pane.active{display:block}
.ss-tab-pane::-webkit-scrollbar{width:3px}
.ss-tab-pane::-webkit-scrollbar-thumb{background:rgba(99,102,241,.4);border-radius:2px}
.ss-stack-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px}
.ss-slot{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:10px;cursor:pointer;transition:border-color .2s,background .2s;position:relative}
.ss-slot:hover{border-color:var(--sc);background:rgba(255,255,255,.06)}
.ss-slot-role{font-size:.58rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--sc);margin-bottom:5px;display:flex;align-items:center;gap:4px}
.ss-slot-name{font-size:.78rem;font-weight:700;color:rgba(241,245,249,.92);line-height:1.25;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ss-slot-sub{font-size:.63rem;color:rgba(100,116,139,.8)}
.ss-slot-local{display:inline-flex;align-items:center;gap:3px;font-size:.56rem;font-weight:700;color:#4ade80;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.22);border-radius:4px;padding:1px 5px;margin-top:3px}
.ss-copy{width:100%;padding:8px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.32);border-radius:10px;color:#a5b4fc;font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;letter-spacing:.02em}
.ss-copy:hover{background:rgba(99,102,241,.26);color:#fff}
.ss-copy.ok{background:rgba(74,222,128,.14);border-color:rgba(74,222,128,.38);color:#4ade80}
#ss-picker{position:absolute;inset:0;background:rgba(7,10,28,.98);border-radius:20px;padding:12px;display:none;flex-direction:column;z-index:5}
#ss-picker.open{display:flex;animation:ssPanelIn .18s ease}
#ss-picker-hd{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-shrink:0}
#ss-picker-back{background:none;border:none;color:rgba(148,163,184,.7);cursor:pointer;font-size:18px;padding:0;line-height:1;font-family:inherit}
#ss-picker-back:hover{color:#fff}
#ss-picker-lbl{font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:rgba(255,255,255,.9)}
.ss-plist{overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:5px}
.ss-plist::-webkit-scrollbar{width:3px}
.ss-plist::-webkit-scrollbar-thumb{background:rgba(99,102,241,.4);border-radius:2px}
.ss-pitem{padding:9px 11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;cursor:pointer;transition:all .18s}
.ss-pitem:hover{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.4)}
.ss-pitem.cur{border-color:rgba(99,102,241,.6);background:rgba(99,102,241,.16)}
.ss-pname{font-size:.8rem;font-weight:700;color:rgba(241,245,249,.92);margin-bottom:3px}
.ss-pmeta{display:flex;gap:7px;font-size:.63rem;color:rgba(100,116,139,.8)}
.ss-pmeta .p{color:#818cf8}
.ss-pmeta .l{color:#4ade80}
.ss-pnote{font-size:.63rem;color:rgba(100,116,139,.6);margin-top:2px}
.ss-dsec{margin-bottom:12px}
.ss-dtitle{font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.09em;color:rgba(99,102,241,.9);margin-bottom:7px;display:flex;align-items:center;gap:4px}
.ss-drow{display:flex;justify-content:space-between;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:.71rem;gap:8px}
.ss-drow:last-child{border:none}
.ss-dk{color:rgba(100,116,139,.8);font-weight:500;flex-shrink:0}
.ss-dv{color:rgba(226,232,240,.9);font-weight:600;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:58%}
.ok{color:#4ade80!important}.warn{color:#fbbf24!important}.bad{color:#f87171!important}
.ss-ftags{display:flex;flex-wrap:wrap;gap:3px;margin-top:2px;justify-content:flex-end}
.ss-ftag{font-size:.58rem;font-weight:700;padding:1px 6px;background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.22);border-radius:4px;color:#a5b4fc}
.ss-refresh{width:100%;padding:7px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;color:rgba(148,163,184,.7);font-size:.7rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s;letter-spacing:.02em}
.ss-refresh:hover{background:rgba(99,102,241,.12);color:#fff;border-color:rgba(99,102,241,.3)}
#ss-root.dragging{transition:none!important}
`;

    // ── Build DOM ────────────────────────────────────────────────────────────
    function buildHTML() {
        const stackGrid = ROLES.map(r =>
            `<div class="ss-slot" data-role="${r.id}" style="--sc:${r.color}">
                <div class="ss-slot-role">${r.icon} ${r.label}</div>
                <div class="ss-slot-name" id="ssn-${r.id}">—</div>
                <div class="ss-slot-sub"  id="sss-${r.id}"></div>
                <div id="ssl-${r.id}"></div>
            </div>`
        ).join('');

        return `
<button id="ss-trigger" title="SmartStack — configure your AI pipeline">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
    <rect x="3" y="4"  width="18" height="4" rx="2"/>
    <rect x="3" y="10" width="18" height="4" rx="2"/>
    <rect x="3" y="16" width="18" height="4" rx="2"/>
    <circle cx="20" cy="6"  r="2" fill="#22d3ee" stroke="none"/>
    <circle cx="20" cy="12" r="2" fill="#c084fc" stroke="none"/>
    <circle cx="20" cy="18" r="2" fill="#4ade80" stroke="none"/>
  </svg>
</button>
<div id="ss-panel">
  <div id="ss-handle">
    <div id="ss-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      SmartStack
    </div>
    <div class="ss-tabs">
      <button class="ss-tab-btn active" data-tab="stack">Stack</button>
      <button class="ss-tab-btn"        data-tab="diag">Diag</button>
    </div>
    <button id="ss-close">✕</button>
  </div>
  <div class="ss-body">
    <div id="ss-tab-stack" class="ss-tab-pane active">
      <div class="ss-stack-grid">${stackGrid}</div>
      <button class="ss-copy" id="ss-copy">Copy Stack Config</button>
    </div>
    <div id="ss-tab-diag" class="ss-tab-pane">
      <div id="ss-diag"></div>
      <button class="ss-refresh" id="ss-refresh">↻ Re-run Diagnostics</button>
    </div>
  </div>
  <div id="ss-picker">
    <div id="ss-picker-hd">
      <button id="ss-picker-back">‹</button>
      <span id="ss-picker-lbl">Choose Model</span>
    </div>
    <div class="ss-plist" id="ss-plist"></div>
  </div>
</div>`;
    }

    // ── Stack helpers ────────────────────────────────────────────────────────
    function getStack() {
        try { return { ...DEFAULT_STACK, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
        catch (e) { return { ...DEFAULT_STACK }; }
    }

    function saveStack(s) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    }

    function renderStack(root) {
        const stack = getStack();
        ROLES.forEach(r => {
            const name  = stack[r.id] || '—';
            const model = (MODELS[r.id] || []).find(m => m.name === name);
            const nameEl = root.querySelector(`#ssn-${r.id}`);
            const subEl  = root.querySelector(`#sss-${r.id}`);
            const locEl  = root.querySelector(`#ssl-${r.id}`);
            if (nameEl) nameEl.textContent = name;
            if (subEl)  subEl.textContent  = model ? `${model.sub} · ${model.price}` : '';
            if (locEl)  locEl.innerHTML    = model && model.local
                ? `<div class="ss-slot-local">💻 Local</div>` : '';
        });
    }

    function openPicker(root, roleId) {
        const role    = ROLES.find(r => r.id === roleId);
        const current = getStack()[roleId];
        const list    = MODELS[roleId] || [];
        root.querySelector('#ss-picker-lbl').textContent = `${role.icon} ${role.label} Model`;
        root.querySelector('#ss-plist').innerHTML = list.map(m => `
            <div class="ss-pitem ${m.name === current ? 'cur' : ''}" data-model="${m.name}">
                <div class="ss-pname">${m.name}</div>
                <div class="ss-pmeta">
                    <span>${m.sub}</span>
                    <span class="p">${m.price}</span>
                    ${m.ctx  ? `<span>${m.ctx} ctx</span>` : ''}
                    ${m.local ? `<span class="l">💻 Local</span>` : ''}
                </div>
                <div class="ss-pnote">${m.note || ''}</div>
            </div>`).join('');
    }

    // ── Diagnostics ──────────────────────────────────────────────────────────
    function runDiag(root) {
        const diag = root.querySelector('#ss-diag');

        function row(k, v, cls) {
            return `<div class="ss-drow">
                <span class="ss-dk">${k}</span>
                <span class="ss-dv ${cls||''}">${v}</span>
            </div>`;
        }

        const os  = detectOS();
        const br  = detectBrowser();
        const gpu = 'gpu' in navigator;
        const gl  = checkWebGL();
        const nn  = 'ml' in navigator;
        const sw  = 'serviceWorker' in navigator;
        const ms  = Math.round(performance.now());
        const feats = detectFeatures();

        const featureHTML = feats.length
            ? `<div class="ss-ftags">${feats.map(f => `<span class="ss-ftag">${f}</span>`).join('')}</div>`
            : '<span style="color:rgba(100,116,139,.5)">None detected</span>';

        diag.innerHTML = `
<div class="ss-dsec">
  <div class="ss-dtitle">🖥️ System</div>
  ${row('OS', os)}
  ${row('Browser', br)}
  ${row('Screen', window.screen.width + '×' + window.screen.height)}
  ${row('Viewport', window.innerWidth + '×' + window.innerHeight)}
  ${row('Pixel Ratio', window.devicePixelRatio + 'x')}
</div>
<div class="ss-dsec">
  <div class="ss-dtitle">🤖 AI / Hardware APIs</div>
  ${row('WebGPU',         gpu ? '✅ Available' : '❌ Not detected', gpu ? 'ok' : 'warn')}
  ${row('WebGL 2',        gl  ? '✅ Available' : '⚠️ Fallback only', gl ? 'ok' : 'warn')}
  ${row('Web Neural Net', nn  ? '✅ Available' : '❌ Not detected', nn ? 'ok' : 'warn')}
  ${row('Service Worker', sw  ? '✅ Supported' : '❌ Not supported', sw ? 'ok' : 'warn')}
  ${row('Clipboard API',  navigator.clipboard ? '✅ Available' : '❌ No', navigator.clipboard ? 'ok' : 'warn')}
</div>
<div class="ss-dsec">
  <div class="ss-dtitle">📄 This Page</div>
  ${row('Title',     document.title.split('|')[0].split('—')[0].trim() || 'Untitled')}
  ${row('Route',     location.pathname.replace(/.*\//, '/') || '/')}
  ${row('Load time', ms + ' ms', ms < 800 ? 'ok' : ms < 2500 ? 'warn' : 'bad')}
  <div class="ss-drow">
    <span class="ss-dk">VS Features</span>
    <span class="ss-dv" style="max-width:none;white-space:normal">${featureHTML}</span>
  </div>
</div>`;
    }

    function detectOS() {
        const ua = navigator.userAgent;
        if (/Windows NT 1[01]/.test(ua)) return 'Windows 10 / 11';
        if (/Windows/.test(ua)) return 'Windows';
        if (/iPhone/.test(ua)) return 'iOS (iPhone)';
        if (/iPad/.test(ua))   return 'iPadOS';
        if (/Mac OS X/.test(ua)) return 'macOS';
        if (/Android/.test(ua)) return 'Android';
        if (/Linux/.test(ua))   return 'Linux';
        return 'Unknown';
    }

    function detectBrowser() {
        const ua = navigator.userAgent;
        const v  = re => { const m = ua.match(re); return m ? ' ' + m[1].split('.')[0] : ''; };
        if (/Edg\//.test(ua))     return 'Edge'    + v(/Edg\/([\d.]+)/);
        if (/OPR\//.test(ua))     return 'Opera'   + v(/OPR\/([\d.]+)/);
        if (/Chrome\//.test(ua))  return 'Chrome'  + v(/Chrome\/([\d.]+)/);
        if (/Firefox\//.test(ua)) return 'Firefox' + v(/Firefox\/([\d.]+)/);
        if (/Safari\//.test(ua))  return 'Safari';
        return 'Unknown';
    }

    function checkWebGL() {
        try {
            const c = document.createElement('canvas');
            return !!(c.getContext('webgl2') || c.getContext('webgl'));
        } catch (e) { return false; }
    }

    function detectFeatures() {
        const f = [];
        if (document.querySelector('.route-chip'))      f.push('Route Filter');
        if (document.querySelector('#toolsGrid'))        f.push('Tools Directory');
        if (document.querySelector('.model-row'))        f.push('Model Matrix');
        if (document.querySelector('.local-chip-badge')) f.push('Local Badges');
        if (document.querySelector('.category-tabs'))   f.push('Category Tabs');
        if (document.querySelector('.matrix-table'))    f.push('Comparison Table');
        if (document.querySelector('.bg-canvas'))       f.push('Aurora BG');
        if (document.querySelector('.hero-stats'))      f.push('Live Stats');
        if (document.querySelector('.hero-howto'))      f.push('How-to Guide');
        if (document.querySelector('.glass-panel'))     f.push('Glass Panels');
        return f;
    }

    // ── Drag ─────────────────────────────────────────────────────────────────
    function setupDrag(root, handle) {
        let active = false, ox = 0, oy = 0;

        function start(e) {
            if (e.target.closest('button')) return;
            active = true;
            const r  = root.getBoundingClientRect();
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            ox = cx - r.left;
            oy = cy - r.top;
            root.classList.add('dragging');
            handle.classList.add('dragging');
            e.preventDefault();
        }

        function move(e) {
            if (!active) return;
            const cx = e.touches ? e.touches[0].clientX : e.clientX;
            const cy = e.touches ? e.touches[0].clientY : e.clientY;
            const x  = Math.max(0, Math.min(cx - ox, window.innerWidth  - root.offsetWidth));
            const y  = Math.max(0, Math.min(cy - oy, window.innerHeight - root.offsetHeight));
            root.style.cssText += `;left:${x}px;top:${y}px;bottom:auto;right:auto`;
        }

        function end() {
            if (!active) return;
            active = false;
            root.classList.remove('dragging');
            handle.classList.remove('dragging');
            try { localStorage.setItem(POS_KEY, JSON.stringify({ left: root.style.left, top: root.style.top })); }
            catch (e) {}
        }

        handle.addEventListener('mousedown',  start);
        handle.addEventListener('touchstart', start, { passive: false });
        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('mouseup',   end);
        document.addEventListener('touchend',  end);
    }

    // ── Boot ─────────────────────────────────────────────────────────────────
    function init() {
        // Inject styles
        const style = document.createElement('style');
        style.textContent = CSS;
        document.head.appendChild(style);

        // Inject widget
        const root = document.createElement('div');
        root.id = 'ss-root';
        root.innerHTML = buildHTML();
        document.body.appendChild(root);

        // Restore dragged position
        try {
            const p = JSON.parse(localStorage.getItem(POS_KEY));
            if (p && p.left) {
                Object.assign(root.style, { left: p.left, top: p.top, bottom: 'auto', right: 'auto' });
            }
        } catch (e) {}

        const panel  = root.querySelector('#ss-panel');
        const handle = root.querySelector('#ss-handle');
        const picker = root.querySelector('#ss-picker');
        let   activeRole = null;

        // Open / close
        root.querySelector('#ss-trigger').addEventListener('click', () => {
            panel.classList.toggle('ss-open');
            if (panel.classList.contains('ss-open')) { renderStack(root); runDiag(root); }
        });
        root.querySelector('#ss-close').addEventListener('click', () => panel.classList.remove('ss-open'));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('ss-open'); });

        // Tabs
        root.querySelectorAll('.ss-tab-btn').forEach(btn =>
            btn.addEventListener('click', () => {
                root.querySelectorAll('.ss-tab-btn').forEach(b => b.classList.remove('active'));
                root.querySelectorAll('.ss-tab-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                root.querySelector(`#ss-tab-${btn.dataset.tab}`).classList.add('active');
                if (btn.dataset.tab === 'diag') runDiag(root);
            })
        );

        // Slot click → picker
        root.querySelector('.ss-stack-grid').addEventListener('click', e => {
            const slot = e.target.closest('.ss-slot');
            if (!slot) return;
            activeRole = slot.dataset.role;
            openPicker(root, activeRole);
            picker.classList.add('open');
        });

        // Picker back
        root.querySelector('#ss-picker-back').addEventListener('click', () => picker.classList.remove('open'));

        // Picker select
        root.querySelector('#ss-plist').addEventListener('click', e => {
            const item = e.target.closest('.ss-pitem');
            if (!item || !activeRole) return;
            const stack = getStack();
            stack[activeRole] = item.dataset.model;
            saveStack(stack);
            picker.classList.remove('open');
            renderStack(root);
        });

        // Copy config
        root.querySelector('#ss-copy').addEventListener('click', function () {
            const btn  = this;
            const text = ROLES.map(r => `${r.label}: ${getStack()[r.id]}`).join('\n');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    btn.textContent = '✓ Copied!';
                    btn.classList.add('ok');
                    setTimeout(() => { btn.textContent = 'Copy Stack Config'; btn.classList.remove('ok'); }, 2000);
                });
            } else {
                btn.textContent = '✗ Clipboard unavailable';
                setTimeout(() => { btn.textContent = 'Copy Stack Config'; }, 2000);
            }
        });

        // Diag refresh
        root.querySelector('#ss-refresh').addEventListener('click', () => runDiag(root));

        // Drag
        setupDrag(root, handle);

        // Initial render
        renderStack(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
