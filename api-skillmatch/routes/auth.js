// F1 / US-01 — registrasi & login
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import auth from '../middleware/auth.js';
import { ErrorHttp, tangani } from '../utils/http.js';
import { teks } from '../utils/validasi.js';
import { ambilProfil } from '../services/profil.js';

const router = Router();
const PERAN = ['developer', 'desainer', 'lainnya'];
const buatToken = (id) => jwt.sign({ sub: String(id) }, process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post('/register', tangani(async (req, res) => {
  const { email, password, peran_utama = 'lainnya' } = req.body || {};
  const nama = teks(req.body?.nama, 'nama', { max: 100 });
  if (typeof email !== 'string' || email.length > 100 || !/^\S+@\S+\.\S+$/.test(email))
    throw new ErrorHttp(400, 'Format email tidak valid');
  if (typeof password !== 'string' || password.length < 8 || password.length > 72)
    throw new ErrorHttp(400, 'Password harus 8 sampai 72 karakter');
  if (!PERAN.includes(peran_utama))
    throw new ErrorHttp(400, `peran_utama harus salah satu dari: ${PERAN.join(', ')}`);

  const mail = email.toLowerCase().trim();
  const [ada] = await pool.query('SELECT 1 FROM users WHERE email = ?', [mail]);
  if (ada.length) throw new ErrorHttp(409, 'Email sudah terdaftar');

  const hash = await bcrypt.hash(password, 10);
  const [hasil] = await pool.query(
    'INSERT INTO users (nama, email, password_hash, peran_utama) VALUES (?, ?, ?, ?)',
    [nama, mail, hash, peran_utama]);
  res.status(201).json({ id_users: hasil.insertId, nama, email: mail, peran_utama, token: buatToken(hasil.insertId) });
}));

router.post('/login', tangani(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string')
    throw new ErrorHttp(400, 'email dan password wajib diisi');
  const [rows] = await pool.query('SELECT id_users, password_hash FROM users WHERE email = ?',
    [email.toLowerCase().trim()]);
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash)))
    throw new ErrorHttp(401, 'Email atau password salah');
  res.json({ token: buatToken(rows[0].id_users), user: await ambilProfil(rows[0].id_users, { self: true }) });
}));

router.get('/me', auth, tangani(async (req, res) => {
  res.json(await ambilProfil(req.userId, { self: true }));
}));

// ── Lupa Password & Reset ─────────────────────────────────────────────────────

router.post('/lupa-password', tangani(async (req, res) => {
  const { email } = req.body || {};
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email))
    throw new ErrorHttp(400, 'Format email tidak valid');

  const mail = email.toLowerCase().trim();
  const [rows] = await pool.query('SELECT id_users FROM users WHERE email = ?', [mail]);
  if (!rows.length) throw new ErrorHttp(404, 'Email tidak terdaftar');

  const user = rows[0];
  const kode = String(Math.floor(100000 + Math.random() * 900000));
  const hash = await bcrypt.hash(kode, 10);

  // Hapus kode reset yang belum digunakan untuk user ini
  await pool.query(
    'DELETE FROM reset_password WHERE id_users = ? AND digunakan = 0',
    [user.id_users]);

  await pool.query(
    'INSERT INTO reset_password (id_users, kode, kedaluwarsa) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))',
    [user.id_users, hash]);

  console.log(`[RESET] Kode OTP untuk ${mail}: ${kode}`);

  res.json({
    pesan: 'Kode verifikasi telah dikirim ke email Anda',
    ...(process.env.NODE_ENV !== 'production' && { kode }),
  });
}));

router.post('/verifikasi-kode', tangani(async (req, res) => {
  const { email, kode } = req.body || {};
  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email))
    throw new ErrorHttp(400, 'Format email tidak valid');
  if (typeof kode !== 'string' || !kode.trim())
    throw new ErrorHttp(400, 'Kode wajib diisi');

  const mail = email.toLowerCase().trim();
  const [rows] = await pool.query('SELECT id_users FROM users WHERE email = ?', [mail]);
  if (!rows.length) throw new ErrorHttp(404, 'Email tidak terdaftar');

  const user = rows[0];
  const [resets] = await pool.query(
    'SELECT * FROM reset_password WHERE id_users = ? AND digunakan = 0 AND kedaluwarsa > NOW() ORDER BY id DESC LIMIT 1',
    [user.id_users]);
  if (!resets.length) throw new ErrorHttp(400, 'Kode tidak valid atau sudah kedaluwarsa');

  const cocok = await bcrypt.compare(kode, resets[0].kode);
  if (!cocok) throw new ErrorHttp(400, 'Kode tidak valid atau sudah kedaluwarsa');

  const resetToken = jwt.sign(
    { sub: String(user.id_users), reset: true },
    process.env.JWT_SECRET,
    { expiresIn: '10m' });

  res.json({ pesan: 'Kode valid', token_reset: resetToken });
}));

router.post('/reset-password', tangani(async (req, res) => {
  const { token_reset, password_baru } = req.body || {};
  if (typeof token_reset !== 'string' || !token_reset.trim())
    throw new ErrorHttp(400, 'token_reset wajib diisi');

  let payload;
  try {
    payload = jwt.verify(token_reset, process.env.JWT_SECRET);
  } catch {
    throw new ErrorHttp(401, 'Token reset tidak valid atau sudah kedaluwarsa');
  }
  if (!payload.reset)
    throw new ErrorHttp(401, 'Token reset tidak valid atau sudah kedaluwarsa');

  if (typeof password_baru !== 'string' || password_baru.length < 8 || password_baru.length > 72)
    throw new ErrorHttp(400, 'Password harus 8 sampai 72 karakter');

  const hash = await bcrypt.hash(password_baru, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id_users = ?',
    [hash, payload.sub]);

  // Tandai semua kode reset user sebagai sudah digunakan
  await pool.query('UPDATE reset_password SET digunakan = 1 WHERE id_users = ?',
    [payload.sub]);

  res.json({ pesan: 'Password berhasil direset. Silakan login dengan password baru' });
}));

export default router;
