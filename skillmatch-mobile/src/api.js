// src/api.js — service HTTP (pola Lampiran A Modul 2C + token JWT)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

let token = null;
let saatTidakSah = null;
export const setToken = (t) => { token = t; };
export const setSaatTidakSah = (fn) => { saatTidakSah = fn; };

export async function request(path, options = {}) {
  if (!BASE_URL) throw new Error('Isi EXPO_PUBLIC_API_URL di .env');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
      signal: controller.signal,
    });
    if (response.status === 204) return null; // DELETE berhasil: tanpa body
    const raw = await response.text();
    let data;
    try { data = raw ? JSON.parse(raw) : null; }
    catch { throw new Error(`Respons bukan JSON (${response.status})`); }
    if (!response.ok) {
      const error = new Error(data?.pesan || `HTTP ${response.status}`);
      error.status = response.status;
      if (response.status === 401 && token && saatTidakSah) saatTidakSah();
      throw error;
    }
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Waktu tunggu habis. Periksa data sebelum mengulang.');
    }
    if (error.message === 'Network request failed') {
      const e = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      e.jaringan = true;
      throw e;
    }
    throw error;
  } finally { clearTimeout(timer); }
}

const kirim = (metode, body) => ({ method: metode, body: body === undefined ? undefined : JSON.stringify(body) });
const qs = (obj) => {
  const p = Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== false && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  return p.length ? `?${p.join('&')}` : '';
};

export const api = {
  // Auth & profil (M1)
  login: (email, password) => request('/auth/login', kirim('POST', { email, password })),
  register: (body) => request('/auth/register', kirim('POST', body)),
  me: () => request('/auth/me'),
  ubahProfil: (body) => request('/users/me', kirim('PUT', body)),
  setSkills: (skill_ids) => request('/users/me/skills', kirim('PUT', { skill_ids })),
  skills: () => request('/skills'),
  cari: (k) => request(`/users/search${qs({
    q: k.q, peran: k.peran, tersedia: k.tersedia ? 'true' : '', verified: k.verified ? 'true' : '',
    skill: (k.skill || []).join(','), limit: 30,
  })}`),
  kandidat: (id) => request(`/users/${id}`),
  notifikasi: () => request('/notifikasi'),
  bacaNotifikasi: (id) => request(`/notifikasi/${id}/baca`, kirim('PUT')),
  bacaSemua: () => request('/notifikasi/baca-semua', kirim('PUT')),
  // Portofolio (M2)
  portofolio: () => request('/portofolio'),
  githubChallenge: () => request('/portofolio/github/challenge'),
  githubHubungkan: (username) => request('/portofolio/github', kirim('POST', { username })),
  githubSinkron: () => request('/portofolio/github/sinkron', kirim('POST')),
  githubPutus: () => request('/portofolio/github', kirim('DELETE')),
  figmaHubungkan: (token_, file_keys) => request('/portofolio/figma', kirim('POST', { token: token_, file_keys })),
  figmaPutus: () => request('/portofolio/figma', kirim('DELETE')),
  // Tim (M3)
  timSaya: () => request('/tim'),
  timDetail: (id) => request(`/tim/${id}`),
  buatTim: (body) => request('/tim', kirim('POST', body)),
  ubahTim: (id, body) => request(`/tim/${id}`, kirim('PUT', body)),
  hapusTim: (id) => request(`/tim/${id}`, kirim('DELETE')),
  undang: (idTim, body) => request(`/tim/${idTim}/undangan`, kirim('POST', body)),
  ubahPeran: (idTim, idUsers, peran) => request(`/tim/${idTim}/anggota/${idUsers}`, kirim('PUT', { peran })),
  keluarkan: (idTim, idUsers) => request(`/tim/${idTim}/anggota/${idUsers}`, kirim('DELETE')),
  diskusi: (idTim, setelahId) => request(`/tim/${idTim}/diskusi${qs({ setelah_id: setelahId ? setelahId : '' })}`),
  kirimPesan: (idTim, isi_pesan) => request(`/tim/${idTim}/diskusi`, kirim('POST', { isi_pesan })),
  undanganMasuk: () => request('/undangan'),
  responUndangan: (id, status) => request(`/undangan/${id}`, kirim('PUT', { status })),
};
