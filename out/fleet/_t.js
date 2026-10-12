
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[<>&"]/g, c =>
  ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
let F = null, sortB = {k:'name', dir:1}, sortL = {k2:'files', dir:-1};

const cls = a => b => a(b) ? 'up' : 'down';
const dot = on => `<span class="dot" style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${on?'var(--up)':'var(--down)'};margin-right:6px"></span>`;

function sortBy(arr, key, dir){
  return arr.slice().sort((x,y)=>{
    const a = x[key] ?? '', b = y[key] ?? '';
    if (typeof a === 'number' && typeof b === 'number') return (a-b)*dir;
    return String(a).localeCompare(String(b))*dir;
  });
}

function render(){
  if(!F) return;
  const t = F.totals || {};
  $('#root').textContent = F.root || '';
  $('#gen').textContent = F.generated_at ? 'scanned ' + F.generated_at : '';
  $('#strip').innerHTML = `
    <div><span>Roster bots</span><b>${t.bots||0}</b></div>
    <div><span>Project lanes</span><b>${t.lanes||0}</b></div>
    <div><span>Files scanned</span><b>${(t.lane_files||0).toLocaleString()}</b></div>
    <div><span>Live profiles</span><b class="${t.matched?'good':'warn'}">${t.matched||0}/${t.profiles||0}</b></div>
    <div><span>Empty lanes</span><b class="${t.empty_lanes?'zero':''}">${t.empty_lanes||0}</b></div>`;

  const P = F.profiles || {};
  const bots = sortBy(F.bots||[], sortB.k, sortB.dir);
  $('#botN').textContent = `${bots.length} documented · ${t.matched||0} with a live profile`;
  $('#bots').innerHTML = bots.map(b=>{
    const p = b.profile ? P[b.profile] : null;
    const dead = p && /muse-spark|mimo/i.test(p.model||'');
    return `<tr>
      <td><b>${esc(b.name)}</b></td>
      <td class="sec">${esc(b.section||'')}</td>
      <td class="role">${esc((b.role||'').slice(0,190))}${(b.role||'').length>190?'…':''}</td>
      <td>${b.profile ? `<span class="pill live">${esc(b.profile)}</span>` : '<span class="pill none">no profile</span>'}</td>
      <td class="mono ${dead?'':'dim'}">${p && p.model ? esc(p.model) : '—'}</td>
      <td>${p ? (p.auth ? '<span class="pill live">yes</span>' : '<span class="pill none">none</span>') : '—'}</td>
      <td class="num mono ${p&&p.jobs?'':'zero'}">${p?(p.jobs||0):'—'}</td>
      <td class="num mono ${p&&p.executions?'':'zero'}">${p?(p.executions||0):'—'}</td>
    </tr>`;
  }).join('');

  const lanes = sortBy(F.lanes||[], sortL.k2, sortL.dir);
  $('#laneN').textContent = `${lanes.length} lanes · ${(t.lane_files||0).toLocaleString()} files`;
  $('#lanes').innerHTML = lanes.map(l=>`
    <tr>
      <td><b>${esc(l.name)}</b></td>
      <td class="num mono ${l.files?'':'zero'}">${l.files.toLocaleString()}</td>
      <td class="num mono dim">${l.md}</td>
      <td class="mono dim">${esc(l.modified||'—')}</td>
    </tr>`).join('');
  $('#botEmpty').innerHTML = (t.jobs===0 && t.matched) ? '' : '';
}

document.querySelectorAll('th[data-k]').forEach(th=>th.onclick=()=>{
  const k = th.dataset.k;
  sortB.dir = (sortB.k===k) ? -sortB.dir : 1; sortB.k = k; render();
});
document.querySelectorAll('th[data-k2]').forEach(th=>th.onclick=()=>{
  const k = th.dataset.k2;
  sortL.dir = (sortL.k2===k) ? -sortL.dir : -1; sortL.k2 = k; render();
});

async function tick(){
  try{ const r = await fetch('/api/fleet',{cache:'no-store'}); F = await r.json(); render(); }
  catch(e){ const g=document.getElementById('gen'); if(g) g.textContent='ERR: '+e.message; }
}
tick(); setInterval(tick, 15000);
