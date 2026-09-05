import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import type { HistoryPoint, HistoryRange } from '../types';

interface TrendChartProps {
  history: HistoryPoint[];
  range: HistoryRange;
  onRangeChange: (r: HistoryRange) => void;
}

const RANGES: { label: string; value: HistoryRange }[] = [
  { label: '24 Jam', value: '24h' },
  { label: '7 Hari',  value: '7d' },
  { label: '30 Hari', value: '30d' },
];

export default function TrendChart({ history, range, onRangeChange }: TrendChartProps) {
  const [showMoisture, setShowMoisture] = useState(true);
  const [showTemp,     setShowTemp]     = useState(true);

  const chartData = history.map(p => ({
    time: new Date(p.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    moisture: p.moisture,
    temp: p.temp,
  }));

  return (
    <div className="panel reveal" style={{ animationDelay: '.1s' }}>
      <div className="panel-head">
        <div>
          <div className="panel-title">Tren Sensor</div>
          <div className="panel-title-sub">Kelembaban tanah &amp; suhu udara dari data ESP32</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div className="toggle-group">
            <button
              className={`toggle-chip${showMoisture ? ' active moisture' : ''} press`}
              onClick={() => setShowMoisture(v => !v)}
            >
              <span className="swatch" style={{ background: 'var(--leaf-dark)' }} />
              Kelembaban tanah
            </button>
            <button
              className={`toggle-chip${showTemp ? ' active temp' : ''} press`}
              onClick={() => setShowTemp(v => !v)}
            >
              <span className="swatch" style={{ background: 'var(--sun)' }} />
              Suhu udara
            </button>
          </div>
          <div className="range-select">
            {RANGES.map(r => (
              <button
                key={r.value}
                className={`press${range === r.value ? ' active' : ''}`}
                onClick={() => onRangeChange(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF6F0" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#5E7568', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              domain={[0, 100]}
              tick={{ fill: '#5E7568', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[15, 45]}
              tick={{ fill: '#5E7568', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: '#07211A',
                border: 'none',
                borderRadius: 8,
                color: '#EAF6EF',
                fontSize: 12,
                padding: '10px 14px',
              }}
            />
            {showMoisture && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="moisture"
                stroke="#059669"
                strokeWidth={2.8}
                dot={false}
                name="Kelembaban tanah (%)"
                animationDuration={700}
              />
            )}
            {showTemp && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temp"
                stroke="#E6A700"
                strokeWidth={2.8}
                dot={false}
                name="Suhu udara (°C)"
                animationDuration={700}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
