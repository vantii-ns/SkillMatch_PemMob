import { ErrorHttp } from '../utils/http.js';

async function ambil(url, headers = {}) {
  try { return await fetch(url, { headers, signal: AbortSignal.timeout(10000) }); }
  catch { throw new ErrorHttp(504, 'Layanan eksternal tidak merespons (waktu tunggu habis atau jaringan bermasalah)'); }
}

// ---------- GitHub API ----------
export async function ambilGithub(username) {
  const h = { Accept: 'application/vnd.github+json', 'User-Agent': 'SkillMatch-API' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const enc = encodeURIComponent(username);

  const ur = await ambil(`https://api.github.com/users/${enc}`, h);
  if (ur.status === 404) throw new ErrorHttp(404, 'Username GitHub tidak ditemukan');
  if (ur.status === 403 || ur.status === 429) throw new ErrorHttp(429, 'Batas GitHub API tercapai, coba lagi nanti');
  if (!ur.ok) throw new ErrorHttp(502, 'Gagal mengambil data GitHub');
  const user = await ur.json();

  const rr = await ambil(`https://api.github.com/users/${enc}/repos?per_page=100&sort=pushed`, h);
  const repos = rr.ok ? await rr.json() : [];
  const hitung = {};
  for (const r of repos) if (r.language && !r.fork) hitung[r.language] = (hitung[r.language] || 0) + 1;
  const bahasa = Object.entries(hitung).sort((a, b) => b[1] - a[1]).map(([b]) => b);

  let commit = 0;
  const cr = await ambil(`https://api.github.com/search/commits?q=author:${enc}&per_page=1`, h);
  if (cr.ok) commit = (await cr.json()).total_count || 0;

  return { external_id: String(user.id), username: user.login, bio: user.bio || '',
           ringkasan: { jumlah_repo: user.public_repos, jumlah_commit: commit, top_languages: bahasa } };
}

// ---------- Figma API ----------
// Token pribadi dipakai sekali untuk verifikasi dan TIDAK disimpan (kebutuhan non-fungsional keamanan).
export async function ambilFigma(token, fileKeys = []) {
  const h = { 'X-Figma-Token': token };
  const me = await ambil('https://api.figma.com/v1/me', h);
  if (me.status === 401 || me.status === 403) throw new ErrorHttp(401, 'Token Figma tidak valid');
  if (!me.ok) throw new ErrorHttp(502, 'Gagal mengambil data Figma');
  const profil = await me.json();

  const files = [];
  for (const key of fileKeys.slice(0, 10)) {
    const r = await ambil(`https://api.figma.com/v1/files/${encodeURIComponent(key)}?depth=1`, h);
    if (!r.ok) continue;
    const f = await r.json();
    files.push({ key, name: f.name, lastModified: f.lastModified, thumbnailUrl: f.thumbnailUrl });
  }
  return { external_id: String(profil.id || ''), username: profil.handle,
           ringkasan: { jumlah_proyek: files.length, files } };
}
