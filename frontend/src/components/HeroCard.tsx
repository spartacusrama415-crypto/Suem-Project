import type { Zone } from '../types';

interface HeroCardProps {
  zone: Zone;
  setpoint: number;
}

export default function HeroCard({ zone, setpoint }: HeroCardProps) {
  const { moisture } = zone;

  let chipClass = 'status-chip';
  let chipText = '';
  if (moisture < setpoint) {
    chipClass += ' kering';
    chipText = '● Di bawah setpoint — sedang disiram';
  } else if (moisture < setpoint + 12) {
    chipClass += ' waspada';
    chipText = '● Perlu diperhatikan';
  } else {
    chipClass += ' optimal';
    chipText = '● Kondisi optimal';
  }

  // Sparkline sederhana (menggunakan inline SVG)
  return (
    <div className="hero-card reveal spot">
      <div>
        <div className="field-note">Kelembaban tanah rata-rata · Blok A</div>
        <div className="hero-value">
          <span>{moisture}</span>
          <span className="unit">%</span>
        </div>
      </div>
      <div className="hero-status-row">
        <span className={chipClass}>{chipText}</span>
        <span style={{ fontSize: 12, color: '#A9D9BE' }}>
          Setpoint: <b style={{ color: '#fff' }}>{setpoint}%</b>
        </span>
      </div>
    </div>
  );
}
