-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2025-10-01 14:17:33.63

-- tables
-- Table: dokumen_jawaban
CREATE TABLE dokumen_jawaban (
    dokumen_id int  NOT NULL,
    nama_file varchar(255)  NOT NULL,
    file_path varchar(500)  NOT NULL,
    file_size int  NOT NULL,
    upload_date timestamp  NOT NULL,
    status_ocr vacrhar(20)  NOT NULL,
    ocr_processed_at timestamp  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT dokumen_jawaban_pk PRIMARY KEY (dokumen_id)
);

-- Table: hasil_penilaian
CREATE TABLE hasil_penilaian (
    penilaian_id int  NOT NULL,
    skor_otomatis decimal(5,2)  NOT NULL,
    skor_manual decimal(5,2)  NOT NULL,
    skor_akhir decimal(5,2)  NOT NULL,
    kata_kunci_ditemukan text  NOT NULL,
    similarity_score decimal(5,4)  NOT NULL,
    feedback_otomatis text  NOT NULL,
    feedback_manual text  NOT NULL,
    dinilai_oleh int  NOT NULL,
    tanggal_penilaian timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    jawaban_siswa_jawaban_siswa_id int  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT hasil_penilaian_pk PRIMARY KEY (penilaian_id)
);

-- Table: history_penilaian
CREATE TABLE history_penilaian (
    history_id int  NOT NULL,
    skor_sebelum decimal(5,2)  NOT NULL,
    skor_sesudah decimal(5,2)  NOT NULL,
    metode_sebelum varchar(50)  NOT NULL,
    metode_sesudah varchar(50)  NOT NULL,
    catatan_perubahan text  NOT NULL,
    diubah_oleh int  NOT NULL,
    tanggal_perubahan timestamp  NOT NULL,
    hasil_penilaian_penilaian_id int  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT history_penilaian_pk PRIMARY KEY (history_id)
);

-- Table: jawaban_siswa
CREATE TABLE jawaban_siswa (
    jawaban_siswa_id int  NOT NULL,
    image_path varchar(500)  NOT NULL,
    confidence_score decimal(5,2)  NOT NULL,
    is_verified boolean  NOT NULL,
    verified_by int  NOT NULL,
    verified_at timestamp  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    dokumen_jawaban_dokumen_id int  NOT NULL,
    soal_soal_id int  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT jawaban_siswa_pk PRIMARY KEY (jawaban_siswa_id)
);

-- Table: kunci_jawaban
CREATE TABLE kunci_jawaban (
    kunci_id int  NOT NULL,
    jawaban_ideal text  NOT NULL,
    kata_kunci text  NOT NULL,
    sinonim_kata_kunci text  NOT NULL,
    bobot_kata_kunci decimal(5,2)  NOT NULL,
    bobot_sinematik decimal(5,2)  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    soal_soal_id int  NOT NULL,
    CONSTRAINT kunci_jawaban_pk PRIMARY KEY (kunci_id)
);

-- Table: soal
CREATE TABLE soal (
    soal_id int  NOT NULL,
    kode_soal varchar(50)  NOT NULL,
    mapel varchar(100)  NOT NULL,
    judul_soal varchar(255)  NOT NULL,
    pertanyaan text  NOT NULL,
    bobot_nilai decimal(5,2)  NOT NULL,
    created_by int  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    is_active boolean  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT soal_pk PRIMARY KEY (soal_id)
);

-- Table: system_log
CREATE TABLE system_log (
    log_id int  NOT NULL,
    aktivitas varchar(255)  NOT NULL,
    detail text  NOT NULL,
    ip_address varchar(45)  NOT NULL,
    timestamp timestamp  NOT NULL,
    users_user_id int  NOT NULL,
    CONSTRAINT system_log_pk PRIMARY KEY (log_id)
);

