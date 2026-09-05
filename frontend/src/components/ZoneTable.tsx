import type { Zone } from '../types';

interface ZoneTableProps {
  zones: Zone[];
  setpoint: number;
}

function barColor(moisture: number, setpoint: number) {
  if (moisture < setpoint) return '#EF4444';
  if (moisture < setpoint + 12) return 'var(--sun-dark)';
  return 'var(--leaf-dark)';
}

export default function ZoneTable({ zones, setpoint }: ZoneTableProps) {
  return (
    <div className="panel reveal" style={{ animationDelay: '.14s' }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Aktivitas Lapangan Saat Ini</div>
          <div className="panel-title-sub">Status penyiraman otomatis per zona, langsung dari ESP32</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Kelembaban</th>
            <th>Status</th>
            <th>Aksi terakhir</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {zones.map(z => (
            <tr key={z.id}>
              <td>
                <div className="zone-name">
                  <div className={`zone-icon${z.watering ? ' on' : ''}`}>
                    {z.watering ? '💧' : '🌱'}
                  </div>
                  <div>
                    <div>{z.name}</div>
                    <div className="zone-sub">{z.temp.toFixed(1)}°C</div>
                  </div>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="num">{z.moisture}%</span>
                  <div className="mini-bar">
                    <div
                      className="mini-bar-fill"
                      style={{ width: `${z.moisture}%`, background: barColor(z.moisture, setpoint) }}
                    />
                  </div>
                </div>
              </td>
              <td>
                {z.watering
                  ? <span className="badge-pill on"><span className="dot" />Menyiram</span>
                  : <span className="badge-pill off"><span className="dot" />Siaga</span>}
              </td>
              <td className="zone-sub">
                {z.watering
                  ? 'Dimulai otomatis'
                  : z.moisture < setpoint + 12 ? 'Dipantau ketat' : 'Tidak ada aksi'}
              </td>
              <td style={{ textAlign: 'right', color: 'var(--muted)', fontSize: 12 }}>
                {z.auto ? 'Otomatis' : 'Manual'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
