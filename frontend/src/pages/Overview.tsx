import HeroCard from '../components/HeroCard';
import StatCard from '../components/StatCard';
import TrendChart from '../components/TrendChart';
import ZoneTable from '../components/ZoneTable';
import RecommendationCard from '../components/RecommendationCard';
import type { Zone, AppSettings, HistoryPoint, HistoryRange } from '../types';

interface OverviewProps {
  zones: Zone[];
  settings: AppSettings;
  history: HistoryPoint[];
  range: HistoryRange;
  onRangeChange: (r: HistoryRange) => void;
  onNavigateMonitoring: () => void;
  onToggleMobileMenu: () => void;
}

export default function Overview({
  zones, settings, history, range, onRangeChange,
  onNavigateMonitoring, onToggleMobileMenu,
}: OverviewProps) {
  const mainZone = zones[0];
  const prevTemp = mainZone ? mainZone.temp - 0.6 : 0;
  const prevHum  = settings.humidity + 3;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <section className="view active">
      {/* Topbar */}
      <div className="topbar reveal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="mobile-menu-toggle press" onClick={onToggleMobileMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="greeting">
            <div className="greeting-ic">🌱</div>
            <div>
              <h2>Selamat datang kembali, Pak Slamet</h2>
              <p>{dateLabel}</p>
            </div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="icon-btn press">🔍</div>
          <div className="icon-btn press">🔔<span className="dot-alert" /></div>
          <div className="profile">
            <div className="avatar" />
            <div>
              <div className="name">Pak Slamet</div>
              <div className="role">Pengelola lahan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Head */}
      <div className="page-head reveal" style={{ animationDelay: '.05s' }}>
        <div>
          <h1>
            Ringkasan Lahan{' '}
            <span className="live-chip"><span className="live-dot" /> Live</span>
          </h1>
          <p>Pantau kelembaban tanah dan suhu secara real-time untuk pengambilan keputusan penyiraman.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary press" onClick={onNavigateMonitoring}>＋ Kontrol Zona</button>
          <button className="btn btn-ghost press">⬇️ Ekspor Data</button>
        </div>
      </div>

      {/* Hero Row */}
      {mainZone && (
        <div className="hero-row">
          <HeroCard zone={mainZone} setpoint={settings.setpoint} />
          <StatCard
            icon="🌡️"
            iconClass="temp"
            label="Suhu udara (DHT22)"
            value={`${mainZone.temp.toFixed(1)}°C`}
            delta={`▲ ${Math.abs(mainZone.temp - prevTemp).toFixed(1)}°C dari 1 jam lalu`}
          />
          <StatCard
            icon="💧"
            iconClass="humid"
            label="Kelembaban udara (DHT22)"
            value={`${settings.humidity}%`}
            delta={`▼ ${Math.abs(settings.humidity - prevHum)}% dari 1 jam lalu`}
          />
        </div>
      )}

      {/* Content Grid */}
      <div className="content-grid">
        <div>
          <TrendChart history={history} range={range} onRangeChange={onRangeChange} />
          <ZoneTable zones={zones} setpoint={settings.setpoint} />
        </div>
        <div>
          <RecommendationCard
            zones={zones}
            settings={settings}
            onOpenMonitoring={onNavigateMonitoring}
          />
          <div className="panel reveal spot" style={{ animationDelay: '.22s' }}>
            <div className="panel-head">
              <div className="panel-title" style={{ fontSize: 15 }}>Sumber Data</div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Sensor: <b style={{ color: 'var(--text)' }}>Soil Moisture Capacitive v2.0</b> &amp;{' '}
              <b style={{ color: 'var(--text)' }}>DHT22</b><br />
              Mikrokontroler: <b style={{ color: 'var(--text)' }}>ESP32 DevKit</b><br />
              Mode koneksi:{' '}
              <span>{settings.mode === 'live'
                ? `Langsung dari ESP32${settings.esp32_ip ? ' · ' + settings.esp32_ip : ''}`
                : 'Simulasi (demo)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
