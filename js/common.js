export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const initials = n => String(n || '?').replace(/^(Dr|Prof)\.?\s+/i, '').split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
export const safeImg = u => /^(https?:\/\/|data:image\/(jpeg|png|webp);base64,)/i.test(u || '') ? u : '';
export const ICON = {
  scholar: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2v3.6c0 1.7 3.1 3.2 7 3.2s7-1.5 7-3.2v-3.6L12 17l-7-3.8z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7.2L4.5 7v.1L12 13l7.5-5.9V7L12 12.2z"/></svg>'
};
export const links = m => `<div class="soc">${safeUrl(m.scholar) ? `<a href="${esc(m.scholar)}" target="_blank" rel="noopener" aria-label="Google Scholar profile of ${esc(m.name)}" title="Google Scholar">${ICON.scholar}</a>` : ''}${safeUrl(m.linkedin) ? `<a href="${esc(m.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn profile of ${esc(m.name)}" title="LinkedIn">${ICON.linkedin}</a>` : ''}${m.email ? `<a href="mailto:${esc(m.email)}" aria-label="Email ${esc(m.name)}" title="Email">${ICON.mail}</a>` : ''}</div>`;
export const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';
const saved = (() => { try { return localStorage.getItem('learnix:theme'); } catch { return null; } })();
export function setTheme(t) { document.documentElement.dataset.theme = t; try { localStorage.setItem('learnix:theme', t); } catch {} }
document.documentElement.dataset.theme = saved || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
const PAGES = [['index.html', 'Home'], ['publications.html', 'Publications'], ['team.html', 'Team'], ['research.html', 'Active Research'], ['contact.html', 'Contact'], ['application.html', 'Apply']];
const here = location.pathname.split('/').pop() || 'index.html';
const header = document.getElementById('site-header'), footer = document.getElementById('site-footer');
if (header) {
  header.innerHTML = `<nav class="nav" aria-label="Main"><div class="wrap"><a class="brand" href="index.html">Learn<b>ix</b> Research Lab</a>
    <div class="links" id="links">${PAGES.map(([h, l]) => `<a href="${h}" class="${h === here ? 'on' : ''}" ${h === here ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</div>
    <button class="icon-btn" id="theme" aria-label="Toggle light or dark mode">◐</button>
    <button class="icon-btn burger" id="burger" aria-label="Menu" aria-expanded="false">☰</button></div></nav>`;
  document.getElementById('theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  const b = document.getElementById('burger'); b.onclick = () => b.setAttribute('aria-expanded', document.getElementById('links').classList.toggle('open'));
}
if (footer) footer.innerHTML = `<footer class="foot"><div class="wrap"><div class="cols">
  <div><h4>Learnix Research Lab</h4><p>Research in learning, language and intelligent systems.</p></div>
  <div><h4>Explore</h4>${PAGES.slice(1, 4).map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</div>
  <div><h4>Join us</h4><a href="application.html">Apply</a><a href="contact.html">Collaborate</a><a href="admin/dashboard.html">Admin</a></div></div>
  <div class="copy">© ${new Date().getFullYear()} Learnix Research Lab. All rights reserved.</div></div></footer>`;
