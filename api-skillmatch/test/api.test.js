// Uji integrasi: jalankan terhadap DATABASE UJI (bukan data utama), mis. DB_NAME=db_skillmatch_test
//   DB_NAME=db_skillmatch_test npm test
process.env.NODE_ENV = 'test';
process.env.GITHUB_REQUIRE_BIO_PROOF = 'false';
process.env.JWT_SECRET ||= 'rahasia-uji';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { pool } from '../db.js';

let base; let server;
test.before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
test.after(async () => { server.close(); await pool.end(); });

const panggil = async (metode, jalur, body, token) => {
  const res = await fetch(base + jalur, {
    method: metode,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const teks = await res.text();
  return { status: res.status, body: teks ? JSON.parse(teks) : null, headers: res.headers };
};
const sfx = Date.now();
const daftar = async (nama, peran) => (await panggil('POST', '/auth/register',
  { nama, email: `${nama.toLowerCase()}${sfx}@uji.com`, password: 'password123', peran_utama: peran })).body;

test('auth: validasi registrasi, duplikat, login, token', async () => {
  assert.equal((await panggil('POST', '/auth/register', { nama: ' ', email: 'x@y.com', password: 'password123' })).status, 400);
  assert.equal((await panggil('POST', '/auth/register', { nama: 'X', email: 'bukan-email', password: 'password123' })).status, 400);
  assert.equal((await panggil('POST', '/auth/register', { nama: 'X', email: 'x@y.com', password: 'pendek' })).status, 400);
  const a = await daftar('Dupa', 'developer');
  assert.ok(a.token && a.id_users);
  assert.equal((await panggil('POST', '/auth/register', { nama: 'Dupa', email: `dupa${sfx}@uji.com`, password: 'password123' })).status, 409);
  assert.equal((await panggil('POST', '/auth/login', { email: `dupa${sfx}@uji.com`, password: 'salahsalah' })).status, 401);
  assert.equal((await panggil('GET', '/users/me')).status, 401);
  const me = await panggil('GET', '/auth/me', undefined, a.token);
  assert.equal(me.status, 200); assert.ok(!('password_hash' in me.body));
});

test('alur lengkap M1-M3: skill, verifikasi, cari, tim, undangan, diskusi', async () => {
  const andi = await daftar('Andiuji', 'developer');
  const bella = await daftar('Bellauji', 'desainer');
  const skills = (await panggil('GET', '/skills')).body;
  assert.ok(Array.isArray(skills) && skills.length >= 25);
  const id = (n) => skills.find((s) => s.nama === n).id;

  // US-01 tag skill; id tidak ada -> 400
  assert.equal((await panggil('PUT', '/users/me/skills', { skill_ids: [99999] }, bella.token)).status, 400);
  assert.equal((await panggil('PUT', '/users/me/skills', { skill_ids: [id('Figma')] }, bella.token)).status, 200);

  // US-11 verifikasi: sisipkan bukti GitHub langsung ke DB (tanpa jaringan)
  await pool.query(`INSERT INTO profil_portofolio (id_users, platform, username, external_id, ringkasan)
    VALUES (?, 'github', ?, '1', ?)`, [andi.id_users, `andi${sfx}`, JSON.stringify({ jumlah_repo: 4, jumlah_commit: 90, top_languages: ['JavaScript'] })]);
  const sk = (await panggil('PUT', '/users/me/skills', { skill_ids: [id('JavaScript'), id('Python')] }, andi.token)).body;
  const st = Object.fromEntries(sk.map((s) => [s.nama, s.status_verifikasi]));
  assert.deepEqual(st, { JavaScript: 'terverifikasi', Python: 'belum' });

  // US-04 pencarian: array langsung + X-Total-Count
  const cari = await panggil('GET', '/users/search?skill=JavaScript&verified=true', undefined, bella.token);
  assert.equal(cari.status, 200); assert.ok(Array.isArray(cari.body));
  const kandidat = cari.body.find((k) => k.id_users === andi.id_users);
  assert.equal(kandidat.jumlah_commit, 90); assert.ok(Number(cari.headers.get('x-total-count')) >= 1);
  assert.equal((await panggil('GET', '/users/search?peran=ngawur', undefined, bella.token)).status, 400);
  assert.equal((await panggil('GET', `/users/${andi.id_users}`, undefined, bella.token)).body.github.jumlah_repo, 4);
  assert.equal((await panggil('GET', '/users/abc', undefined, bella.token)).status, 400);
  assert.equal((await panggil('GET', '/users/999999', undefined, bella.token)).status, 404);

  // Agregasi
  const stat = (await panggil('GET', '/skills/statistik')).body;
  const js = stat.find((s) => s.nama === 'JavaScript');
  assert.ok(js.jumlah_pengguna >= 1 && js.jumlah_terverifikasi >= 1);

  // M3 tim + US-10 notifikasi kandidat cocok
  const tim = await panggil('POST', '/tim', { nama_tim: 'Tim Uji', kebutuhan_skill: ['Figma'] }, andi.token);
  assert.equal(tim.status, 201);
  assert.equal((await panggil('POST', '/tim', { nama_tim: '' }, andi.token)).status, 400);
  await panggil('PUT', '/users/me/skills', { skill_ids: [id('Figma'), id('UI/UX Design')] }, bella.token);
  const notifA = (await panggil('GET', '/notifikasi', undefined, andi.token)).body;
  assert.ok(notifA.some((n) => n.jenis === 'kandidat_cocok'));

  const idTim = tim.body.id_tim;
  assert.equal((await panggil('POST', `/tim/${idTim}/undangan`, { id_users: bella.id_users }, bella.token)).status, 403);
  const inv = await panggil('POST', `/tim/${idTim}/undangan`, { id_users: bella.id_users, peran_ditawarkan: 'UI Designer' }, andi.token);
  assert.equal(inv.status, 201);
  assert.equal((await panggil('POST', `/tim/${idTim}/undangan`, { id_users: bella.id_users }, andi.token)).status, 409);
  assert.equal((await panggil('POST', `/tim/${idTim}/diskusi`, { isi_pesan: 'hai' }, bella.token)).status, 403);

  // US-06 respons undangan
  const masuk = (await panggil('GET', '/undangan?status=menunggu', undefined, bella.token)).body;
  assert.equal(masuk.length, 1);
  assert.equal((await panggil('PUT', `/undangan/${inv.body.id_undangan}`, { status: 'mungkin' }, bella.token)).status, 400);
  assert.equal((await panggil('PUT', `/undangan/${inv.body.id_undangan}`, { status: 'diterima' }, bella.token)).status, 200);
  assert.equal((await panggil('PUT', `/undangan/${inv.body.id_undangan}`, { status: 'ditolak' }, bella.token)).status, 409);

  // US-09 diskusi + polling
  const p1 = await panggil('POST', `/tim/${idTim}/diskusi`, { isi_pesan: 'Halo tim!' }, bella.token);
  assert.equal(p1.status, 201);
  await panggil('POST', `/tim/${idTim}/diskusi`, { isi_pesan: 'Siap' }, andi.token);
  assert.equal((await panggil('POST', `/tim/${idTim}/diskusi`, { isi_pesan: '   ' }, andi.token)).status, 400);
  const baru = (await panggil('GET', `/tim/${idTim}/diskusi?setelah_id=${p1.body.id_diskusi}`, undefined, andi.token)).body;
  assert.equal(baru.length, 1); assert.equal(baru[0].isi_pesan, 'Siap');

  // detail tim, peran, keluar, hapus
  const detail = (await panggil('GET', `/tim/${idTim}`, undefined, andi.token)).body;
  assert.equal(detail.anggota.length, 2); assert.ok(Array.isArray(detail.kebutuhan_skill));
  assert.equal((await panggil('PUT', `/tim/${idTim}/anggota/${bella.id_users}`, { peran: 'Lead UI' }, andi.token)).status, 200);
  assert.equal((await panggil('DELETE', `/tim/${idTim}/anggota/${andi.id_users}`, undefined, andi.token)).status, 400);
  assert.equal((await panggil('DELETE', `/tim/${idTim}/anggota/${bella.id_users}`, undefined, bella.token)).status, 204);
  assert.equal((await panggil('GET', `/tim/${idTim}`, undefined, bella.token)).status, 403);
  assert.equal((await panggil('DELETE', `/tim/${idTim}`, undefined, andi.token)).status, 204);
  assert.equal((await panggil('GET', `/tim/${idTim}`, undefined, andi.token)).status, 404);

  // notifikasi dibaca
  const n = (await panggil('GET', '/notifikasi?belum_dibaca=true', undefined, bella.token)).body;
  assert.ok(n.length >= 1);
  assert.equal((await panggil('PUT', '/notifikasi/baca-semua', undefined, bella.token)).status, 200);
  assert.equal((await panggil('GET', '/notifikasi?belum_dibaca=true', undefined, bella.token)).body.length, 0);
});

test('portofolio: kosong -> 404, validasi, bukan JSON -> 400', async () => {
  const u = await daftar('Porto', 'developer');
  assert.equal((await panggil('GET', '/portofolio/github', undefined, u.token)).status, 404);
  assert.equal((await panggil('DELETE', '/portofolio/figma', undefined, u.token)).status, 404);
  assert.deepEqual((await panggil('GET', '/portofolio', undefined, u.token)).body, { github: null, figma: null });
  assert.equal((await panggil('POST', '/portofolio/github', { username: '!!bad' }, u.token)).status, 400);
  const res = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{rusak' });
  assert.equal(res.status, 400);
  assert.equal((await panggil('GET', '/tidak-ada')).status, 404);
});
