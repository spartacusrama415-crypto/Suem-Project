-- =====================================================
-- SuemProject — Supabase Database Schema
-- Jalankan SQL ini di Supabase SQL Editor
-- =====================================================

-- 1. Tabel zona lahan
CREATE TABLE IF NOT EXISTS zones (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    moisture    INT  NOT NULL DEFAULT 0,
    temp        FLOAT NOT NULL DEFAULT 0,
    auto        BOOLEAN DEFAULT TRUE,
    watering    BOOLEAN DEFAULT FALSE,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel riwayat sensor (timeseries)
CREATE TABLE IF NOT EXISTS sensor_history (
    id          BIGSERIAL PRIMARY KEY,
    zone_id     TEXT REFERENCES zones(id) ON DELETE CASCADE,
    moisture    INT,
    temp        FLOAT,
    humidity    INT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat berdasarkan waktu
CREATE INDEX IF NOT EXISTS idx_sensor_history_recorded_at
    ON sensor_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_history_zone_id
    ON sensor_history(zone_id, recorded_at DESC);

-- 3. Tabel pengaturan (key-value)
CREATE TABLE IF NOT EXISTS settings (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel log aktivitas
CREATE TABLE IF NOT EXISTS activity_log (
    id          BIGSERIAL PRIMARY KEY,
    zone_id     TEXT,
    action      TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Data awal (seed)
-- =====================================================

-- Zona lahan
INSERT INTO zones (id, name, moisture, temp, auto, watering) VALUES
    ('A1', 'Zona A1 — Petak Utara',  42, 29.4, TRUE,  FALSE),
    ('A2', 'Zona A2 — Petak Timur',  31, 30.1, TRUE,  TRUE),
    ('A3', 'Zona A3 — Petak Selatan',58, 28.6, TRUE,  FALSE),
    ('A4', 'Zona A4 — Petak Barat',  24, 31.0, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Pengaturan default
INSERT INTO settings (key, value) VALUES
    ('setpoint',    '35'),
    ('temp_alert',  '34'),
    ('mode',        'sim'),
    ('esp32_ip',    ''),
    ('humidity',    '68')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Aktifkan RLS pada semua tabel
ALTER TABLE zones          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log   ENABLE ROW LEVEL SECURITY;

-- Policy: service role (backend) bisa akses semua
-- Policy: anon (frontend) hanya bisa READ
CREATE POLICY "anon_read_zones" ON zones
    FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_history" ON sensor_history
    FOR SELECT TO anon USING (true);

CREATE POLICY "anon_read_settings" ON settings
    FOR SELECT TO anon USING (true);

-- Backend (service_role) punya akses penuh — default sudah ada di Supabase