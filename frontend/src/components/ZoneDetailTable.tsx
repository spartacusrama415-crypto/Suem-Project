import type { Zone } from '../types';

interface ZoneDetailTableProps {
  zones: Zone[];
  setpoint: number;
  onToggle: (zoneId: string) => void;
}

function barColor(moisture: number, setpoint: number) {
  if (moisture < setpoint) return '#EF4444';
  if (moisture < setpoint + 12) return 'var(--sun-dark)';
  return 'var(--leaf-dark)';
}

export default function ZoneDetailTable({ zones, setpoint, onToggle }: ZoneDetailTableProps) {
  return (
    <div className="panel reveal">
      <div className="panel-head">
        <div>
          <div className="panel-title">Peta Zona Lahan</div>
          <div className="panel-title-sub">
            Sentuh sakelar untuk menyalakan/mematikan penyiraman manual pada zona tertentu
          </div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Kelembaban tanah</th>
            <th>Suhu</th>
            <th>Penyiraman</th>
            <th>Mode</th>
            <th>Kontrol manual</th>
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
                  <div>{z.name}</div>
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
              <td className="num">{z.temp.toFixed(1)}°C</td>
              <td>
                {z.watering
                  ? <span className="badge-pill on"><span className="dot" />Menyiram</span>
                  : <span className="badge-pill off"><span className="dot" />Mati</span>}
              </td>
              <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                {z.auto ? `Otomatis (setpoint ${setpoint}%)` : 'Manual'}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    className={`switch${z.watering ? ' on' : ''} press`}
                    onClick={() => onToggle(z.id)}
                  />
                  <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                    {z.auto ? 'nonaktifkan auto untuk kontrol manual' : 'kontrol manual aktif'}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
