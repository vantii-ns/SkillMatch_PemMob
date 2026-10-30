// US-06 — menerima / menolak undangan tim
import { Router } from 'express';
import { pool, transaksi } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { idValid } from '../utils/validasi.js';
import { buatNotifikasi } from '../services/notifikasi.js';

const router = Router();
router.use(auth);

// GET /undangan?status=menunggu -> undangan masuk (JOIN tim & pengirim)
router.get('/', tangani(async (req, res) => {
  const p = [req.userId]; let saring = '';
  if (req.query.status) {
    if (!['menunggu', 'diterima', 'ditolak'].includes(req.query.status)) throw new ErrorHttp(400, 'status tidak valid');
    saring = ' AND d.status = ?'; p.push(req.query.status);
  }
  const [rows] = await pool.query(
    `SELECT d.id_undangan, d.id_tim, t.nama_tim, t.deskripsi, d.id_pengirim, u.nama AS nama_pengirim,
            d.peran_ditawarkan, d.status, d.tanggal_undangan, d.tanggal_respons
     FROM undangan d JOIN tim t ON t.id_tim = d.id_tim JOIN users u ON u.id_users = d.id_pengirim
     WHERE d.id_users = ?${saring} ORDER BY d.id_undangan DESC`, p);
  res.json(rows);
}));

// PUT /undangan/:id  body: { "status": "diterima" | "ditolak" }
router.put('/:id', tangani(async (req, res) => {
  const id = idValid(req.params.id);
  const status = req.body?.status;
  if (!['diterima', 'ditolak'].includes(status)) throw new ErrorHttp(400, "status harus 'diterima' atau 'ditolak'");

  const info = await transaksi(async (conn) => {
    const [inv] = await conn.query(
      'SELECT * FROM undangan WHERE id_undangan = ? AND id_users = ? FOR UPDATE', [id, req.userId]);
    if (!inv.length) throw new ErrorHttp(404, 'Undangan tidak ditemukan');
    if (inv[0].status !== 'menunggu') throw new ErrorHttp(409, 'Undangan sudah direspons');
    await conn.query('UPDATE undangan SET status = ?, tanggal_respons = NOW() WHERE id_undangan = ?', [status, id]);
    if (status === 'diterima') {
      await conn.query('INSERT IGNORE INTO anggota_tim (id_tim, id_users, peran) VALUES (?, ?, ?)',
        [inv[0].id_tim, req.userId, inv[0].peran_ditawarkan]);
    }
    return inv[0];
  });
  const [[me]] = await pool.query('SELECT nama FROM users WHERE id_users = ?', [req.userId]);
  const [[tim]] = await pool.query('SELECT nama_tim FROM tim WHERE id_tim = ?', [info.id_tim]);
  await buatNotifikasi(info.id_pengirim, 'respons_undangan',
    `${me.nama} ${status === 'diterima' ? 'menerima' : 'menolak'} undangan ke tim "${tim.nama_tim}"`,
    { id_undangan: id, id_tim: info.id_tim, status });
  res.json({ id_undangan: id, status });
}));

export default router;
