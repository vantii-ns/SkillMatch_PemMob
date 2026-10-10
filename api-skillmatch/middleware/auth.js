import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { ErrorHttp, tangani } from '../utils/http.js';

// Memeriksa header Authorization: Bearer <token>; mengisi req.userId
export default tangani(async (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) throw new ErrorHttp(401, 'Token tidak ditemukan. Silakan login');
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET); }
  catch { throw new ErrorHttp(401, 'Token tidak valid atau kedaluwarsa'); }
  const [rows] = await pool.query('SELECT id_users FROM users WHERE id_users = ?', [Number(payload.sub)]);
  if (rows.length === 0) throw new ErrorHttp(401, 'Akun tidak ditemukan');
  req.userId = rows[0].id_users;
  next();
});
