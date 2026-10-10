import { pool } from '../db.js';
import { jsonAman } from '../utils/validasi.js';

export async function buatNotifikasi(idUsers, jenis, isi, data = null, db = pool) {
  await db.query('INSERT INTO notifikasi (id_users, jenis, isi, data) VALUES (?, ?, ?, ?)',
    [idUsers, jenis, isi.slice(0, 255), data ? JSON.stringify(data) : null]);
}

// US-10: beri tahu ketua tim bila ada pengguna dengan skill yang dibutuhkan timnya
export async function notifikasiKandidatCocok(idUsers) {
  const [u] = await pool.query('SELECT nama, ketersediaan FROM users WHERE id_users = ?', [idUsers]);
  if (!u.length || !u[0].ketersediaan) return;
  const [sk] = await pool.query(
    'SELECT s.nama FROM users_skills us JOIN skills s ON s.id = us.skill_id WHERE us.id_users = ?', [idUsers]);
  const milik = sk.map((s) => s.nama.toLowerCase());
  if (!milik.length) return;
  const [tims] = await pool.query(
    'SELECT id_tim, id_users, nama_tim, kebutuhan_skill FROM tim WHERE id_users <> ?', [idUsers]);
  for (const t of tims) {
    const cocok = jsonAman(t.kebutuhan_skill, []).filter((n) => milik.includes(String(n).toLowerCase()));
    if (!cocok.length) continue;
    const data = JSON.stringify({ id_tim: t.id_tim, id_kandidat: idUsers });
    const [dup] = await pool.query(
      "SELECT 1 FROM notifikasi WHERE id_users = ? AND jenis = 'kandidat_cocok' AND data = ?", [t.id_users, data]);
    if (dup.length) continue;
    await buatNotifikasi(t.id_users, 'kandidat_cocok',
      `${u[0].nama} cocok dengan kebutuhan tim "${t.nama_tim}" (${cocok.join(', ')})`,
      { id_tim: t.id_tim, id_kandidat: idUsers });
  }
}
