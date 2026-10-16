// server.js — hanya menyalakan server
import 'dotenv/config';
import app from './app.js';

// ── Security: Validasi env variable penting sebelum server dijalankan ─────────
const ENV_WAJIB = {
  JWT_SECRET: { min: 32, pesan: 'JWT_SECRET harus minimal 32 karakter acak' },
  DB_HOST:    { pesan: 'DB_HOST belum diatur' },
  DB_USER:    { pesan: 'DB_USER belum diatur' },
  DB_NAME:    { pesan: 'DB_NAME belum diatur' },
};
const PLACEHOLDER = ['isi-dengan-teks-acak-panjang', 'secret', 'password', 'changeme', '123456'];

let adaError = false;
for (const [key, rule] of Object.entries(ENV_WAJIB)) {
  const val = process.env[key];
  if (!val) { console.error(`[ENV] ${rule.pesan || `${key} belum diatur di .env`}`); adaError = true; continue; }
  if (PLACEHOLDER.includes(val.toLowerCase())) { console.error(`[ENV] ${key} masih menggunakan placeholder — ganti dengan nilai acak`); adaError = true; }
  if (rule.min && val.length < rule.min) { console.error(`[ENV] ${rule.pesan}`); adaError = true; }
}
if (!process.env.DB_PASSWORD) {
  console.warn('[ENV] PERINGATAN: DB_PASSWORD kosong. Gunakan password database yang kuat di production.');
}
if (adaError) { console.error('[ENV] Server tidak dijalankan karena konfigurasi tidak lengkap.'); process.exit(1); }

const PORT = process.env.PORT || 3000;
// 0.0.0.0 agar dapat diakses dari ponsel di Wi-Fi yang sama (Modul 2C Langkah 6)
// Di production, pertimbangkan untuk bind ke IP spesifik atau gunakan reverse proxy (nginx/caddy)
app.listen(PORT, '0.0.0.0', () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`Server berjalan di http://localhost:${PORT} [${mode}]`);
});
