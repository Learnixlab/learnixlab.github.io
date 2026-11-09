import { list, add, update, remove, upload, setAdmin, json, isDirty, markPublished, discard } from './db.js';
setAdmin();
import { esc, setTheme } from './common.js';
const NAV = [['dashboard', 'Dashboard'], ['members', 'Team members'], ['publications', 'Publications'], ['research', 'Active research']];
export function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.append(d); setTimeout(() => d.remove(), 2600); }
export async function shell(active) {
  document.getElementById('root').innerHTML = `<div class="admin"><aside class="side"><a class="brand" href="../index.html">Learn<b>ix</b> Admin</a>${NAV.map(([k, l]) => `<a href="${k}.html" class="${k === active ? 'on' : ''}">${l}</a>`).join('')}<div class="bottom"><button class="btn ghost sm" id="th">Light / dark</button></div></aside><main id="main"></main></div>`;
  document.getElementById('th').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  return document.getElementById('main');
}
const input = (f, v) => {
  const n = esc(f.name), val = v ?? f.default ?? '', req = f.required ? 'required' : '';
  if (f.type === 'textarea') return `<label>${esc(f.label)}<textarea name="${n}" rows="3" ${req}>${esc(val)}</textarea></label>`;
  if (f.type === 'select') return `<label>${esc(f.label)}<select name="${n}">${f.options.map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></label>`;
  if (f.type === 'checkbox') return `<label class="chk"><input type="checkbox" name="${n}" ${(v ?? f.default) ? 'checked' : ''}> ${esc(f.label)}</label>`;
  if (f.type === 'file') return `<label>${esc(f.label)}<input type="file" name="${n}" accept="${esc(f.accept || '')}">${val ? '<small class="muted">A file is saved. Choose a new one to replace it.</small>' : ''}</label>`;
  return `<label>${esc(f.label)}<input name="${n}" type="${f.type || 'text'}" value="${esc(val)}" ${req}></label>`;
};
export async function crud(c) {
  const main = await shell(c.col);
  main.innerHTML = `<div class="bar"><h1>${esc(c.title)}</h1><button class="btn" id="add">Add ${esc(c.single)}</button></div><div class="tablewrap"><table><thead><tr>${c.columns.map(x => `<th>${esc(x.label)}</th>`).join('')}<th>Status</th><th></th></tr></thead><tbody id="rows"></tbody></table></div><dialog id="dlg"><h2 id="dt"></h2><form id="f"><div id="fields"></div><div class="bar"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div></form></dialog>`;
  const dlg = main.querySelector('#dlg'); let items = [], editing = null;
  const draw = async () => {
    items = (await list(c.col)).sort(c.sort || ((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    main.querySelector('#rows').innerHTML = items.length ? items.map(i => `<tr>${c.columns.map(x => `<td>${esc(i[x.key])}</td>`).join('')}<td>${i.published === false ? 'Draft' : 'Published'}</td><td class="acts"><button class="btn ghost sm" data-e="${esc(i.id)}">Edit</button><button class="btn danger sm" data-d="${esc(i.id)}">Delete</button></td></tr>`).join('') : `<tr><td colspan="${c.columns.length + 2}"><div class="empty">Nothing here yet. Use “Add ${esc(c.single)}” to create the first entry.</div></td></tr>`;
  };
  const open = i => { editing = i; main.querySelector('#dt').textContent = (i ? 'Edit ' : 'Add ') + c.single; main.querySelector('#fields').innerHTML = [...c.fields, { name: 'published', label: 'Publish on the website', type: 'checkbox', default: true }].map(f => input(f, i?.[f.name])).join(''); dlg.showModal(); };
  main.querySelector('#add').onclick = () => open(null);
  main.querySelector('#cancel').onclick = () => dlg.close();
  main.querySelector('#rows').onclick = async e => {
    const id = e.target.dataset.e || e.target.dataset.d; if (!id) return;
    if (e.target.dataset.e) open(items.find(i => i.id === id));
    else if (confirm('Delete this entry permanently?')) { await remove(c.col, id); toast('Deleted'); draw(); }
  };
  main.querySelector('#f').onsubmit = async e => {
    e.preventDefault(); const btn = e.submitter; btn.disabled = true;
    try {
      const d = {};
      for (const f of [...c.fields, { name: 'published', type: 'checkbox' }]) {
        const el = e.target.elements[f.name];
        if (f.type === 'checkbox') d[f.name] = el.checked;
        else if (f.type === 'file') { if (el.files[0]) d[f.name] = await upload(el.files[0]); }
        else d[f.name] = f.type === 'number' ? Number(el.value) || 0 : el.value.trim();
      }
      d.updatedAt = Date.now();
      editing ? await update(c.col, editing.id, d) : await add(c.col, d);
      dlg.close(); toast('Saved'); draw();
    } catch (err) { alert('Could not save: ' + err.message); }
    btn.disabled = false;
  };
  draw();
}
const COLS = ['members', 'publications', 'research'];
const b64 = t => btoa(unescape(encodeURIComponent(t)));
async function ghPut(g, path, text) {
  const api = `https://api.github.com/repos/${g.owner}/${g.repo}/contents/${path}`, h = { Authorization: 'Bearer ' + g.token, Accept: 'application/vnd.github+json' };
  const cur = await fetch(`${api}?ref=${encodeURIComponent(g.branch)}`, { headers: h }); let sha;
  if (cur.ok) sha = (await cur.json()).sha; else if (cur.status !== 404) throw new Error(cur.status === 401 || cur.status === 403 ? 'GitHub rejected the token. Check its permissions.' : 'GitHub error ' + cur.status + '. Check owner, repository and branch.');
  const r = await fetch(api, { method: 'PUT', headers: h, body: JSON.stringify({ message: 'Update ' + path + ' from admin panel', content: b64(text), branch: g.branch, sha }) });
  if (!r.ok) throw new Error('Could not save ' + path + ' (GitHub error ' + r.status + ').');
}
export async function dashboard() {
  const main = await shell('dashboard');
  const data = await Promise.all(COLS.map(list)), g = (() => { try { return JSON.parse(localStorage.getItem('learnix:gh')) || {}; } catch { return {}; } })();
  const dirty = COLS.some(isDirty);
  main.innerHTML = `<h1>Admin dashboard</h1><div class="stats"><div><strong>${data[0].length}</strong>Members</div><div><strong>${data[1].length}</strong>Publications</div><div><strong>${data[2].length}</strong>Projects</div></div>
  <div class="mods">${[['members', 'Manage team members', 'Add, edit, delete and publish'], ['publications', 'Manage publications', 'Add, edit, delete and publish'], ['research', 'Manage active research', 'Add, edit, delete and update status']].map(([k, t, d]) => `<a class="card" href="${k}.html"><h3>${t}</h3><p class="muted">${d}</p></a>`).join('')}</div>
  <h2 style="margin-top:36px">Put changes on the website</h2>
  <div class="msg" id="state">${dirty ? 'You have changes that are not on the live website yet.' : 'No unpublished changes.'}</div>
  <p class="muted">Edits are saved in this browser first. Press <strong>Publish</strong> to make them live for everyone.</p>
  <form id="gh" class="form"><div class="row"><label>GitHub username<input name="owner" value="${esc(g.owner || '')}" required></label><label>Repository name<input name="repo" value="${esc(g.repo || '')}" required></label><label>Branch<input name="branch" value="${esc(g.branch || 'main')}" required></label><label>Access token<input name="token" type="password" value="${esc(g.token || '')}" required autocomplete="off"></label></div>
  <button class="btn" type="submit">Publish to website</button> <button class="btn ghost" type="button" id="dl">Download data files instead</button><div id="res" role="status"></div></form>
  <details style="margin-top:18px"><summary>How do I get a token? (one time)</summary><ol><li>GitHub: Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.</li><li>Repository access: only select your website repository.</li><li>Permissions: Contents = Read and write.</li><li>Copy the token and paste it above. It stays in this browser only.</li></ol><p class="muted">Not using GitHub? Press “Download data files”, then replace the files inside the <code>data</code> folder on your host and upload again.</p></details>
  <p style="margin-top:24px"><button class="btn ghost sm" id="disc">Discard my unpublished changes</button></p>`;
  const res = main.querySelector('#res'), say = (t, e) => { res.className = 'msg' + (e ? ' err' : ''); res.textContent = t; };
  main.querySelector('#gh').onsubmit = async e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); localStorage.setItem('learnix:gh', JSON.stringify(f)); say('Publishing…');
    try { for (const c of COLS) { await ghPut(f, `data/${c}.json`, await json(c)); await markPublished(c); } say('Published. The website updates in about a minute.'); main.querySelector('#state').textContent = 'No unpublished changes.'; }
    catch (err) { say(err.message, true); }
  };
  main.querySelector('#dl').onclick = async () => { for (const c of COLS) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([await json(c)], { type: 'application/json' })); a.download = c + '.json'; a.click(); await markPublished(c); } say('Downloaded. Replace the files in your data folder and upload the site again.'); };
  main.querySelector('#disc').onclick = () => { if (confirm('Throw away local changes and reload what is live?')) { COLS.forEach(discard); location.reload(); } };
}