-- Table: ujian
CREATE TABLE ujian (
    ujian_id int  NOT NULL,
    nama_ujian varchar(255)  NOT NULL,
    deskripsi text  NOT NULL,
    tanggal_ujian date  NOT NULL,
    waktu_mulai time  NOT NULL,
    waktu_selesai time  NOT NULL,
    created_by int  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    CONSTRAINT ujian_pk PRIMARY KEY (ujian_id)
);

-- Table: ujian_soal
CREATE TABLE ujian_soal (
    ujian_soal_id int  NOT NULL,
    nomor_urut int  NOT NULL,
    soal_soal_id int  NOT NULL,
    ujian_ujian_id int  NOT NULL,
    CONSTRAINT ujian_soal_pk PRIMARY KEY (ujian_soal_id)
);

-- Table: users
CREATE TABLE users (
    user_id int  NOT NULL,
    username varchar(50)  NOT NULL,
    password_hash varchar(255)  NOT NULL,
    full_name varchar(100)  NOT NULL,
    email varchar(100)  NOT NULL,
    role varchar(5)  NOT NULL,
    kelas varchar(20)  NOT NULL,
    created_at timestamp  NOT NULL,
    updated_at timestamp  NOT NULL,
    is_active boolean  NOT NULL,
    CONSTRAINT users_pk PRIMARY KEY (user_id)
);

-- foreign keys
-- Reference: dokumen_jawaban_users (table: dokumen_jawaban)
ALTER TABLE dokumen_jawaban ADD CONSTRAINT dokumen_jawaban_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: hasil_penilaian_jawaban_siswa (table: hasil_penilaian)
ALTER TABLE hasil_penilaian ADD CONSTRAINT hasil_penilaian_jawaban_siswa
    FOREIGN KEY (jawaban_siswa_jawaban_siswa_id)
    REFERENCES jawaban_siswa (jawaban_siswa_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: hasil_penilaian_users (table: hasil_penilaian)
ALTER TABLE hasil_penilaian ADD CONSTRAINT hasil_penilaian_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: history_penilaian_hasil_penilaian (table: history_penilaian)
ALTER TABLE history_penilaian ADD CONSTRAINT history_penilaian_hasil_penilaian
    FOREIGN KEY (hasil_penilaian_penilaian_id)
    REFERENCES hasil_penilaian (penilaian_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: history_penilaian_users (table: history_penilaian)
ALTER TABLE history_penilaian ADD CONSTRAINT history_penilaian_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: jawaban_siswa_dokumen_jawaban (table: jawaban_siswa)
ALTER TABLE jawaban_siswa ADD CONSTRAINT jawaban_siswa_dokumen_jawaban
    FOREIGN KEY (dokumen_jawaban_dokumen_id)
    REFERENCES dokumen_jawaban (dokumen_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: jawaban_siswa_soal (table: jawaban_siswa)
ALTER TABLE jawaban_siswa ADD CONSTRAINT jawaban_siswa_soal
    FOREIGN KEY (soal_soal_id)
    REFERENCES soal (soal_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: jawaban_siswa_users (table: jawaban_siswa)
ALTER TABLE jawaban_siswa ADD CONSTRAINT jawaban_siswa_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: kunci_jawaban_soal (table: kunci_jawaban)
ALTER TABLE kunci_jawaban ADD CONSTRAINT kunci_jawaban_soal
    FOREIGN KEY (soal_soal_id)
    REFERENCES soal (soal_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: soal_users (table: soal)
ALTER TABLE soal ADD CONSTRAINT soal_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: system_log_users (table: system_log)
ALTER TABLE system_log ADD CONSTRAINT system_log_users
    FOREIGN KEY (users_user_id)
    REFERENCES users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: ujian_soal_soal (table: ujian_soal)
ALTER TABLE ujian_soal ADD CONSTRAINT ujian_soal_soal
    FOREIGN KEY (soal_soal_id)
    REFERENCES soal (soal_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: ujian_soal_ujian (table: ujian_soal)
ALTER TABLE ujian_soal ADD CONSTRAINT ujian_soal_ujian
    FOREIGN KEY (ujian_ujian_id)
    REFERENCES ujian (ujian_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- End of file.

