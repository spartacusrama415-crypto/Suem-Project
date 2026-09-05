

type View = 'overview' | 'monitoring' | 'history' | 'settings';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  esp32Connected: boolean;
  esp32Label: string;
}

export default function Sidebar({ currentView, onNavigate, esp32Connected, esp32Label }: SidebarProps) {
  return (
    <aside className="sidebar" id="sidebarEl">
      <div className="brand">
        <div className="brand-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 22V12M12 12C12 7 8 4 3 4C3 9 6 12 12 12ZM12 12C12 7 16 4 21 4C21 9 18 12 12 12Z"
              stroke="#07211A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>SuemProject<small>Smart Farm Monitor</small></div>
      </div>

      <div className="nav-label">Menu Utama</div>

      {([
        { view: 'overview', label: 'Ringkasan', icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" /><rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" /></svg>) },
        { view: 'monitoring', label: 'Monitoring Zona', icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2C7 2 4 6 4 10.5C4 15 8 19 12 22C16 19 20 15 20 10.5C20 6 17 2 12 2Z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="10.5" r="2.5" stroke="currentColor" strokeWidth="2" /></svg>) },
        { view: 'history', label: 'Riwayat & Kalender', icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M3 9H21M8 2V6M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>) },
        { view: 'settings', label: 'Pengaturan & ESP32', icon: (<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.6" /></svg>) },
      ] as { view: View; label: string; icon: JSX.Element }[]).map(item => (
        <div
          key={item.view}
          className={`nav-item press ${currentView === item.view ? 'active' : ''}`}
          onClick={() => onNavigate(item.view)}
        >
          {item.icon}
          <span>{item.label}</span>
        </div>
      ))}

      <div className="nav-label">Lahan</div>
      <div className="nav-item" style={{ opacity: 0.6 }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d="M4 21V9L12 3L20 9V21H4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        <span>Lahan Padi — Blok A</span>
      </div>

      <div className="sidebar-foot">
        <div className="esp-pill">
          <span className={`dot-live${esp32Connected ? '' : ' off'}`} />
          <span>{esp32Label}</span>
        </div>
        <div className="sidebar-promo">
          <span className="bubble" style={{ left: '20%', width: 8, height: 8, animationDelay: '0s' }} />
          <span className="bubble" style={{ left: '55%', width: 5, height: 5, animationDelay: '.9s' }} />
          <span className="bubble" style={{ left: '75%', width: 7, height: 7, animationDelay: '1.6s' }} />
          <h4>Unduh Aplikasi SuemProject</h4>
          <p>Pantau lahanmu dari mana saja</p>
          <button className="btn-promo press">Unduh Sekarang</button>
        </div>
      </div>
    </aside>
  );
}
