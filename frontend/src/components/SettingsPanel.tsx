import { useState, useEffect } from 'react';
import { fetchSettings, saveSettings } from '../services/api';
import type { AppSettings } from '../types';

const FIRMWARE_EXAMPLE = `#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
 
#define SOIL_PIN 34
#define DHT_PIN  4
DHT dht(DHT_PIN, DHT22);
WebServer server(80);
 
void handleData() {
  int raw = analogRead(SOIL_PIN);
  int moisture = map(raw, 4095, 1200, 0, 100);
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
 
  String json = "{\\"moisture\\":" + String(moisture) +
                ",\\"temp\\":" + String(temp) +
                ",\\"humidity\\":" + String(hum) + "}";
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}
 
void setup() {
  dht.begin();
  WiFi.begin("NAMA_WIFI", "PASSWORD_WIFI");
  while (WiFi.status() != WL_CONNECTED) delay(300);
  server.on("/data", handleData);
  server.begin();
}
 
void loop() { server.handleClient(); }`;

interface SettingsPanelProps {
  onSettingsChange: (s: AppSettings) => void;
}

export default function SettingsPanel({ onSettingsChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<AppSettings>({
    setpoint: 35, temp_alert: 34, mode: 'sim', esp32_ip: '', humidity: 68,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings()
      .then(s => { setSettings(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const updated = await saveSettings(settings);
      setSettings(updated);
      onSettingsChange(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    } catch {
      alert('Gagal menyimpan pengaturan. Pastikan backend berjalan.');
    }
  };

  if (loading) return <div style={{ padding: 32, color: 'var(--muted)' }}>Memuat pengaturan…</div>;

  return (
    <div className="content-grid">
      {/* Left panel — thresholds */}
      <div className="panel reveal">
        <div className="panel-title" style={{ marginBottom: 16 }}>Ambang Batas Penyiraman Otomatis</div>

        <div className="form-row">
          <label>Nyalakan penyiraman ketika kelembaban tanah di bawah</label>
          <div className="slider-row">
            <input
              type="range" min={10} max={70} value={settings.setpoint}
              onChange={e => setSettings(s => ({ ...s, setpoint: +e.target.value }))}
            />
            <div className="slider-value">{settings.setpoint}%</div>
          </div>
          <div className="hint">
            Zona akan otomatis disiram saat pembacaan sensor soil moisture berada di bawah angka
            ini, dan berhenti otomatis begitu kembali di atasnya.
          </div>
        </div>

        <div className="form-row">
          <label>Batas suhu peringatan (°C)</label>
          <div className="slider-row">
            <input
              type="range" min={25} max={42} value={settings.temp_alert}
              onChange={e => setSettings(s => ({ ...s, temp_alert: +e.target.value }))}
            />
            <div className="slider-value">{settings.temp_alert}°</div>
          </div>
          <div className="hint">
            Dashboard akan menandai peringatan bila suhu udara melampaui batas ini.
          </div>
        </div>

        <button className="save-btn press" onClick={handleSave}>
          {saved ? 'Tersimpan ✓' : 'Simpan pengaturan'}
        </button>
      </div>

      {/* Right panel — data source */}
      <div className="panel reveal">
        <div className="panel-title" style={{ marginBottom: 16 }}>Sumber Data Sensor</div>

        <div className="radio-row" style={{ marginBottom: 18 }}>
          <div
            className={`radio-opt${settings.mode === 'sim' ? ' selected' : ''}`}
            onClick={() => setSettings(s => ({ ...s, mode: 'sim' }))}
          >
            <div className="r-title">Mode Simulasi</div>
            <div className="r-sub">Untuk demo tanpa perangkat ESP32 fisik</div>
          </div>
          <div
            className={`radio-opt${settings.mode === 'live' ? ' selected' : ''}`}
            onClick={() => setSettings(s => ({ ...s, mode: 'live' }))}
          >
            <div className="r-title">Sambungkan ESP32</div>
            <div className="r-sub">Ambil data langsung dari perangkat di lahan</div>
          </div>
        </div>

        {settings.mode === 'live' && (
          <div className="form-row">
            <label>Alamat IP ESP32 (jaringan lokal)</label>
            <input
              type="text"
              placeholder="192.168.1.45"
              value={settings.esp32_ip}
              onChange={e => setSettings(s => ({ ...s, esp32_ip: e.target.value }))}
            />
            <div className="hint">
              ESP32 harus menjalankan web server yang mengembalikan JSON di endpoint{' '}
              <code>/data</code>, contoh:{' '}
              <code>{'{"moisture":42,"temp":29.4,"humidity":68}'}</code>.
            </div>
          </div>
        )}

        <div className="form-row">
          <label>Contoh kode firmware ESP32 (Arduino)</label>
          <pre>{FIRMWARE_EXAMPLE}</pre>
          <div className="hint">
            Setelah ESP32 tersambung ke Wi-Fi yang sama dengan perangkat yang membuka dashboard ini,
            masukkan alamat IP-nya lalu pilih "Sambungkan ESP32".
          </div>
        </div>
      </div>
    </div>
  );
}
