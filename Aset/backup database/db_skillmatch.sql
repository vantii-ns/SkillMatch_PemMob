-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Waktu pembuatan: 15 Okt 2026 pada 03.44
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_skillmatch`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `anggota_tim`
--

CREATE TABLE `anggota_tim` (
  `id_anggota` int(11) NOT NULL,
  `id_tim` int(11) NOT NULL,
  `id_users` int(11) NOT NULL,
  `peran` varchar(50) NOT NULL DEFAULT 'Anggota',
  `status_anggota` varchar(20) NOT NULL DEFAULT 'aktif',
  `tanggal_gabung` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `anggota_tim`
--

INSERT INTO `anggota_tim` (`id_anggota`, `id_tim`, `id_users`, `peran`, `status_anggota`, `tanggal_gabung`) VALUES
(1, 1, 1, 'Ketua', 'aktif', '2026-10-08 16:30:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `diskusi`
--

CREATE TABLE `diskusi` (
  `id_diskusi` int(11) NOT NULL,
  `id_tim` int(11) NOT NULL,
  `id_users` int(11) NOT NULL,
  `isi_pesan` text NOT NULL,
  `waktu_pesan` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id_notifikasi` int(11) NOT NULL,
  `id_users` int(11) NOT NULL,
  `jenis` varchar(30) NOT NULL,
  `isi` varchar(255) NOT NULL,
  `data` text DEFAULT NULL,
  `status_dibaca` tinyint(1) NOT NULL DEFAULT 0,
  `waktu` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `notifikasi`
--

