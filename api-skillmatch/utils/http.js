// Penanganan error seragam: setiap handler dibungkus try/catch lewat tangani().
// Kontrak respons gagal (Modul 2C): { "pesan": "..." } dengan status 400/401/403/404/409/500.
export class ErrorHttp extends Error {
  constructor(status, pesan) { super(pesan); this.status = status; }
}

export const tangani = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (e) {
    if (e instanceof ErrorHttp) return res.status(e.status).json({ pesan: e.message });
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ pesan: 'Data sudah ada' });
    if (e.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ pesan: 'Data rujukan tidak ada' });
    // Security: di production, sembunyikan detail error internal
    if (process.env.NODE_ENV === 'production') {
      console.error(`[${req?.requestId || '-'}] Internal error: ${e.message}`);
    } else {
      console.error(e);
    }
    res.status(500).json({ pesan: 'Operasi database gagal' });
  }
};

