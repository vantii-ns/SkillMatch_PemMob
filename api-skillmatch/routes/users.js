// F1 (profil & tag skill) dan F4 / US-04 (pencarian & filter kandidat)
import { Router } from 'express';
import { pool, transaksi } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { idValid, teks, angkaQuery, jsonAman } from '../utils/validasi.js';
import { ambilProfil } from '../services/profil.js';
import { segarkanVerifikasi } from '../services/verifikasi.js';
import { notifikasiKandidatCocok } from '../services/notifikasi.js';

const router = Router();
router.use(auth);

router.get('/me', tangani(async (req, res) => {
  res.json(await ambilProfil(req.userId, { self: true }));
}));

router.put('/me', tangani(async (req, res) => {
  const b = req.body || {};
  const [cur] = await pool.query('SELECT * FROM users WHERE id_users = ?', [req.userId]);
  const nama = b.nama !== undefined ? teks(b.nama, 'nama') : cur[0].nama;
  const bio = b.bio !== undefined ? teks(b.bio, 'bio', { wajib: false, max: 500 }) ?? '' : cur[0].bio;
  const peran = b.peran_utama ?? cur[0].peran_utama;
  if (!['developer', 'desainer', 'lainnya'].includes(peran)) throw new ErrorHttp(400, 'peran_utama tidak valid');
  const sedia = b.ketersediaan !== undefined ? (b.ketersediaan ? 1 : 0) : cur[0].ketersediaan;
  await pool.query('UPDATE users SET nama = ?, bio = ?, peran_utama = ?, ketersediaan = ? WHERE id_users = ?',
    [nama, bio, peran, sedia, req.userId]);
  res.json(await ambilProfil(req.userId, { self: true }));
}));

// Mengganti seluruh tag skill: { "skill_ids": [1, 16, 14] }
router.put('/me/skills', tangani(async (req, res) => {
  const ids = req.body?.skill_ids;
  if (!Array.isArray(ids) || ids.length > 30) throw new ErrorHttp(400, 'skill_ids harus array (maksimal 30)');
  const unik = [...new Set(ids.map((i) => idValid(i, 'skill_id')))];
  if (unik.length) {
    const [ada] = await pool.query('SELECT id FROM skills WHERE id IN (?)', [unik]);
    if (ada.length !== unik.length) throw new ErrorHttp(400, 'Terdapat skill_id yang tidak ada');
  }
  await transaksi(async (conn) => {
    await conn.query('DELETE FROM users_skills WHERE id_users = ?', [req.userId]);
    if (unik.length) await conn.query('INSERT INTO users_skills (id_users, skill_id) VALUES ?',
      [unik.map((s) => [req.userId, s])]);
  });
  await segarkanVerifikasi(req.userId);
  await notifikasiKandidatCocok(req.userId);
  const profil = await ambilProfil(req.userId, { self: true });
  res.json(profil.skills);
}));

// GET /users/search?skill=JavaScript,Figma&peran=developer&tersedia=true&verified=true&q=andi&page=1&limit=20
// Respons: array langsung; total baris ada di header X-Total-Count
router.get('/search', tangani(async (req, res) => {
  const { skill, peran, tersedia, verified, q } = req.query;
  const page = angkaQuery(req.query.page, 1, 1, 100000);
  const limit = angkaQuery(req.query.limit, 20, 1, 50);

  const where = ['u.id_users <> ?']; const p = [req.userId];
  if (peran) {
    if (!['developer', 'desainer', 'lainnya'].includes(peran)) throw new ErrorHttp(400, 'peran tidak valid');
    where.push('u.peran_utama = ?'); p.push(peran);
  }
  if (tersedia === 'true') where.push('u.ketersediaan = 1');
  if (q) { where.push('(u.nama LIKE ? OR u.bio LIKE ?)'); p.push(`%${q}%`, `%${q}%`); }
  const nama = String(skill || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (nama.length) {
    where.push(`EXISTS (SELECT 1 FROM users_skills us JOIN skills s ON s.id = us.skill_id
                WHERE us.id_users = u.id_users AND s.nama IN (?)
                ${verified === 'true' ? "AND us.status_verifikasi = 'terverifikasi'" : ''})`);
    p.push(nama);
  }
  const dari = `FROM users u
    LEFT JOIN profil_portofolio g ON g.id_users = u.id_users AND g.platform = 'github'
    LEFT JOIN profil_portofolio f ON f.id_users = u.id_users AND f.platform = 'figma'
    WHERE ${where.join(' AND ')}`;

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${dari}`, p);
  const [rows] = await pool.query(
    `SELECT u.id_users, u.nama, u.peran_utama, u.bio, u.ketersediaan,
            g.username AS github_username, g.ringkasan AS github_ringkasan,
            f.username AS figma_username, f.ringkasan AS figma_ringkasan,
            (SELECT COUNT(*) FROM users_skills x
              WHERE x.id_users = u.id_users AND x.status_verifikasi = 'terverifikasi') AS skill_terverifikasi
     ${dari} ORDER BY skill_terverifikasi DESC, u.nama LIMIT ? OFFSET ?`,
    [...p, limit, (page - 1) * limit]);

  const peta = new Map(rows.map((r) => [r.id_users, []]));
  if (rows.length) {
    const [sk] = await pool.query(
      `SELECT us.id_users, s.id, s.nama, s.kategori, us.status_verifikasi
       FROM users_skills us JOIN skills s ON s.id = us.skill_id
       WHERE us.id_users IN (?) ORDER BY us.status_verifikasi DESC, s.nama`, [rows.map((r) => r.id_users)]);
    for (const s of sk) { const { id_users, ...isi } = s; peta.get(id_users).push(isi); }
  }
  res.set('X-Total-Count', String(total));
  res.json(rows.map((r) => {
    const gh = jsonAman(r.github_ringkasan, {}); const fg = jsonAman(r.figma_ringkasan, {});
    return {
      id_users: r.id_users, nama: r.nama, peran_utama: r.peran_utama, bio: r.bio,
      ketersediaan: !!r.ketersediaan, skill_terverifikasi: Number(r.skill_terverifikasi),
      github_username: r.github_username, jumlah_repo: gh.jumlah_repo ?? null, jumlah_commit: gh.jumlah_commit ?? null,
      figma_username: r.figma_username, jumlah_proyek_figma: fg.jumlah_proyek ?? null,
      skills: peta.get(r.id_users),
    };
  }));
}));

// Profil kandidat (publik: tanpa email)
router.get('/:id', tangani(async (req, res) => {
  const profil = await ambilProfil(idValid(req.params.id));
  if (!profil) throw new ErrorHttp(404, 'Pengguna tidak ditemukan');
  res.json(profil);
}));

export default router;
