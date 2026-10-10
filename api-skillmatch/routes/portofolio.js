// F2 / F3 — verifikasi portofolio otomatis (GitHub API & Figma API) -> tabel PROFIL_PORTOFOLIO
import crypto from 'node:crypto';
import { Router } from 'express';
import { pool, transaksi } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { teks } from '../utils/validasi.js';
import { ambilPortofolio } from '../services/profil.js';
import { ambilGithub, ambilFigma } from '../services/eksternal.js';
import { segarkanVerifikasi } from '../services/verifikasi.js';

const router = Router();
router.use(auth);

// Kode bukti kepemilikan: ditaruh pengguna di Bio GitHub agar tidak bisa mengklaim akun orang lain
const kode = (id) => 'skillmatch-' +
  crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(id)).digest('hex').slice(0, 10);
const wajibBukti = () => String(process.env.GITHUB_REQUIRE_BIO_PROOF).toLowerCase() !== 'false';

async function simpan(idUsers, platform, d) {
  await transaksi(async (conn) => {
    await conn.query('DELETE FROM profil_portofolio WHERE id_users = ? AND platform = ?', [idUsers, platform]);
    await conn.query(
      `INSERT INTO profil_portofolio (id_users, platform, username, external_id, ringkasan)
       VALUES (?, ?, ?, ?, ?)`, [idUsers, platform, d.username, d.external_id, JSON.stringify(d.ringkasan)]);
    await segarkanVerifikasi(idUsers, conn);
  });
}
async function hapus(idUsers, platform) {
  const [h] = await pool.query('DELETE FROM profil_portofolio WHERE id_users = ? AND platform = ?', [idUsers, platform]);
  if (h.affectedRows === 0) throw new ErrorHttp(404, `${platform} belum terhubung`);
  await segarkanVerifikasi(idUsers);
}

router.get('/', tangani(async (req, res) => res.json(await ambilPortofolio(req.userId))));

// ----- GitHub -----
router.get('/github/challenge', tangani(async (req, res) => res.json({
  wajib: wajibBukti(), kode: kode(req.userId),
  petunjuk: 'Tempel kode ini pada Bio profil GitHub Anda, lalu panggil POST /portofolio/github. Kode boleh dihapus setelah terhubung.',
})));

router.get('/github', tangani(async (req, res) => {
  const { github } = await ambilPortofolio(req.userId);
  if (!github) throw new ErrorHttp(404, 'GitHub belum terhubung');
  res.json(github); // US-07: ringkasan repo & commit
}));

router.post('/github', tangani(async (req, res) => {
  const username = teks(req.body?.username, 'username', { max: 39 });
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(username)) throw new ErrorHttp(400, 'Username GitHub tidak valid');
  const d = await ambilGithub(username);
  if (wajibBukti() && !d.bio.includes(kode(req.userId)))
    throw new ErrorHttp(403, 'Kode verifikasi tidak ditemukan di bio GitHub. Ambil kode di GET /portofolio/github/challenge');
  const [dipakai] = await pool.query(
    "SELECT id_users FROM profil_portofolio WHERE platform = 'github' AND username = ?", [d.username]);
  if (dipakai.length && dipakai[0].id_users !== req.userId)
    throw new ErrorHttp(409, 'Akun GitHub ini sudah terhubung ke pengguna lain');
  await simpan(req.userId, 'github', d);
  res.status(201).json((await ambilPortofolio(req.userId)).github);
}));

router.post('/github/sinkron', tangani(async (req, res) => {
  const [cur] = await pool.query(
    "SELECT username FROM profil_portofolio WHERE platform = 'github' AND id_users = ?", [req.userId]);
  if (!cur.length) throw new ErrorHttp(404, 'GitHub belum terhubung');
  await simpan(req.userId, 'github', await ambilGithub(cur[0].username));
  res.json((await ambilPortofolio(req.userId)).github);
}));

router.delete('/github', tangani(async (req, res) => { await hapus(req.userId, 'github'); res.status(204).end(); }));

// ----- Figma -----  body: { "token": "<personal access token>", "file_keys": ["abc123"] }
router.get('/figma', tangani(async (req, res) => {
  const { figma } = await ambilPortofolio(req.userId);
  if (!figma) throw new ErrorHttp(404, 'Figma belum terhubung');
  res.json(figma);
}));

router.post('/figma', tangani(async (req, res) => {
  const token = teks(req.body?.token, 'token', { max: 200 });
  const keys = req.body?.file_keys ?? [];
  if (!Array.isArray(keys) || keys.length > 10) throw new ErrorHttp(400, 'file_keys harus array (maksimal 10)');
  const d = await ambilFigma(token, keys.map((k) => teks(k, 'file_key', { max: 100 })));
  if (keys.length && !d.ringkasan.files.length)
    throw new ErrorHttp(422, 'Tidak ada file Figma yang dapat diakses dengan token tersebut');
  await simpan(req.userId, 'figma', d);
  res.status(201).json((await ambilPortofolio(req.userId)).figma);
}));

router.delete('/figma', tangani(async (req, res) => { await hapus(req.userId, 'figma'); res.status(204).end(); }));

export default router;
