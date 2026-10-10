import { Router } from 'express';
import { pool } from '../db.js';
import { tangani } from '../utils/http.js';

const router = Router();

// GET /skills?kategori=desain  -> array langsung (untuk pilihan tag skill di aplikasi)
router.get('/', tangani(async (req, res) => {
  const { kategori } = req.query;
  const [rows] = kategori
    ? await pool.query('SELECT id, nama, kategori FROM skills WHERE kategori = ? ORDER BY nama', [kategori])
    : await pool.query('SELECT id, nama, kategori FROM skills ORDER BY kategori, nama');
  res.json(rows);
}));

// Agregasi (COUNT & SUM + JOIN): skill terpopuler dan berapa yang sudah terverifikasi
router.get('/statistik', tangani(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.id, s.nama, s.kategori,
            COUNT(us.id_users) AS jumlah_pengguna,
            SUM(us.status_verifikasi = 'terverifikasi') AS jumlah_terverifikasi
     FROM skills s LEFT JOIN users_skills us ON us.skill_id = s.id
     GROUP BY s.id, s.nama, s.kategori
     ORDER BY jumlah_pengguna DESC, s.nama`);
  res.json(rows.map((r) => ({
    ...r, jumlah_pengguna: Number(r.jumlah_pengguna), jumlah_terverifikasi: Number(r.jumlah_terverifikasi || 0),
  })));
}));

export default router;
