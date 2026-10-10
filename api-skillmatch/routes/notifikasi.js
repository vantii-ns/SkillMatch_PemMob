// US-10 — notifikasi (undangan masuk, respons undangan, kandidat cocok)
import { Router } from 'express';
import { pool } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { idValid, jsonAman } from '../utils/validasi.js';

const router = Router();
router.use(auth);

// GET /notifikasi?belum_dibaca=true -> array; jumlah belum dibaca di header X-Belum-Dibaca
router.get('/', tangani(async (req, res) => {
  const saring = req.query.belum_dibaca === 'true' ? ' AND status_dibaca = 0' : '';
  const [rows] = await pool.query(
    `SELECT id_notifikasi, jenis, isi, data, status_dibaca, waktu FROM notifikasi
     WHERE id_users = ?${saring} ORDER BY id_notifikasi DESC LIMIT 100`, [req.userId]);
  const [[{ n }]] = await pool.query(
    'SELECT COUNT(*) AS n FROM notifikasi WHERE id_users = ? AND status_dibaca = 0', [req.userId]);
  res.set('X-Belum-Dibaca', String(n)).set('Access-Control-Expose-Headers', 'X-Belum-Dibaca, X-Total-Count');
  res.json(rows.map((r) => ({ ...r, status_dibaca: !!r.status_dibaca, data: jsonAman(r.data) })));
}));

router.put('/baca-semua', tangani(async (req, res) => {
  const [h] = await pool.query('UPDATE notifikasi SET status_dibaca = 1 WHERE id_users = ?', [req.userId]);
  res.json({ diperbarui: h.affectedRows });
}));

router.put('/:id/baca', tangani(async (req, res) => {
  const [h] = await pool.query(
    'UPDATE notifikasi SET status_dibaca = 1 WHERE id_notifikasi = ? AND id_users = ?',
    [idValid(req.params.id), req.userId]);
  if (h.affectedRows === 0) throw new ErrorHttp(404, 'Notifikasi tidak ditemukan');
  res.json({ id_notifikasi: Number(req.params.id), status_dibaca: true });
}));

export default router;
