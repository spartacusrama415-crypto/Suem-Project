import type { Zone, AppSettings } from '../types';

interface RecommendationCardProps {
  zones: Zone[];
  settings: AppSettings;
  onOpenMonitoring: () => void;
}

interface RecItem {
  type: 'urgent' | 'watch' | 'info';
  text: string;
}

export default function RecommendationCard({ zones, settings, onOpenMonitoring }: RecommendationCardProps) {
  const { setpoint, temp_alert, humidity } = settings;
  const items: RecItem[] = [];

  zones.forEach(z => {
    if (z.moisture < setpoint) {
      items.push({
        type: 'urgent',
        text: `<b>${z.name}</b> berada di ${z.moisture}%, di bawah setpoint ${setpoint}%. Sistem sudah menjalankan penyiraman otomatis.`,
      });
    } else if (z.moisture < setpoint + 12) {
      items.push({
        type: 'watch',
        text: `<b>${z.name}</b> mendekati ambang kering (${z.moisture}%). Pantau 1–2 jam ke depan.`,
      });
    }
    if (z.temp > temp_alert) {
      items.push({
        type: 'urgent',
        text: `Suhu di <b>${z.name}</b> mencapai ${z.temp.toFixed(1)}°C, melebihi batas ${temp_alert}°C.`,
      });
    }
  });

  if (items.length === 0) {
    items.push({
      type: 'info',
      text: 'Semua zona dalam kondisi kelembaban dan suhu optimal. Tidak ada tindakan mendesak.',
    });
  }

  items.push({
    type: 'info',
    text: `Rata-rata kelembaban udara ${humidity}% — kondisi ${humidity > 60
      ? 'lembap, baik untuk mengurangi frekuensi penyiraman'
      : 'kering, evaporasi lebih cepat'}.`,
  });

  return (
    <div className="rec-card reveal" style={{ animationDelay: '.18s' }}>
      <div className="panel-title">Rekomendasi Tindakan</div>
      <div>
        {items.slice(0, 4).map((it, i) => (
          <div key={i} className="rec-item">
            <div className={`rec-dot ${it.type}`} />
            <div className="rec-text" dangerouslySetInnerHTML={{ __html: it.text }} />
          </div>
        ))}
      </div>
      <button className="rec-cta press" onClick={onOpenMonitoring}>
        Buka kontrol penyiraman
      </button>
    </div>
  );
}
