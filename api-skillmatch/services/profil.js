import { pool } from '../db.js';
import { jsonAman } from '../utils/validasi.js';

export const formatGithub = (r) => r && ({
  username: r.username, url: `https://github.com/${r.username}`,
  ...jsonAman(r.ringkasan, {}), diperbarui_pada: r.diperbarui_pada,
});
export const formatFigma = (r) => r && ({
  username_figma: r.username, ...jsonAman(r.ringkasan, {}), diperbarui_pada: r.diperbarui_pada,
});

export async function ambilPortofolio(idUsers) {
  const [rows] = await pool.query('SELECT * FROM profil_portofolio WHERE id_users = ?', [idUsers]);
  return {
    github: formatGithub(rows.find((r) => r.platform === 'github')) || null,
    figma: formatFigma(rows.find((r) => r.platform === 'figma')) || null,
  };
}

// Profil lengkap: users + skills (USERS_SKILLS JOIN SKILLS) + portofolio
export async function ambilProfil(idUsers, { self = false } = {}) {
  const [u] = await pool.query(
    `SELECT id_users, nama, email, peran_utama, bio, ketersediaan, dibuat_pada
     FROM users WHERE id_users = ?`, [idUsers]);
  if (u.length === 0) return null;
  const { email, ...publik } = u[0];
  const [skills] = await pool.query(
    `SELECT s.id, s.nama, s.kategori, us.status_verifikasi
     FROM users_skills us JOIN skills s ON s.id = us.skill_id
     WHERE us.id_users = ? ORDER BY us.status_verifikasi DESC, s.nama`, [idUsers]);
  return {
    ...(self ? u[0] : publik),
    ketersediaan: !!u[0].ketersediaan,
    skills,
    ...(await ambilPortofolio(idUsers)),
  };
}
