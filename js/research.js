import { list, published } from './db.js';
import { esc } from './common.js';
const all = published(await list('research')).sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
const dom = document.getElementById('domain'), box = document.getElementById('list');
[...new Set(all.map(r => r.domain).filter(Boolean))].forEach(d => dom.add(new Option(d, d)));
const draw = () => {
  const q = document.getElementById('q').value.toLowerCase(), s = document.getElementById('status').value, d = dom.value;
  const f = all.filter(r => (!s || r.status === s) && (!d || r.domain === d) && [r.title, r.description, r.team].join(' ').toLowerCase().includes(q));
  box.innerHTML = f.length ? f.map(r => `<article class="card"><span class="tag st-${esc((r.status || '').replace(/\s/g, ''))}">${esc(r.status)}</span> <span class="tag">${esc(r.domain)}</span><h3 style="margin-top:10px">${esc(r.title)}</h3><p>${esc(r.description)}</p><p class="muted"><strong>Team:</strong> ${esc(r.team)}</p>${r.updates ? `<p class="muted"><strong>Latest:</strong> ${esc(r.updates)}</p>` : ''}</article>`).join('') : '<div class="empty" style="grid-column:1/-1">No projects match your filters.</div>';
};
['q', 'status', 'domain'].forEach(i => document.getElementById(i).addEventListener('input', draw)); draw();
