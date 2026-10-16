// app.js — middleware & pendaftaran route (Modul 2A Langkah 16)
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sanitizeBody from './middleware/sanitize.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import skillsRoutes from './routes/skills.js';
import portofolioRoutes from './routes/portofolio.js';
import timRoutes from './routes/tim.js';
import undanganRoutes from './routes/undangan.js';
import notifikasiRoutes from './routes/notifikasi.js';

const app = express();

// ── Security: Helmet dioptimalkan untuk REST API ──────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,       // REST API tidak butuh CSP HTML
  crossOriginEmbedderPolicy: false,   // Tidak relevan untuk API
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

// ── Security: CORS Whitelist (hanya izinkan origin yang dikenal) ───────────────
const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',').map((o) => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Izinkan request tanpa origin (curl, Postman, mobile app native)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`Origin '${origin}' tidak diizinkan oleh CORS`));
  },
  exposedHeaders: ['X-Total-Count', 'X-Request-Id'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight 24 jam
}));

// ── Security: Request ID untuk audit trail ────────────────────────────────────
app.use((req, res, next) => {
  const id = crypto.randomUUID();
  req.requestId = id;
  res.set('X-Request-Id', id);
  next();
});

app.use(express.json({ limit: '100kb' }));
app.use(sanitizeBody); // Security: bersihkan null-byte dari body

// ── Security: Rate Limiting bertingkat ───────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  const batas = (limit, windowMs = 15 * 60 * 1000) => rateLimit({
    windowMs, limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
    message: { pesan: 'Terlalu banyak permintaan, coba lagi nanti' },
  });

  app.use(batas(300));                          // Global: 300 req / 15 menit
  app.use('/auth/login', batas(10));            // Login: 10 percobaan / 15 menit (anti brute-force)
  app.use('/auth/register', batas(5));          // Register: 5 req / 15 menit (anti spam akun)
  app.use('/auth', batas(20));                  // Auth lainnya: 20 req / 15 menit
  app.use('/portofolio/github', batas(15));     // GitHub sync: 15 req / 15 menit
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
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ pesan: 'Body bukan JSON yang valid' });
  if (err.message?.startsWith('Origin') && err.message.includes('CORS'))
    return res.status(403).json({ pesan: 'Akses tidak diizinkan dari origin ini' });
  // Di production, jangan bocorkan detail error internal
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${req.requestId}] ${err.message}`);
    return res.status(500).json({ pesan: 'Terjadi kesalahan pada server' });
  }
  console.error(err);
  res.status(500).json({ pesan: 'Terjadi kesalahan pada server' });
});

export default app;
