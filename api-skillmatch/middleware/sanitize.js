// middleware/sanitize.js — Sanitasi request body untuk keamanan tambahan
// Membuang field yang mengandung karakter null-byte yang bisa menipu parser

/**
 * Secara rekursif membersihkan string dari null-byte (0x00).
 * Null-byte dapat menipu beberapa parser dan menyebabkan perilaku tak terduga.
 */
function bersihkanNilai(val) {
  if (typeof val === 'string') return val.replace(/\0/g, '');
  if (Array.isArray(val)) return val.map(bersihkanNilai);
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(
      Object.entries(val).map(([k, v]) => [k.replace(/\0/g, ''), bersihkanNilai(v)])
    );
  }
  return val;
}

/**
 * Middleware: bersihkan body dari null-byte injection.
 * Dipasang setelah express.json() di app.js.
 */
export default function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = bersihkanNilai(req.body);
  }
  next();
}
