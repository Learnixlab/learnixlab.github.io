import { list, published } from './db.js';
import { esc, initials, safeImg, links } from './common.js';
const ROLES = ['Advisor', 'Senior Advisor', 'Research Lead', 'Researcher', 'Assistant Researcher', 'Associate Researcher', 'Research Intern'];
const all = published(await list('members')).sort((a, b) => (a.order || 99) - (b.order || 99));
const el = document.getElementById('groups');
const groups = ROLES.map(r => [r, all.filter(m => m.role === r)]).filter(([, l]) => l.length);
el.innerHTML = groups.length ? groups.map(([r, l]) => `<section class="group"><h2>${esc(r)}${l.length > 1 && !r.endsWith('s') ? 's' : ''}</h2><div class="grid">${l.map(m => `<div class="card">${safeImg(m.photo) ? `<img class="avatar" src="${esc(m.photo)}" alt="">` : `<div class="avatar" aria-hidden="true">${esc(initials(m.name))}</div>`}<h3>${esc(m.name)}</h3><div class="role">${esc(m.title)}</div><p class="muted">${esc(m.bio)}</p>${links(m)}</div>`).join('')}</div></section>`).join('') : '<div class="empty">Team members will appear here.</div>';
