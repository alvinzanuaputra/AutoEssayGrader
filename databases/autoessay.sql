-- ============================================
-- SKEMA DATABASE - SISTEM PENILAIAN ESAI OTOMATIS
-- ============================================

-- Tabel 1: USERS (Pengguna Sistem)
-- Menyimpan data user (siswa dan admin)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('admin', 'siswa') NOT NULL DEFAULT 'siswa',
    kelas VARCHAR(20), -- Kelas siswa (NULL untuk admin)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabel 2: SOAL (Bank Soal Esai)
-- Menyimpan soal-soal esai
CREATE TABLE soal (
    soal_id INT PRIMARY KEY AUTO_INCREMENT,
    kode_soal VARCHAR(50) UNIQUE NOT NULL,
    mata_pelajaran VARCHAR(100) NOT NULL,
    judul_soal VARCHAR(255) NOT NULL,
    pertanyaan TEXT NOT NULL,
    bobot_nilai DECIMAL(5,2) DEFAULT 10.00, -- Bobot nilai maksimal
    created_by INT NOT NULL, -- Admin yang membuat
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Tabel 3: KUNCI_JAWABAN (Kunci Jawaban Referensi)
-- Menyimpan kunci jawaban ideal dan kata kunci penting
CREATE TABLE kunci_jawaban (
    kunci_id INT PRIMARY KEY AUTO_INCREMENT,
    soal_id INT NOT NULL,
    jawaban_ideal TEXT NOT NULL, -- Jawaban lengkap yang ideal
    kata_kunci TEXT, -- Kata kunci penting (JSON format: ["kata1", "kata2"])
    sinonim_kata_kunci TEXT, -- Sinonim kata kunci (JSON format)
    bobot_kata_kunci DECIMAL(5,2), -- Bobot penilaian untuk kata kunci
    bobot_semantik DECIMAL(5,2), -- Bobot penilaian untuk kesamaan semantik
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (soal_id) REFERENCES soal(soal_id) ON DELETE CASCADE,
    UNIQUE KEY unique_kunci_per_soal (soal_id)
);

-- Tabel 4: UJIAN (Sesi Ujian/Tes)
-- Menyimpan informasi ujian/tes
CREATE TABLE ujian (
    ujian_id INT PRIMARY KEY AUTO_INCREMENT,
    nama_ujian VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    tanggal_ujian DATE NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Tabel 5: UJIAN_SOAL (Relasi Many-to-Many antara Ujian dan Soal)
-- Menyimpan soal-soal yang ada dalam suatu ujian
CREATE TABLE ujian_soal (
    ujian_soal_id INT PRIMARY KEY AUTO_INCREMENT,
    ujian_id INT NOT NULL,
    soal_id INT NOT NULL,
    nomor_urut INT NOT NULL, -- Urutan soal dalam ujian
    FOREIGN KEY (ujian_id) REFERENCES ujian(ujian_id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(soal_id) ON DELETE CASCADE,
    UNIQUE KEY unique_soal_per_ujian (ujian_id, soal_id),
    UNIQUE KEY unique_nomor_urut (ujian_id, nomor_urut)
);

-- Tabel 6: DOKUMEN_JAWABAN (Dokumen PDF yang Di-upload)
-- Menyimpan file PDF hasil scan jawaban siswa
CREATE TABLE dokumen_jawaban (
    dokumen_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, -- Siswa yang mengupload
    ujian_id INT NOT NULL,
    nama_file VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT, -- Ukuran file dalam bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_ocr ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    ocr_processed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (ujian_id) REFERENCES ujian(ujian_id) ON DELETE CASCADE
);

-- Tabel 7: JAWABAN_SISWA (Jawaban Hasil Ekstraksi OCR)
-- Menyimpan teks jawaban siswa yang sudah diekstrak dari PDF
CREATE TABLE jawaban_siswa (
    jawaban_id INT PRIMARY KEY AUTO_INCREMENT,
    dokumen_id INT NOT NULL, // Dokumen asal jawaban
    soal_id INT NOT NULL, //
    user_id INT NOT NULL, -- Siswa pemilik jawaban
    teks_jawaban TEXT, -- Hasil ekstraksi OCR
    image_path VARCHAR(500), -- Path gambar cropped area jawaban
    confidence_score DECIMAL(5,2), -- Confidence score OCR (0-100)
    is_verified BOOLEAN DEFAULT FALSE, -- Apakah sudah diverifikasi oleh admin
    verified_by INT, -- Admin yang memverifikasi
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (dokumen_id) REFERENCES dokumen_jawaban(dokumen_id) ON DELETE CASCADE,
    FOREIGN KEY (soal_id) REFERENCES soal(soal_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (verified_by) REFERENCES users(user_id),
    UNIQUE KEY unique_jawaban_per_siswa (user_id, soal_id, dokumen_id)
);

-- Tabel 8: HASIL_PENILAIAN (Skor dan Analisis Penilaian)
-- Menyimpan hasil penilaian otomatis dan manual
CREATE TABLE hasil_penilaian (
    penilaian_id INT PRIMARY KEY AUTO_INCREMENT,
    jawaban_id INT NOT NULL,
    metode_penilaian ENUM('kata_kunci', 'semantik', 'ml_model', 'manual') NOT NULL,
    skor_otomatis DECIMAL(5,2), -- Skor dari sistem otomatis
    skor_manual DECIMAL(5,2), -- Skor dari koreksi manual admin
    skor_akhir DECIMAL(5,2) NOT NULL, -- Skor final yang digunakan
    kata_kunci_ditemukan TEXT, -- JSON array kata kunci yang ditemukan
    similarity_score DECIMAL(5,4), -- Cosine similarity score (0-1)
    feedback_otomatis TEXT, -- Feedback dari sistem
    feedback_manual TEXT, -- Feedback tambahan dari admin
    dinilai_oleh INT, -- Admin yang menilai manual (NULL jika otomatis)
    tanggal_penilaian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jawaban_id) REFERENCES jawaban_siswa(jawaban_id) ON DELETE CASCADE,
    FOREIGN KEY (dinilai_oleh) REFERENCES users(user_id),
    UNIQUE KEY unique_penilaian_per_jawaban (jawaban_id)
);

-- Tabel 9: HISTORY_PENILAIAN (Riwayat Perubahan Penilaian)
-- Menyimpan log setiap perubahan penilaian (untuk audit trail)
CREATE TABLE history_penilaian (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    penilaian_id INT NOT NULL,
    skor_sebelum DECIMAL(5,2),
    skor_sesudah DECIMAL(5,2),
    metode_sebelum VARCHAR(50),
    metode_sesudah VARCHAR(50),
    catatan_perubahan TEXT,
    diubah_oleh INT NOT NULL, -- Admin yang mengubah
    tanggal_perubahan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (penilaian_id) REFERENCES hasil_penilaian(penilaian_id) ON DELETE CASCADE,
    FOREIGN KEY (diubah_oleh) REFERENCES users(user_id)
);

-- Tabel 10: SISTEM_LOG (Log Aktivitas Sistem)
-- Menyimpan log aktivitas penting untuk monitoring
CREATE TABLE sistem_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    aktivitas VARCHAR(255) NOT NULL,
    detail TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================
-- INDEXES untuk Optimasi Query
-- ============================================

-- Index untuk pencarian dan filter
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_soal_mata_pelajaran ON soal(mata_pelajaran);
CREATE INDEX idx_jawaban_user_soal ON jawaban_siswa(user_id, soal_id);
CREATE INDEX idx_penilaian_metode ON hasil_penilaian(metode_penilaian);
CREATE INDEX idx_dokumen_status ON dokumen_jawaban(status_ocr);
CREATE INDEX idx_ujian_tanggal ON ujian(tanggal_ujian);

-- ============================================
-- KETERANGAN RELASI UNTUK VERTABELLO:
-- ============================================

/*
RELASI ANTAR TABEL (untuk dibuat di Vertabello):

1. users (1) -> soal (N)
   - One to Many: Satu admin bisa membuat banyak soal
   - FK: soal.created_by -> users.user_id

2. soal (1) -> kunci_jawaban (1)
   - One to One: Satu soal memiliki satu kunci jawaban
   - FK: kunci_jawaban.soal_id -> soal.soal_id

3. users (1) -> ujian (N)
   - One to Many: Satu admin bisa membuat banyak ujian
   - FK: ujian.created_by -> users.user_id

4. ujian (N) <-> soal (N) melalui ujian_soal
   - Many to Many: Satu ujian bisa punya banyak soal, satu soal bisa ada di banyak ujian
   - FK: ujian_soal.ujian_id -> ujian.ujian_id
   - FK: ujian_soal.soal_id -> soal.soal_id

5. users (1) -> dokumen_jawaban (N)
   - One to Many: Satu siswa bisa upload banyak dokumen
   - FK: dokumen_jawaban.user_id -> users.user_id

6. ujian (1) -> dokumen_jawaban (N)
   - One to Many: Satu ujian bisa memiliki banyak dokumen jawaban
   - FK: dokumen_jawaban.ujian_id -> ujian.ujian_id

7. dokumen_jawaban (1) -> jawaban_siswa (N)
   - One to Many: Satu dokumen bisa mengandung banyak jawaban
   - FK: jawaban_siswa.dokumen_id -> dokumen_jawaban.dokumen_id

8. soal (1) -> jawaban_siswa (N)
   - One to Many: Satu soal dijawab oleh banyak siswa
   - FK: jawaban_siswa.soal_id -> soal.soal_id

9. users (1) -> jawaban_siswa (N) [sebagai pemilik]
   - One to Many: Satu siswa punya banyak jawaban
   - FK: jawaban_siswa.user_id -> users.user_id

10. users (1) -> jawaban_siswa (N) [sebagai verifikator]
    - One to Many: Satu admin bisa verifikasi banyak jawaban
    - FK: jawaban_siswa.verified_by -> users.user_id

11. jawaban_siswa (1) -> hasil_penilaian (1)
    - One to One: Satu jawaban memiliki satu hasil penilaian
    - FK: hasil_penilaian.jawaban_id -> jawaban_siswa.jawaban_id

12. users (1) -> hasil_penilaian (N)
    - One to Many: Satu admin bisa menilai banyak jawaban
    - FK: hasil_penilaian.dinilai_oleh -> users.user_id

13. hasil_penilaian (1) -> history_penilaian (N)
    - One to Many: Satu penilaian bisa punya banyak history perubahan
    - FK: history_penilaian.penilaian_id -> hasil_penilaian.penilaian_id

14. users (1) -> history_penilaian (N)
    - One to Many: Satu admin bisa mengubah banyak penilaian
    - FK: history_penilaian.diubah_oleh -> users.user_id

15. users (1) -> sistem_log (N)
    - One to Many: Satu user bisa punya banyak log aktivitas
    - FK: sistem_log.user_id -> users.user_id
*/