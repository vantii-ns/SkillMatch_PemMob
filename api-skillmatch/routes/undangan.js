// M3 — tim, anggota, undangan keluar (US-05), ruang diskusi (US-09)
import { Router } from 'express';
import { pool, transaksi } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { idValid, teks, daftarTeks, angkaQuery, jsonAman } from '../utils/validasi.js';
import { buatNotifikasi } from '../services/notifikasi.js';

const router = Router();
router.use(auth);

async function ambilTim(idTim) {
  const [r] = await pool.query('SELECT * FROM tim WHERE id_tim = ?', [idTim]);
  if (!r.length) throw new ErrorHttp(404, 'Tim tidak ditemukan');
  return r[0];
}
async function wajibAnggota(idTim, idUsers) {
  const tim = await ambilTim(idTim);
  const [a] = await pool.query('SELECT 1 FROM anggota_tim WHERE id_tim = ? AND id_users = ?', [idTim, idUsers]);
  if (!a.length) throw new ErrorHttp(403, 'Anda bukan anggota tim ini');
  return tim;
}
async function wajibKetua(idTim, idUsers) {
  const tim = await ambilTim(idTim);
  if (tim.id_users !== idUsers) throw new ErrorHttp(403, 'Hanya ketua tim yang dapat melakukan ini');
  return tim;
}
const format = (t) => ({ ...t, kebutuhan_skill: jsonAman(t.kebutuhan_skill, []) });

router.post('/', tangani(async (req, res) => {
  const nama = teks(req.body?.nama_tim, 'nama_tim');
  const deskripsi = teks(req.body?.deskripsi, 'deskripsi', { wajib: false, max: 500 }) ?? '';
  const kebutuhan = daftarTeks(req.body?.kebutuhan_skill, 'kebutuhan_skill');
  const id = await transaksi(async (conn) => {
    const [h] = await conn.query(
      'INSERT INTO tim (id_users, nama_tim, deskripsi, kebutuhan_skill) VALUES (?, ?, ?, ?)',
      [req.userId, nama, deskripsi, JSON.stringify(kebutuhan)]);
    await conn.query("INSERT INTO anggota_tim (id_tim, id_users, peran) VALUES (?, ?, 'Ketua')", [h.insertId, req.userId]);
    return h.insertId;
  });
  res.status(201).json({ id_tim: id, nama_tim: nama });
}));

