import ZoneDetailTable from '../components/ZoneDetailTable';
import type { Zone } from '../types';

interface MonitoringProps {
  zones: Zone[];
  setpoint: number;
  onToggle: (id: string) => void;
  onToggleMobileMenu: () => void;
}

export default function Monitoring({ zones, setpoint, onToggle, onToggleMobileMenu }: MonitoringProps) {
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
            <h1>Monitoring Zona</h1>
            <p>Kontrol manual &amp; status penyiraman otomatis tiap titik sensor.</p>
          </div>
        </div>
      </div>
      <ZoneDetailTable zones={zones} setpoint={setpoint} onToggle={onToggle} />
    </section>
  );
}
