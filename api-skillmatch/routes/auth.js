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

export default router;