INSERT INTO `notifikasi` (`id_notifikasi`, `id_users`, `jenis`, `isi`, `data`, `status_dibaca`, `waktu`) VALUES
(1, 2, 'undangan_tim', 'Anda diundang bergabung ke tim \"Tim Lomba Gemastik\" sebagai UI Designer.', '{\"id_undangan\":1,\"id_tim\":1}', 0, '2026-10-08 16:30:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `profil_portofolio`
--

CREATE TABLE `profil_portofolio` (
  `id_portofolio` int(11) NOT NULL,
  `id_users` int(11) NOT NULL,
  `platform` enum('github','figma') NOT NULL,
  `username` varchar(100) NOT NULL,
  `external_id` varchar(50) DEFAULT NULL,
  `ringkasan` text NOT NULL,
  `diperbarui_pada` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `nama` varchar(50) NOT NULL,
  `kategori` enum('pemrograman','desain','lainnya') NOT NULL DEFAULT 'lainnya'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `skills`
--

INSERT INTO `skills` (`id`, `nama`, `kategori`) VALUES
(1, 'JavaScript', 'pemrograman'),
(2, 'TypeScript', 'pemrograman'),
(3, 'Python', 'pemrograman'),
(4, 'Java', 'pemrograman'),
(5, 'Kotlin', 'pemrograman'),
(6, 'Dart', 'pemrograman'),
(7, 'PHP', 'pemrograman'),
(8, 'C++', 'pemrograman'),
(9, 'C#', 'pemrograman'),
(10, 'Go', 'pemrograman'),
(11, 'Swift', 'pemrograman'),
(12, 'HTML', 'pemrograman'),
(13, 'CSS', 'pemrograman'),
(14, 'React Native', 'pemrograman'),
(15, 'Flutter', 'pemrograman'),
(16, 'Node.js', 'pemrograman'),
(17, 'UI/UX Design', 'desain'),
(18, 'Figma', 'desain'),
(19, 'Prototyping', 'desain'),
(20, 'Design System', 'desain'),
(21, 'Wireframing', 'desain'),
(22, 'Ilustrasi', 'desain'),
(23, 'Project Management', 'lainnya'),
(24, 'Presentasi', 'lainnya'),
(25, 'Penulisan Dokumen', 'lainnya');

-- --------------------------------------------------------

--
-- Struktur dari tabel `tim`
--

CREATE TABLE `tim` (
  `id_tim` int(11) NOT NULL,
  `id_users` int(11) NOT NULL COMMENT 'ketua tim',
  `nama_tim` varchar(100) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `kebutuhan_skill` text NOT NULL COMMENT 'array JSON nama skill yang dicari',
  `dibuat_pada` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `tim`
--

INSERT INTO `tim` (`id_tim`, `id_users`, `nama_tim`, `deskripsi`, `kebutuhan_skill`, `dibuat_pada`) VALUES
(1, 1, 'Tim Lomba Gemastik', 'Mencari desainer UI/UX untuk lomba aplikasi', '[\"Figma\",\"UI/UX Design\"]', '2026-10-08 16:30:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `undangan`
--

CREATE TABLE `undangan` (
  `id_undangan` int(11) NOT NULL,
  `id_tim` int(11) NOT NULL,
  `id_users` int(11) NOT NULL COMMENT 'pengguna yang diundang',
  `id_pengirim` int(11) NOT NULL,
  `peran_ditawarkan` varchar(50) NOT NULL DEFAULT 'Anggota',
  `status` enum('menunggu','diterima','ditolak') NOT NULL DEFAULT 'menunggu',
  `tanggal_undangan` datetime NOT NULL DEFAULT current_timestamp(),
  `tanggal_respons` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `undangan`
--

INSERT INTO `undangan` (`id_undangan`, `id_tim`, `id_users`, `id_pengirim`, `peran_ditawarkan`, `status`, `tanggal_undangan`, `tanggal_respons`) VALUES
(1, 1, 2, 1, 'UI Designer', 'menunggu', '2026-10-08 16:30:32', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_users` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(100) NOT NULL,
  `peran_utama` enum('developer','desainer','lainnya') NOT NULL DEFAULT 'lainnya',
  `bio` text DEFAULT NULL,
  `ketersediaan` tinyint(1) NOT NULL DEFAULT 1,
  `dibuat_pada` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_users`, `nama`, `email`, `password_hash`, `peran_utama`, `bio`, `ketersediaan`, `dibuat_pada`) VALUES
(1, 'Andi Pratama', 'andi@contoh.com', '$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y', 'developer', 'Mahasiswa SI, suka backend dan mobile', 1, '2026-10-08 16:30:32'),
(2, 'Bella Safira', 'bella@contoh.com', '$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y', 'desainer', 'UI/UX designer, fokus aplikasi mobile', 1, '2026-10-08 16:30:32'),
(3, 'Citra Lestari', 'citra@contoh.com', '$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y', 'developer', 'Frontend developer React Native', 1, '2026-10-08 16:30:32');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users_skills`
--

CREATE TABLE `users_skills` (
  `id_users` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `status_verifikasi` enum('belum','terverifikasi') NOT NULL DEFAULT 'belum'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users_skills`
--

INSERT INTO `users_skills` (`id_users`, `skill_id`, `status_verifikasi`) VALUES
(1, 1, 'belum'),
(1, 14, 'belum'),
(1, 16, 'belum'),
(2, 17, 'belum'),
(2, 18, 'belum'),
(2, 19, 'belum'),
(3, 1, 'belum'),
(3, 13, 'belum'),
(3, 14, 'belum');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `anggota_tim`
--
ALTER TABLE `anggota_tim`
  ADD PRIMARY KEY (`id_anggota`),
  ADD UNIQUE KEY `uq_tim_user` (`id_tim`,`id_users`),
  ADD KEY `id_users` (`id_users`);

--
-- Indeks untuk tabel `diskusi`
--
ALTER TABLE `diskusi`
  ADD PRIMARY KEY (`id_diskusi`),
  ADD KEY `idx_diskusi_tim` (`id_tim`,`id_diskusi`),
  ADD KEY `id_users` (`id_users`);

--
-- Indeks untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id_notifikasi`),
  ADD KEY `idx_notif_user` (`id_users`,`status_dibaca`);

--
-- Indeks untuk tabel `profil_portofolio`
--
ALTER TABLE `profil_portofolio`
  ADD PRIMARY KEY (`id_portofolio`),
  ADD UNIQUE KEY `uq_user_platform` (`id_users`,`platform`),
  ADD UNIQUE KEY `uq_platform_username` (`platform`,`username`);

--
-- Indeks untuk tabel `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indeks untuk tabel `tim`
--
ALTER TABLE `tim`
  ADD PRIMARY KEY (`id_tim`),
  ADD KEY `id_users` (`id_users`);

--
-- Indeks untuk tabel `undangan`
--
ALTER TABLE `undangan`
  ADD PRIMARY KEY (`id_undangan`),
  ADD KEY `idx_undangan_user` (`id_users`,`status`),
  ADD KEY `id_tim` (`id_tim`),
  ADD KEY `id_pengirim` (`id_pengirim`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `users_skills`
--
ALTER TABLE `users_skills`
  ADD PRIMARY KEY (`id_users`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `anggota_tim`
--
ALTER TABLE `anggota_tim`
  MODIFY `id_anggota` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `diskusi`
--
ALTER TABLE `diskusi`
  MODIFY `id_diskusi` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id_notifikasi` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `profil_portofolio`
--
ALTER TABLE `profil_portofolio`
  MODIFY `id_portofolio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT untuk tabel `tim`
--
ALTER TABLE `tim`
  MODIFY `id_tim` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `undangan`
--
ALTER TABLE `undangan`
  MODIFY `id_undangan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_users` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `anggota_tim`
--
ALTER TABLE `anggota_tim`
  ADD CONSTRAINT `anggota_tim_ibfk_1` FOREIGN KEY (`id_tim`) REFERENCES `tim` (`id_tim`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `anggota_tim_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `diskusi`
--
ALTER TABLE `diskusi`
  ADD CONSTRAINT `diskusi_ibfk_1` FOREIGN KEY (`id_tim`) REFERENCES `tim` (`id_tim`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `diskusi_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `notifikasi_ibfk_1` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `profil_portofolio`
--
ALTER TABLE `profil_portofolio`
  ADD CONSTRAINT `profil_portofolio_ibfk_1` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `tim`
--
ALTER TABLE `tim`
  ADD CONSTRAINT `tim_ibfk_1` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `undangan`
--
ALTER TABLE `undangan`
  ADD CONSTRAINT `undangan_ibfk_1` FOREIGN KEY (`id_tim`) REFERENCES `tim` (`id_tim`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `undangan_ibfk_2` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `undangan_ibfk_3` FOREIGN KEY (`id_pengirim`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `users_skills`
--
ALTER TABLE `users_skills`
  ADD CONSTRAINT `users_skills_ibfk_1` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
