# 📚 Grade Mind

**Grade Mind** adalah platform web-based yang mengintegrasikan teknologi Artificial Intelligence untuk mengotomatisasi proses penilaian jawaban esai mahasiswa. Sistem ini menggabungkan teknologi Optical Character Recognition (OCR) untuk digitalisasi tulisan tangan dan Large Language Model (LLM) berbasis Ollama untuk analisis dan penilaian jawaban secara otomatis. Dibangun dengan FastAPI sebagai backend REST API, Next.js untuk frontend yang responsif, dan PostgreSQL sebagai database management system, Grade Mind menyediakan solusi end-to-end untuk manajemen kelas, penugasan, dan penilaian yang efisien bagi dosen dan mahasiswa.

## 📋 Daftar Isi

- [Tim Pengembang](#-tim-pengembang)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Struktur Project](#-struktur-project)
- [Instalasi](#-instalasi)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [AI Grader Setup](#3-ai-grader-setup)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Catatan Pengembangan](#-catatan-pengembangan)

### Fitur Utama:

- 🔐 Autentikasi pengguna (Dosen & Mahasiswa)
- 📝 Manajemen kelas dan tugas
- 📸 OCR untuk scan jawaban tulisan tangan
- 🤖 Penilaian otomatis menggunakan AI
- 📊 Dashboard monitoring nilai
- 👥 Manajemen peserta kelas

## 👥 Tim Pengembang

| Divisi          | Anggota Tim                      |
| --------------- | -------------------------------- |
| 🎨 **UI/UX**    | Muhammad Azhar Aziz              |
|                 | Christoforus Indra Bagus Pratama |
|                 | Nadin Nabil Hafizh Ayyasy        |
| 🎨 **Frontend** | Alvin Zanua Putra                |
| ⚙️ **Backend**  | Pramuditya Faiz Ardiansyah       |
|                 | Alvin Zanua Putra                |
| 🤖 **AI**       | Muh. Buyung Saloka               |
|                 | Choirul Anam                     |
|                 | Rachmat Ramadhan                 |

## 🛠 Teknologi yang Digunakan

### Frontend

- Next.js 15.5.4
- React 19.1.0
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)

### Backend

- FastAPI
- SQLModel & SQLAlchemy
- PostgreSQL
- FastAPI Users (Authentication)
- Pydantic

### AI/ML

- Ollama (LLM)
- Sentence Transformers
- OCR Services

## 📁 Struktur Project

```
main/
├── backend/          # FastAPI REST API
├── frontend/         # Next.js Web Application
├── grader-ai/        # AI Grading Service dengan Ollama
└── tr-ocr/           # OCR Processing Service
```

## 🚀 Instalasi

### Prerequisites

Pastikan Anda telah menginstal:

- Node.js (v18 atau lebih baru)
- Python 3.8+
- PostgreSQL
- Docker (optional, untuk PostgreSQL)
- Ollama (untuk AI Grading)
- Rekomendasi Jalankan Project Ini Di Linux

### 1. Backend Setup

```powershell
# Masuk ke folder backend
cd backend

# Buat virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database dengan Docker (optional)
docker run --name grademind-postgres -e POSTGRES_PASSWORD=12345 -e POSTGRES_USER=grademind -e POSTGRES_DB=grademind_db -p 5432:5432 -d postgres

# Konfigurasi environment
copy .env.example .env
# Edit file .env dan sesuaikan DATABASE_URL serta SECRET_KEY
```

**Contoh .env:**

```env
DATABASE_URL=postgresql+asyncpg://grademind:12345@localhost:5432/grademind_db
SECRET_KEY=your-secret-key-here
```

### 2. Frontend Setup

```powershell
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Konfigurasi environment
copy .env.example .env
# Edit file .env dan sesuaikan API URL
```

**Contoh .env:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. AI Grader Setup

```powershell
# Virtual venv
.\.venv\Scripts\activate

# Masuk ke folder grader-ai
cd grader-ai

# Install dependencies
pip install -r requirements.txt

# Install Ollama
# Download dari: https://ollama.ai
# Setelah install, jalankan model yang dibutuhkan:
ollama pull llama2
```

## ▶️ Menjalankan Aplikasi

### Jalankan Backend

```powershell
.\.venv\Scripts\activate
cd backend
uvicorn main:app --reload
```

Backend akan berjalan di: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Jalankan Frontend

```powershell
cd frontend
npm run build
npm run dev
```

Frontend akan berjalan di: `http://localhost:3000`

### Jalankan AI Grader (Rekomendasi Di Linux OS)

```powershell
.\.venv\Scripts\activate
cd grader-ai
python ollama_auto_grader.py
```

## 📝 Catatan Pengembangan

### Backend

- API documentation tersedia di `/docs` endpoint
- Semua secret keys harus disimpan di `.env` (jangan commit!)
- Gunakan virtual environment untuk isolasi dependencies
- Tambahkan dependencies baru ke `requirements.txt`

### Frontend

- Gunakan React Query untuk data fetching
- Komponen reusable tersedia di folder `src/components`
- API client configuration di `src/lib/api-client.ts`

### AI Grader

- Pastikan Ollama service sudah running
- Model dapat disesuaikan di konfigurasi
- Benchmark model tersedia di `similarity_model_benchmark.py`

---

**Last Updated:** October 2025
