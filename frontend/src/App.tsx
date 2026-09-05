import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Monitoring from './pages/Monitoring';
import History from './pages/History';
import Settings from './pages/Settings';
import { useZones } from './hooks/useZones';
import { useHistory } from './hooks/useHistory';
import { useWebSocket } from './hooks/useWebSocket';
import type { AppSettings, Zone } from './types';

type View = 'overview' | 'monitoring' | 'history' | 'settings';

export default function App() {
  const [view, setView]               = useState<View>('overview');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [settings, setSettings]       = useState<AppSettings>({
    setpoint: 35, temp_alert: 34, mode: 'sim', esp32_ip: '', humidity: 68,
  });
  const [esp32Label, setEsp32Label]   = useState('ESP32 tersambung · Blok A');

  const { zones, toggleZone, updateZones, updateZone } = useZones();
  const { history, range, changeRange, pushPoint } = useHistory();

  // WebSocket: terima update real-time dari backend
  const handleZoneUpdate = useCallback((newZones: Zone[], humidity: number, setpoint: number) => {
    updateZones(newZones);
    setSettings(s => ({ ...s, humidity, setpoint }));
    if (newZones[0]) {
      pushPoint({
        zone_id: newZones[0].id,
        moisture: newZones[0].moisture,
        temp: newZones[0].temp,
        humidity,
        recorded_at: new Date().toISOString(),
      });
    }
  }, [updateZones, pushPoint]);

  const handleEsp32Status = useCallback((connected: boolean, ip?: string) => {
    if (connected && ip) {
      setEsp32Label(`ESP32 tersambung · ${ip}`);
    } else if (!connected) {
      setEsp32Label('ESP32 tidak terjangkau');
    }
  }, []);

  const handleIngestUpdate = useCallback((zoneId: string, moisture: number, temp: number, humidity: number, timestamp: string) => {
    pushPoint({
      zone_id: zoneId,
      moisture,
      temp,
      humidity,
      recorded_at: timestamp,
    });
    setSettings(s => ({ ...s, humidity }));
    updateZone(zoneId, moisture, temp);
  }, [pushPoint, updateZone]);

  const { connected: wsConnected, esp32Ok } = useWebSocket({
    onZoneUpdate: handleZoneUpdate,
    onEsp32Status: handleEsp32Status,
    onIngestUpdate: handleIngestUpdate,
  });

  const toggleMobileMenu = () => {
    setMobileOpen(v => !v);
    document.getElementById('sidebarEl')?.classList.toggle('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
  };

  const navigate = (v: View) => {
    setView(v);
    if (mobileOpen) toggleMobileMenu();
  };

  const isEsp32Live = settings.mode === 'live' ? esp32Ok : wsConnected;

  return (
    <div className="app">
      <Sidebar
        currentView={view}
        onNavigate={navigate}
        esp32Connected={isEsp32Live}
        esp32Label={esp32Label}
      />

      {/* Mobile overlay */}
      <div
        id="sidebarOverlay"
        className="sidebar-overlay"
        onClick={toggleMobileMenu}
      />

      <main className="main">
        {view === 'overview' && (
          <Overview
            zones={zones}
            settings={settings}
            history={history}
            range={range}
            onRangeChange={changeRange}
            onNavigateMonitoring={() => navigate('monitoring')}
            onToggleMobileMenu={toggleMobileMenu}
          />
        )}
        {view === 'monitoring' && (
          <Monitoring
            zones={zones}
            setpoint={settings.setpoint}
            onToggle={toggleZone}
            onToggleMobileMenu={toggleMobileMenu}
          />
        )}
        {view === 'history' && (
          <History
            setpoint={settings.setpoint}
            onToggleMobileMenu={toggleMobileMenu}
          />
        )}
        {view === 'settings' && (
          <Settings
            onSettingsChange={s => setSettings(s)}
            onToggleMobileMenu={toggleMobileMenu}
          />
        )}
      </main>
    </div>
  );
}