// Tim yang saya ikuti (JOIN + agregasi COUNT jumlah anggota)
router.get('/', tangani(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, a.peran AS peran_saya,
            (SELECT COUNT(*) FROM anggota_tim x WHERE x.id_tim = t.id_tim) AS jumlah_anggota
     FROM tim t JOIN anggota_tim a ON a.id_tim = t.id_tim
     WHERE a.id_users = ? ORDER BY t.id_tim DESC`, [req.userId]);
  res.json(rows.map((r) => ({ ...format(r), jumlah_anggota: Number(r.jumlah_anggota) })));
}));

router.get('/:id', tangani(async (req, res) => {
  const tim = await wajibAnggota(idValid(req.params.id), req.userId);
  const [anggota] = await pool.query(
    `SELECT a.id_users, u.nama, u.peran_utama, a.peran, a.status_anggota, a.tanggal_gabung
     FROM anggota_tim a JOIN users u ON u.id_users = a.id_users
     WHERE a.id_tim = ? ORDER BY a.id_anggota`, [tim.id_tim]);
  let undangan;
  if (tim.id_users === req.userId) {
    [undangan] = await pool.query(
      `SELECT d.id_undangan, d.id_users, u.nama, d.peran_ditawarkan, d.status, d.tanggal_undangan
       FROM undangan d JOIN users u ON u.id_users = d.id_users
       WHERE d.id_tim = ? ORDER BY d.id_undangan DESC`, [tim.id_tim]);
  }
  res.json({ ...format(tim), anggota, undangan });
}));

router.put('/:id', tangani(async (req, res) => {
  const tim = await wajibKetua(idValid(req.params.id), req.userId);
  const b = req.body || {};
  const nama = b.nama_tim !== undefined ? teks(b.nama_tim, 'nama_tim') : tim.nama_tim;
  const desk = b.deskripsi !== undefined ? teks(b.deskripsi, 'deskripsi', { wajib: false, max: 500 }) ?? '' : tim.deskripsi;
  const keb = b.kebutuhan_skill !== undefined ? JSON.stringify(daftarTeks(b.kebutuhan_skill, 'kebutuhan_skill')) : tim.kebutuhan_skill;
  await pool.query('UPDATE tim SET nama_tim = ?, deskripsi = ?, kebutuhan_skill = ? WHERE id_tim = ?',
    [nama, desk, keb, tim.id_tim]);
  res.json(format(await ambilTim(tim.id_tim)));
}));

router.delete('/:id', tangani(async (req, res) => {
  await wajibKetua(idValid(req.params.id), req.userId);
  await pool.query('DELETE FROM tim WHERE id_tim = ?', [req.params.id]);
  res.status(204).end();
}));

// US-05: kirim undangan  body: { "id_users": 2, "peran_ditawarkan": "UI Designer" }
router.post('/:id/undangan', tangani(async (req, res) => {
  const tim = await wajibKetua(idValid(req.params.id), req.userId);
  const target = idValid(req.body?.id_users, 'id_users');
  const peran = teks(req.body?.peran_ditawarkan ?? 'Anggota', 'peran_ditawarkan', { max: 50 });
  const [u] = await pool.query('SELECT 1 FROM users WHERE id_users = ?', [target]);
  if (!u.length) throw new ErrorHttp(404, 'Pengguna yang diundang tidak ditemukan');
  const [a] = await pool.query('SELECT 1 FROM anggota_tim WHERE id_tim = ? AND id_users = ?', [tim.id_tim, target]);
  if (a.length) throw new ErrorHttp(409, 'Pengguna sudah menjadi anggota tim');
  const [p] = await pool.query(
    "SELECT 1 FROM undangan WHERE id_tim = ? AND id_users = ? AND status = 'menunggu'", [tim.id_tim, target]);
  if (p.length) throw new ErrorHttp(409, 'Undangan untuk pengguna ini masih menunggu respons');
  const [h] = await pool.query(
    'INSERT INTO undangan (id_tim, id_users, id_pengirim, peran_ditawarkan) VALUES (?, ?, ?, ?)',
    [tim.id_tim, target, req.userId, peran]);
  await buatNotifikasi(target, 'undangan_tim',
    `Anda diundang bergabung ke tim "${tim.nama_tim}" sebagai ${peran}`, { id_undangan: h.insertId, id_tim: tim.id_tim });
  res.status(201).json({ id_undangan: h.insertId, status: 'menunggu' });
}));

// Penetapan peran anggota (ketua)  body: { "peran": "Backend Developer" }
router.put('/:id/anggota/:id_users', tangani(async (req, res) => {
  const tim = await wajibKetua(idValid(req.params.id), req.userId);
  const peran = teks(req.body?.peran, 'peran', { max: 50 });
  const [h] = await pool.query('UPDATE anggota_tim SET peran = ? WHERE id_tim = ? AND id_users = ?',
    [peran, tim.id_tim, idValid(req.params.id_users, 'id_users')]);
  if (h.affectedRows === 0) throw new ErrorHttp(404, 'Anggota tidak ditemukan');
  res.json({ id_users: Number(req.params.id_users), peran });
}));

// Keluarkan anggota (ketua) atau keluar sendiri (anggota)
router.delete('/:id/anggota/:id_users', tangani(async (req, res) => {
  const tim = await wajibAnggota(idValid(req.params.id), req.userId);
  const target = idValid(req.params.id_users, 'id_users');
  if (target !== req.userId && tim.id_users !== req.userId) throw new ErrorHttp(403, 'Tidak diizinkan');
  if (target === tim.id_users) throw new ErrorHttp(400, 'Ketua tidak dapat keluar. Hapus tim jika ingin membubarkan');
  const [h] = await pool.query('DELETE FROM anggota_tim WHERE id_tim = ? AND id_users = ?', [tim.id_tim, target]);
  if (h.affectedRows === 0) throw new ErrorHttp(404, 'Anggota tidak ditemukan');
  res.status(204).end();
}));

// US-09: diskusi. GET /tim/:id/diskusi?setelah_id=12&limit=50 (polling pesan baru) -> array urut lama ke baru
router.get('/:id/diskusi', tangani(async (req, res) => {
  const tim = await wajibAnggota(idValid(req.params.id), req.userId);
  const limit = angkaQuery(req.query.limit, 50, 1, 200);
  const kolom = `d.id_diskusi, d.id_users, u.nama, d.isi_pesan, d.waktu_pesan`;
  const dari = 'FROM diskusi d JOIN users u ON u.id_users = d.id_users';
  let rows;
  if (req.query.setelah_id !== undefined) {
    [rows] = await pool.query(
      `SELECT ${kolom} ${dari} WHERE d.id_tim = ? AND d.id_diskusi > ? ORDER BY d.id_diskusi ASC LIMIT ?`,
      [tim.id_tim, angkaQuery(req.query.setelah_id, 0, 0, 2147483647), limit]);
  } else {
    [rows] = await pool.query(
      `SELECT * FROM (SELECT ${kolom} ${dari} WHERE d.id_tim = ? ORDER BY d.id_diskusi DESC LIMIT ?) t
       ORDER BY id_diskusi ASC`, [tim.id_tim, limit]);
  }
  res.json(rows);
}));

router.post('/:id/diskusi', tangani(async (req, res) => {
  const tim = await wajibAnggota(idValid(req.params.id), req.userId);
  const isi = teks(req.body?.isi_pesan, 'isi_pesan', { max: 2000 });
  const [h] = await pool.query('INSERT INTO diskusi (id_tim, id_users, isi_pesan) VALUES (?, ?, ?)',
    [tim.id_tim, req.userId, isi]);
  res.status(201).json({ id_diskusi: h.insertId, id_users: req.userId, isi_pesan: isi });
}));

export default router;
