// db.js — connection pool MySQL (Modul 2A Langkah 11)
import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// Uji koneksi saat server dinyalakan
try {
  const conn = await pool.getConnection();
  console.log('Terhubung ke basis data');
  conn.release();
} catch (e) {
  console.error('Gagal terhubung ke basis data:', e.message);
}

// Menjalankan beberapa kueri sebagai satu transaksi (semua berhasil atau semua dibatalkan)
export async function transaksi(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const hasil = await fn(conn);
    await conn.commit();
    return hasil;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
