# SuemProject — Smart Farm Monitor

Dashboard monitoring lahan pertanian berbasis IoT dengan ESP32, Supabase, React, dan FastAPI.

## Arsitektur

```
ESP32 → Backend (FastAPI) → Supabase (PostgreSQL)
                         ↕ WebSocket
                    Frontend (React + Vite)
```

---

## 🚀 Cara Menjalankan

### 1. Setup Database Supabase

1. Buka [supabase.com](https://supabase.com) → buat project baru
2. Masuk ke **SQL Editor** → paste isi file `backend/supabase_schema.sql` → **Run**
3. Catat `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` dari **Project Settings → API**

---

### 2. Backend (Python FastAPI)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Salin .env.example menjadi .env dan isi credential
copy .env.example .env
# Edit .env dengan Supabase URL dan keys Anda

# Jalankan server
python run.py
# Server berjalan di http://localhost:8000
# Docs API: http://localhost:8000/docs
```

---

### 3. Frontend (React + Vite)

> **Prasyarat**: [Node.js](https://nodejs.org) versi 18 atau lebih baru

```bash
cd frontend

# Salin .env.example menjadi .env dan isi
copy .env.example .env
# VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus diisi

# Install dependencies
npm install

# Jalankan dev server
npm run dev
# Buka http://localhost:5173
```

---

## 📁 Struktur Project

```
PROJECT SUEM/
├── index.html              ← File asli (referensi)
├── .gitignore
├── README.md
│
├── backend/
│   ├── app/
│   │   ├── main.py         ← FastAPI entry + WebSocket
│   │   ├── config.py       ← Env settings
│   │   ├── models/
│   │   │   └── schemas.py  ← Pydantic models
│   │   ├── routers/
│   │   │   ├── zones.py
│   │   │   ├── sensor.py
│   │   │   ├── history.py
│   │   │   └── settings.py
│   │   ├── services/
│   │   │   ├── supabase_client.py
│   │   │   ├── simulator.py      ← Simulasi sensor (5 detik)
│   │   │   └── esp32_poller.py   ← Polling ESP32 langsung
│   │   └── ws/
│   │       └── manager.py        ← WebSocket broadcast
│   ├── supabase_schema.sql ← Jalankan di Supabase SQL Editor
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
│
└── frontend/
    ├── src/
    │   ├── components/     ← UI components (Sidebar, Chart, dll)
    │   ├── pages/          ← 4 halaman (Overview, Monitoring, History, Settings)
    │   ├── hooks/          ← useZones, useHistory, useWebSocket
    │   ├── services/       ← api.ts (Axios), supabase.ts
    │   ├── types/          ← TypeScript interfaces
    │   ├── styles/         ← index.css (design system lengkap)
    │   ├── App.tsx
    │   └── main.tsx
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```

---

## 🔒 Keamanan Data

| Aspek | Implementasi |
|-------|-------------|
| Supabase credentials | Disimpan di `.env`, tidak pernah di-commit |
| RLS (Row Level Security) | Aktif — anon key hanya bisa READ |
| Backend write access | Menggunakan service_role key |
| ESP32 ingest | Dilindungi `X-API-Key` header |
| CORS | Hanya mengizinkan origin frontend |
| Input validation | Semua data divalidasi Pydantic |

---

## 🔌 Integrasi ESP32

### Mode Simulasi (default)
Backend otomatis mensimulasikan data sensor setiap 5 detik. Tidak perlu hardware.

### Mode Live (ESP32 fisik)
1. Upload firmware dari halaman **Pengaturan & ESP32** ke ESP32 Anda
2. ESP32 harus terhubung ke Wi-Fi yang sama dengan server backend
3. Di halaman Pengaturan → pilih **Sambungkan ESP32** → masukkan IP → Simpan

ESP32 juga bisa kirim data langsung ke backend:
```
POST http://localhost:8000/api/sensor/ingest
Header: X-API-Key: <API_SECRET_KEY dari .env>
Body: {"moisture": 42, "temp": 29.4, "humidity": 68, "zone_id": "A1"}
```

---

## 📊 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/zones` | Semua zona |
| PATCH | `/api/zones/{id}` | Update zona |
| GET | `/api/sensor/latest` | Data terbaru |
| POST | `/api/sensor/ingest` | Ingest dari ESP32 |
| GET | `/api/history?range=24h` | Riwayat sensor |
| GET | `/api/history/calendar?year=2026&month=9` | Data kalender |
| GET | `/api/history/week-summary` | Ringkasan 7 hari |
| GET | `/api/settings` | Pengaturan |
| PUT | `/api/settings` | Simpan pengaturan |
| WS | `/ws/live` | Real-time stream |
| GET | `/health` | Status backend |

Dokumentasi interaktif: `http://localhost:8000/docs`
