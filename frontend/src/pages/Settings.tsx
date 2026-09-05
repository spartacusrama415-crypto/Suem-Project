import SettingsPanel from '../components/SettingsPanel';
import type { AppSettings } from '../types';

interface SettingsProps {
  onSettingsChange: (s: AppSettings) => void;
  onToggleMobileMenu: () => void;
}

export default function Settings({ onSettingsChange, onToggleMobileMenu }: SettingsProps) {
  return (
    <section className="view active">
      <div className="page-head reveal">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="mobile-menu-toggle press" onClick={onToggleMobileMenu}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1>Pengaturan &amp; Integrasi ESP32</h1>
            <p>Atur ambang batas penyiraman otomatis dan sumber data sensor.</p>
          </div>
        </div>
      </div>
      <SettingsPanel onSettingsChange={onSettingsChange} />
    </section>
  );
}
