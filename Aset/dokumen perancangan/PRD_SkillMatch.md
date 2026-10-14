# SkillMatch — Product Requirements Document (PRD)

**Versi:** 0.1 — Draft untuk validasi kelompok  
**Proyek:** Pemrograman Mobile (PemMob), Kelompok 4  
**Platform:** React Native + Expo  
**Backend pada dokumen kode:** Node.js + Express  
**Database pada schema:** MySQL  

> Disusun berdasarkan Dokumen Analisis Kebutuhan PjBL Tahap 1 dan dokumen kode SkillMatch yang diberikan. Fitur yang tercantum di kebutuhan atau kode belum otomatis berarti sudah diuji berjalan pada perangkat kelompok.

## 1. Ringkasan Produk

SkillMatch adalah aplikasi mobile untuk membantu mahasiswa menemukan rekan tim proyek berdasarkan peran, keterampilan, ketersediaan, dan bukti portofolio. Konteksnya meliputi lomba/kompetisi, tugas besar, tugas akhir, dan proyek kolaboratif.

Masalah yang ingin ditangani:
- Sulit menemukan calon rekan tim dengan skill dan peran yang sesuai.
- Klaim kemampuan sering hanya berdasarkan pengakuan pribadi tanpa bukti karya.
- Undangan, status penerimaan, penetapan peran, dan komunikasi tersebar di berbagai kanal.

Solusi yang diusulkan mencakup pencarian dan filter kandidat, profil skill dan portofolio GitHub/Figma, serta pengelolaan tim, undangan, dan diskusi.

## 2. Tujuan Produk

1. Membantu mahasiswa menemukan kandidat berdasarkan skill dan peran.
2. Menampilkan informasi portofolio untuk membantu meninjau bukti kemampuan.
3. Memudahkan pengiriman undangan serta penerimaan/penolakan.
4. Menyediakan informasi tim, anggota, peran, dan ruang diskusi.
5. Menyajikan pengalaman mobile yang jelas dan konsisten.
6. Menangani loading, kesalahan layanan, dan data cache dengan pesan yang dapat dipahami.

## 3. Pengguna Sasaran

- **Mahasiswa pencari anggota:** membutuhkan anggota dengan skill/peran tertentu.
- **Mahasiswa calon anggota:** ingin menampilkan profil, skill, ketersediaan, dan portofolio.
- **Anggota tim:** perlu melihat informasi tim, merespons undangan, dan berdiskusi.

Konteks penggunaan meliputi masa pendaftaran kompetisi, awal semester, dan sepanjang pengerjaan proyek. Aplikasi bersifat mobile-first dan kebutuhan menekankan penggunaan saat koneksi stabil maupun terbatas.

## 4. Ruang Lingkup dan Fitur

| ID | Fitur | Kebutuhan | Prioritas usulan |
|---|---|---|---|
| FR-01 | Registrasi/login | Membuat akun dan masuk | Must |
| FR-02 | Profil pengguna | Menampilkan/mengelola informasi profil dan peran | Must |
| FR-03 | Skill pengguna | Menampilkan skill yang dimiliki | Must |
| FR-04 | Pencarian/filter kandidat | Menemukan kandidat berdasarkan kriteria yang didukung | Must |
| FR-05 | Detail kandidat | Melihat profil publik, peran, skill, dan portofolio yang tersedia | Must |
| FR-06 | Portofolio GitHub | Mengambil ringkasan data publik melalui backend | Should; verifikasi scope |
| FR-07 | Portofolio Figma | Menampilkan proyek jika integrasi dan akses API tersedia | Perlu verifikasi |
| FR-08 | Tim | Melihat/mengelola tim sesuai izin | Must |
| FR-09 | Anggota/peran tim | Melihat anggota dan mengubah peran/mengeluarkan anggota sesuai izin | Must |
| FR-10 | Undangan | Mengirim, menerima, atau menolak undangan | Must |
| FR-11 | Diskusi tim | Membaca dan mengirim pesan | Must |
| FR-12 | Notifikasi | Melihat notifikasi, termasuk undangan jika diaktifkan | Perlu konfirmasi |
| FR-13 | Bookmark kandidat | Menyimpan kandidat jika masuk versi awal | Perlu konfirmasi |
| FR-14 | Cache/status jaringan | Menampilkan loading/error dan cache bila tersedia | Should |

