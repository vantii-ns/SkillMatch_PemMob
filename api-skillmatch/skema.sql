-- skema.sql — SkillMatch (9 entitas sesuai Dokumen Analisis Kebutuhan bagian 6.2)
-- Jalankan: mysql -u root -p < skema.sql   (atau Import di phpMyAdmin)
-- PERINGATAN: baris DROP DATABASE menghapus data lama. Jangan jalankan pada database berisi data penting.
DROP DATABASE IF EXISTS db_skillmatch;
CREATE DATABASE db_skillmatch
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_skillmatch;

CREATE TABLE users (
  id_users INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,
  peran_utama ENUM('developer','desainer','lainnya') NOT NULL DEFAULT 'lainnya',
  bio TEXT,
  ketersediaan BOOLEAN NOT NULL DEFAULT TRUE,
  dibuat_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(50) NOT NULL UNIQUE,
  kategori ENUM('pemrograman','desain','lainnya') NOT NULL DEFAULT 'lainnya'
);

CREATE TABLE users_skills (
  id_users INT NOT NULL,
  skill_id INT NOT NULL,
  status_verifikasi ENUM('belum','terverifikasi') NOT NULL DEFAULT 'belum',
  PRIMARY KEY (id_users, skill_id),
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- GitHub dan Figma digabung; dibedakan melalui kolom platform.
-- ringkasan = JSON (teks): github {jumlah_repo, jumlah_commit, top_languages[]}, figma {jumlah_proyek, files[]}
CREATE TABLE profil_portofolio (
  id_portofolio INT AUTO_INCREMENT PRIMARY KEY,
  id_users INT NOT NULL,
  platform ENUM('github','figma') NOT NULL,
  username VARCHAR(100) NOT NULL,
  external_id VARCHAR(50),
  ringkasan TEXT NOT NULL,
  diperbarui_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_platform (id_users, platform),
  UNIQUE KEY uq_platform_username (platform, username),
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tim (
  id_tim INT AUTO_INCREMENT PRIMARY KEY,
  id_users INT NOT NULL COMMENT 'ketua tim',
  nama_tim VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  kebutuhan_skill TEXT NOT NULL COMMENT 'array JSON nama skill yang dicari',
  dibuat_pada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE anggota_tim (
  id_anggota INT AUTO_INCREMENT PRIMARY KEY,
  id_tim INT NOT NULL,
  id_users INT NOT NULL,
  peran VARCHAR(50) NOT NULL DEFAULT 'Anggota',
  status_anggota VARCHAR(20) NOT NULL DEFAULT 'aktif',
  tanggal_gabung DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tim_user (id_tim, id_users),
  FOREIGN KEY (id_tim) REFERENCES tim(id_tim) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE undangan (
  id_undangan INT AUTO_INCREMENT PRIMARY KEY,
  id_tim INT NOT NULL,
  id_users INT NOT NULL COMMENT 'pengguna yang diundang',
  id_pengirim INT NOT NULL,
  peran_ditawarkan VARCHAR(50) NOT NULL DEFAULT 'Anggota',
  status ENUM('menunggu','diterima','ditolak') NOT NULL DEFAULT 'menunggu',
  tanggal_undangan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tanggal_respons DATETIME NULL,
  INDEX idx_undangan_user (id_users, status),
  FOREIGN KEY (id_tim) REFERENCES tim(id_tim) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_pengirim) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE diskusi (
  id_diskusi INT AUTO_INCREMENT PRIMARY KEY,
  id_tim INT NOT NULL,
  id_users INT NOT NULL,
  isi_pesan TEXT NOT NULL,
  waktu_pesan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_diskusi_tim (id_tim, id_diskusi),
  FOREIGN KEY (id_tim) REFERENCES tim(id_tim) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notifikasi (
  id_notifikasi INT AUTO_INCREMENT PRIMARY KEY,
  id_users INT NOT NULL,
  jenis VARCHAR(30) NOT NULL,
  isi VARCHAR(255) NOT NULL,
  data TEXT NULL,
  status_dibaca BOOLEAN NOT NULL DEFAULT FALSE,
  waktu DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notif_user (id_users, status_dibaca),
  FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ===== Data awal =====
INSERT INTO skills (nama, kategori) VALUES
 ('JavaScript','pemrograman'),('TypeScript','pemrograman'),('Python','pemrograman'),
 ('Java','pemrograman'),('Kotlin','pemrograman'),('Dart','pemrograman'),('PHP','pemrograman'),
 ('C++','pemrograman'),('C#','pemrograman'),('Go','pemrograman'),('Swift','pemrograman'),
 ('HTML','pemrograman'),('CSS','pemrograman'),('React Native','pemrograman'),
 ('Flutter','pemrograman'),('Node.js','pemrograman'),
 ('UI/UX Design','desain'),('Figma','desain'),('Prototyping','desain'),
 ('Design System','desain'),('Wireframing','desain'),('Ilustrasi','desain'),
 ('Project Management','lainnya'),('Presentasi','lainnya'),('Penulisan Dokumen','lainnya');

-- Akun contoh (password semua: password123)
INSERT INTO users (nama, email, password_hash, peran_utama, bio) VALUES
 ('Andi Pratama','andi@contoh.com','$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y','developer','Mahasiswa SI, suka backend dan mobile'),
 ('Bella Safira','bella@contoh.com','$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y','desainer','UI/UX designer, fokus aplikasi mobile'),
 ('Citra Lestari','citra@contoh.com','$2b$10$ZpNmkwHrCFDKuJN95SFRnutm2NtwhB.k4wcLTbaZwopRdv9imaR9y','developer','Frontend developer React Native');

INSERT INTO users_skills (id_users, skill_id) VALUES
 (1,1),(1,16),(1,14),(2,17),(2,18),(2,19),(3,1),(3,14),(3,13);

INSERT INTO tim (id_users, nama_tim, deskripsi, kebutuhan_skill) VALUES
 (1,'Tim Lomba Gemastik','Mencari desainer UI/UX untuk lomba aplikasi','["Figma","UI/UX Design"]');
INSERT INTO anggota_tim (id_tim, id_users, peran) VALUES (1,1,'Ketua');
INSERT INTO undangan (id_tim, id_users, id_pengirim, peran_ditawarkan) VALUES (1,2,1,'UI Designer');
INSERT INTO notifikasi (id_users, jenis, isi, data) VALUES
 (2,'undangan_tim','Anda diundang bergabung ke tim "Tim Lomba Gemastik" sebagai UI Designer.','{"id_undangan":1,"id_tim":1}');
