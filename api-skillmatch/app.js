// app.js — middleware & pendaftaran route (Modul 2A Langkah 16)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import skillsRoutes from './routes/skills.js';
import portofolioRoutes from './routes/portofolio.js';
import timRoutes from './routes/tim.js';
import undanganRoutes from './routes/undangan.js';
import notifikasiRoutes from './routes/notifikasi.js';

const app = express();
app.use(helmet());
app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
app.use(express.json({ limit: '100kb' }));

if (process.env.NODE_ENV !== 'test') {
  const batas = (limit) => rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: true, legacyHeaders: false,
    message: { pesan: 'Terlalu banyak permintaan, coba lagi nanti' } });
  app.use(batas(600));
  app.use('/auth', batas(30));
}

app.get('/', (req, res) => res.send('API SkillMatch berjalan'));
app.use('/auth', authRoutes);               // M1
app.use('/users', usersRoutes);             // M1 (profil, skill, pencarian)
app.use('/skills', skillsRoutes);           // M1
app.use('/notifikasi', notifikasiRoutes);   // M1 (US-10)
app.use('/portofolio', portofolioRoutes);   // M2 (GitHub & Figma)
app.use('/tim', timRoutes);                 // M3 (tim, anggota, diskusi)
app.use('/undangan', undanganRoutes);       // M3

app.use((req, res) => res.status(404).json({ pesan: 'Endpoint tidak ditemukan' }));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.parse.failed') return res.status(400).json({ pesan: 'Body bukan JSON yang valid' });
  console.error(err);
  res.status(500).json({ pesan: 'Terjadi kesalahan pada server' });
});

export default app;
