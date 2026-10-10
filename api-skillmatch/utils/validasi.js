import { ErrorHttp } from './http.js';

export function idValid(nilai, nama = 'id') {
  const n = Number(nilai);
  if (!Number.isInteger(n) || n < 1 || n > 2147483647) throw new ErrorHttp(400, `${nama} tidak valid`);
  return n;
}

// Teks wajib/opsional, di-trim, dengan batas panjang
export function teks(nilai, nama, { min = 1, max = 100, wajib = true } = {}) {
  if (nilai === undefined || nilai === null) {
    if (wajib) throw new ErrorHttp(400, `${nama} wajib diisi`);
    return null;
  }
  if (typeof nilai !== 'string') throw new ErrorHttp(400, `${nama} harus berupa teks`);
  const t = nilai.trim();
  if (wajib && t.length < min) throw new ErrorHttp(400, `${nama} wajib diisi`);
  if (t.length > max) throw new ErrorHttp(400, `${nama} maksimal ${max} karakter`);
  return t;
}

export function daftarTeks(nilai, nama, { maks = 20, panjang = 50 } = {}) {
  if (nilai === undefined || nilai === null) return [];
  if (!Array.isArray(nilai)) throw new ErrorHttp(400, `${nama} harus berupa array`);
  if (nilai.length > maks) throw new ErrorHttp(400, `${nama} maksimal ${maks} item`);
  return [...new Set(nilai.map((x) => teks(x, nama, { max: panjang })))];
}

export function angkaQuery(nilai, bawaan, min, maks) {
  const n = parseInt(nilai, 10);
  if (Number.isNaN(n)) return bawaan;
  return Math.min(Math.max(n, min), maks);
}

export const jsonAman = (v, bawaan = null) => {
  if (v === null || v === undefined) return bawaan;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return bawaan; }
};
