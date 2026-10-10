import { pool } from '../db.js';
import { jsonAman } from '../utils/validasi.js';

// US-11: skill ditandai "terverifikasi" bila didukung bukti
//  - pemrograman -> bahasa muncul pada repositori GitHub
//  - desain      -> ada minimal 1 file Figma yang berhasil diakses
export async function segarkanVerifikasi(idUsers, db = pool) {
  const [pf] = await db.query('SELECT platform, ringkasan FROM profil_portofolio WHERE id_users = ?', [idUsers]);
  const gh = jsonAman(pf.find((p) => p.platform === 'github')?.ringkasan, null);
  const fg = jsonAman(pf.find((p) => p.platform === 'figma')?.ringkasan, null);
  const bahasa = (gh?.top_languages || []).map((b) => b.toLowerCase());
  const adaFigma = (fg?.jumlah_proyek || 0) > 0;

  const [skills] = await db.query(
    `SELECT s.id, s.nama, s.kategori FROM users_skills us
     JOIN skills s ON s.id = us.skill_id WHERE us.id_users = ?`, [idUsers]);
  const valid = skills.filter((s) =>
    (s.kategori === 'pemrograman' && bahasa.includes(s.nama.toLowerCase())) ||
    (s.kategori === 'desain' && adaFigma)).map((s) => s.id);

  await db.query("UPDATE users_skills SET status_verifikasi = 'belum' WHERE id_users = ?", [idUsers]);
  if (valid.length) {
    await db.query(
      "UPDATE users_skills SET status_verifikasi = 'terverifikasi' WHERE id_users = ? AND skill_id IN (?)",
      [idUsers, valid]);
  }
}
