// Static data layer: public pages read data/*.json. The admin panel edits a browser draft, then publishes it.
let admin = false; export const setAdmin = () => { admin = true; };
const dk = c => 'learnix:draft:' + c, pk = c => 'learnix:pub:' + c;
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { throw new Error('Browser storage is full. Remove large photos and try again.'); } }, del: k => { try { localStorage.removeItem(k); } catch {} } };
export async function list(c) {
  if (admin) { const d = ls.get(dk(c)); if (d) try { return JSON.parse(d); } catch {} }
  try { const r = await fetch(new URL(`../data/${c}.json`, import.meta.url), { cache: 'no-store' }); return r.ok ? await r.json() : []; } catch { return []; }
}
const save = (c, l) => ls.set(dk(c), JSON.stringify(l));
export async function add(c, d) { const l = await list(c); l.push({ id: 'd' + Date.now(), createdAt: Date.now(), ...d }); save(c, l); }
export async function update(c, id, d) { save(c, (await list(c)).map(x => x.id === id ? { ...x, ...d } : x)); }
export async function remove(c, id) { save(c, (await list(c)).filter(x => x.id !== id)); }
export const published = l => l.filter(d => d.published !== false);
export const json = async c => JSON.stringify(await list(c), null, 1);
export const isDirty = c => { const d = ls.get(dk(c)); return d !== null && d !== ls.get(pk(c)); };
export const markPublished = async c => ls.set(pk(c), ls.get(dk(c)) ?? JSON.stringify(await list(c)));
export const discard = c => { ls.del(dk(c)); ls.del(pk(c)); };
const shrink = f => new Promise((res, rej) => {
  const img = new Image(), u = URL.createObjectURL(f);
  img.onload = () => { const k = Math.min(1, 400 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c.toDataURL('image/jpeg', .8)); };
  img.onerror = () => rej(new Error('That file is not a valid image.')); img.src = u;
});
// Photos are resized and saved inside the data file, so no separate image hosting is needed.
export const upload = f => f.type.startsWith('image/') ? shrink(f) : Promise.reject(new Error('Please choose an image file.'));