Prioritas adalah rekomendasi untuk perencanaan, bukan klaim prioritas resmi dosen.

### Di luar ruang lingkup awal

Berdasarkan dokumen analisis: pembayaran/transaksi finansial, integrasi portofolio selain GitHub/Figma, panggilan suara/video, manajemen proyek lanjutan seperti Gantt Chart/Kanban/time tracking, serta website desktop sebagai produk utama.

## 5. Persyaratan Fungsional

### Autentikasi
- Menyediakan alur registrasi dan login.
- Input tidak valid atau permintaan gagal menghasilkan pesan jelas.
- Permintaan yang memerlukan sesi menggunakan token sesuai backend.
- Password/token tidak ditampilkan di antarmuka.

### Profil dan skill
- Profil menampilkan informasi relevan untuk mencari rekan tim.
- Pengguna memiliki peran utama dan daftar skill.
- Kode menyebut profil kandidat publik tidak menyertakan email.
- Skill yang ditulis pengguna dibedakan dari ringkasan portofolio eksternal.

### Pencarian kandidat
- Pengguna dapat membuka daftar kandidat dan melihat ringkasan.
- Pencarian/filter hanya menggunakan kriteria yang benar-benar didukung endpoint.
- Hasil kosong, loading, dan kegagalan API memiliki tampilan yang jelas.
- Parameter filter perlu dicocokkan dengan route aktual sebelum desain final.

### Portofolio
- Kode GitHub pada dokumen mengambil profil publik, jumlah repository publik, ringkasan bahasa pemrograman, dan perkiraan jumlah commit.
- Integrasi Figma disebut dalam kebutuhan; status implementasi, autentikasi, dan field datanya harus diverifikasi.
- Kegagalan layanan eksternal menampilkan pesan dan opsi coba lagi.
- Jangan menyebut skill “terverifikasi” melebihi data dan aturan yang benar-benar tersedia.

### Tim dan anggota
- Pengguna dapat melihat tim yang relevan dengan akun.
- Detail tim menampilkan nama, deskripsi, kebutuhan skill, anggota, dan peran jika tersedia.
- Pengubahan peran/pengeluaran anggota dibatasi oleh otorisasi backend.
- Aturan pembuatan banyak tim, kepemilikan, dan hak pengelolaan perlu disepakati.

### Undangan, diskusi, notifikasi
- Pengguna dapat melihat undangan masuk dan menerima/menolaknya.
- Status undangan ditampilkan eksplisit.
- Anggota tim dapat membaca/mengirim pesan bila diizinkan backend.
- Notifikasi dapat menampilkan jenis, isi, waktu, dan status dibaca sesuai data.
- Keputusan apakah bookmark dan notifikasi wajib untuk versi awal masih perlu disepakati.

## 6. Persyaratan Nonfungsional

- **Teknologi yang terlihat pada bahan:** React Native + Expo, JavaScript, Node.js/Express, MySQL.
- **Platform:** dokumen analisis menyebut Android/iOS, dan juga menekankan Android minimum API 26. Target akhir perlu diputuskan.
- **Kinerja:** dokumen analisis menargetkan halaman utama, pencarian, dan profil kandidat sekitar maksimal 3 detik pada koneksi stabil.
- **Timeout:** kode mobile dan layanan eksternal menggunakan timeout sekitar 10 detik.
- **Jaringan:** sediakan loading, error, retry, dan cache jika tersedia.
- **Keamanan:** jangan hardcode token/secret atau menampilkan kredensial.
- **Privasi:** hanya tampilkan data profil yang sesuai izin.
- **Konsistensi:** tombol, status, kartu, input, dan navigasi menggunakan pola konsisten.

## 7. Data dan Entitas

