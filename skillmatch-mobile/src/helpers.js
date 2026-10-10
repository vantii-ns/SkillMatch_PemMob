// src/helpers.js — validasi & format tampilan (pola Lampiran B Modul 2C)
export const PERAN = [
  { id: 'developer', label: 'Developer' },
  { id: 'desainer', label: 'Desainer' },
  { id: 'lainnya', label: 'Lainnya' },
];
export const labelPeran = (id) => PERAN.find((p) => p.id === id)?.label || id;

export function validasiLogin(email, password) {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Format email tidak valid';
  if (!password) return 'Password wajib diisi';
  return '';
}
export function validasiRegister(nama, email, password) {
  if (!nama.trim()) return 'Nama wajib diisi';
  if (nama.trim().length > 100) return 'Nama maksimal 100 karakter';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Format email tidak valid';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (password.length > 72) return 'Password maksimal 72 karakter';
  return '';
}
export function validasiTim(nama) {
  if (!nama.trim()) return 'Nama tim wajib diisi';
  if (nama.trim().length > 100) return 'Nama tim maksimal 100 karakter';
  return '';
}

export function tanggalLokal(value) {
  if (!value) return '-';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/');
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('/');
}
export function waktuSingkat(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const dua = (n) => String(n).padStart(2, '0');
  return `${dua(d.getDate())}/${dua(d.getMonth() + 1)} ${dua(d.getHours())}:${dua(d.getMinutes())}`;
}
