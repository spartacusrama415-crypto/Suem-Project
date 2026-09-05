import CalendarView from '../components/CalendarView';

interface HistoryProps {
  setpoint: number;
  onToggleMobileMenu: () => void;
}

export default function History({ setpoint, onToggleMobileMenu }: HistoryProps) {
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
            <h1>Riwayat &amp; Kalender Sensor</h1>
            <p>Rekap harian kelembaban tanah dan suhu untuk melihat pola dan mengambil keputusan tanam.</p>
          </div>
        </div>
      </div>
      <CalendarView setpoint={setpoint} />
    </section>
  );
}
