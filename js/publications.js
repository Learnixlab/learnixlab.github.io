import { list, published } from './db.js';
import { esc, safeUrl } from './common.js';
export const pubHTML = p => {
  const doi = p.doi ? `https://doi.org/${encodeURI(p.doi)}` : '', pdf = safeUrl(p.pdf), link = safeUrl(p.link);
  return `<article class="pub"><div class="yr">${esc(p.year)}</div><div><h3>${esc(p.title)}</h3><div class="meta">${esc(p.authors)}</div><div class="meta"><em>${esc(p.journal)}</em> <span class="tag">${esc(p.type)}</span></div>
  <div class="acts">${doi ? `<a class="btn ghost sm" href="${doi}" rel="noopener" target="_blank">DOI</a>` : ''}${pdf ? `<a class="btn ghost sm" href="${esc(pdf)}" rel="noopener" target="_blank">PDF</a>` : ''}${link ? `<a class="btn ghost sm" href="${esc(link)}" rel="noopener" target="_blank">Link</a>` : ''}</div></div></article>`;
};
const box = document.getElementById('list');
if (box) {
  const all = published(await list('publications')).sort((a, b) => b.year - a.year);
  const yr = document.getElementById('year');
  [...new Set(all.map(p => p.year))].forEach(y => yr.add(new Option(y, y)));
  const draw = () => {
    const q = document.getElementById('q').value.toLowerCase(), t = document.getElementById('type').value, y = yr.value;
    const f = all.filter(p => (!t || p.type === t) && (!y || String(p.year) === y) && [p.title, p.authors, p.journal].join(' ').toLowerCase().includes(q));
    box.innerHTML = f.length ? f.map(pubHTML).join('') : '<div class="empty">No publications match your search.</div>';
  };
  ['q', 'type', 'year'].forEach(i => document.getElementById(i).addEventListener('input', draw)); draw();
}