Entitas/tabel yang disebut pada bahan analisis/kode:
`users`, `skills`, `users_skills`, `bookmarks`, `tim`, `undangan`, `anggota_tim`, `diskusi`, `notifikasi`, `profil_github`, `profil_figma`.

`schema.sql` harus menjadi acuan nama kolom, tipe data, primary key, foreign key, dan relasi yang tepat. PRD ini tidak mendefinisikan ulang kolom yang belum diverifikasi.

## 8. Integrasi dan API

Backend pada dokumen kode menggunakan Node.js + Express, dengan database MySQL. Mobile memiliki lapisan permintaan HTTP menggunakan `EXPO_PUBLIC_API_URL` dan token bearer jika tersedia.

Kelompok endpoint yang terlihat pada bahan mencakup autentikasi, pengguna/profil dan pencarian, skill, tim/anggota, diskusi tim, undangan, serta layanan eksternal seperti GitHub. Daftar method, path, body, response, dan otorisasi final perlu dicocokkan dengan seluruh file `routes/` dan `services/`; PRD ini tidak mengarang endpoint yang belum diverifikasi.

## 9. Arah UI/UX

Palet visual sesuai arahan pengguna dan referensi:
- **Burgundy:** `#681B25`
- **Beige kecokelatan:** `#A78E75`
- **Cream:** `#E2D0B0`

Warna `#F7F0E6` tidak digunakan. Hitam/putih netral boleh dipakai seperlunya untuk keterbacaan, bukan sebagai warna utama tambahan.

Gaya yang diinginkan: elegan, modern, rapi, dan sedikit mewah. Referensi boleh diadaptasi untuk kebutuhan aplikasi, bukan menyalin layout media sosial secara literal. Komponen yang sesuai: kartu kandidat, tag skill, ringkasan portofolio, status undangan, kartu tim, dan ruang diskusi.

Prinsip UI: jelas, terarah, berbasis bukti, konsisten, memberi kendali kepada pengguna, tanggap terhadap jaringan, dan menjaga privasi.

## 10. Kriteria Penerimaan

- [ ] Pengguna dapat mendaftar dan login sesuai validasi.
- [ ] Profil dan skill dapat ditampilkan/dikelola sesuai endpoint.
- [ ] Pengguna dapat mencari kandidat dan melihat hasil kosong.
- [ ] Profil kandidat menampilkan peran, skill, dan data portofolio yang tersedia.
- [ ] Kegagalan GitHub/Figma memiliki pesan jelas dan opsi coba lagi.
- [ ] Pengguna dapat melihat tim dan anggota sesuai izin.
- [ ] Undangan dapat diterima/ditolak dan status diperbarui.
- [ ] Anggota tim dapat membuka diskusi dan mengirim pesan.
- [ ] Loading, error, empty state, dan retry ditangani pada layar yang mengambil data.
- [ ] Token/kredensial tidak tampil di UI.
- [ ] Aplikasi diuji pada ukuran layar dan platform target.

## 11. Hal yang Harus Dikonfirmasi Sebelum Final

1. Apakah bookmark dan notifikasi wajib atau fitur tambahan.
2. Apakah integrasi Figma sudah berjalan.
3. Filter pencarian yang benar-benar tersedia pada backend.
4. Aturan pembuatan tim, kepemilikan, batas anggota, dan izin pengelolaan.
5. Target platform akhir: Android saja atau Android dan iOS.
6. Apakah cache/offline sudah diterapkan atau masih target desain.
7. Apakah seluruh route dan screen pada dokumen sama dengan versi repository terbaru.
8. Rubrik/ketentuan khusus dosen.

## 12. Status Dokumen

Ini adalah draft awal untuk validasi kelompok. Kebutuhan produk berasal dari dokumen analisis; teknologi dan sebagian perilaku berasal dari kode yang diberikan; palet warna berasal dari arahan pengguna; prioritas dan beberapa saran UI adalah rekomendasi. Sebelum final, cocokkan dengan versi terbaru `routes/`, `services/`, `schema.sql`, dan screen mobile.
