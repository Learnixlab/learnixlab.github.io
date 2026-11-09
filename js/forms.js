import { site } from './site-config.js';
import { esc } from './common.js';
const show = (el, t, err) => { el.className = 'msg' + (err ? ' err' : ''); el.textContent = t; };
const mail = (subject, body) => { location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; };
const info = document.getElementById('info');
if (info) info.innerHTML = `<h2>Reach us</h2><p><strong>Email</strong><br><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p><p><strong>Lab address</strong><br>${esc(site.address)}</p>${Object.entries(site.social).filter(([, u]) => /^https?:/.test(u)).length ? `<p><strong>Social media</strong><br>${Object.entries(site.social).filter(([, u]) => /^https?:/.test(u)).map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`).join(' · ')}</p>` : ''}`;
const contact = document.getElementById('contact');
if (contact) contact.onsubmit = e => {
  e.preventDefault(); const d = Object.fromEntries(new FormData(contact));
  mail(`[Website] ${d.subject}`, `${d.message}\n\n— ${d.name} (${d.email})`);
  show(contact.querySelector('#out'), `Your email app should open with the message ready. If nothing opens, write to ${site.email}.`);
};
const apply = document.getElementById('apply');
if (apply && /^https?:/.test(site.applicationFormUrl)) apply.outerHTML = `<div class="card form"><h2>Apply online</h2><p>Use our application form to submit your details and CV.</p><a class="btn" href="${esc(site.applicationFormUrl)}" target="_blank" rel="noopener">Open the application form</a></div>`;
else if (apply) apply.onsubmit = e => {
  e.preventDefault(); const d = Object.fromEntries(new FormData(apply));
  mail(`Application: ${d.position} - ${d.name}`, ['Position: ' + d.position, 'Name: ' + d.name, 'Email: ' + d.email, 'Phone: ' + d.phone, 'Location: ' + d.location, '', 'Institution: ' + d.institution, 'Department: ' + d.department, 'Level: ' + d.level, 'CGPA: ' + d.cgpa, 'Research interests: ' + d.interests, 'CV link: ' + d.cvlink, '', d.statement, '', '(Please also attach your CV to this email.)'].join('\n'));
  show(apply.querySelector('#out'), `Your email app should open with the application ready. Attach your CV and send it. If nothing opens, write to ${site.email}.`);
};
