// server.js — hanya menyalakan server
import 'dotenv/config';
import app from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET belum diatur di .env');
  process.exit(1);
}
const PORT = process.env.PORT || 3000;
// 0.0.0.0 agar dapat diakses dari ponsel di Wi-Fi yang sama (Modul 2C Langkah 6)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
