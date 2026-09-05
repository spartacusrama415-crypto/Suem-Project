import { useState, useEffect, useCallback } from 'react';
import { fetchCalendar, fetchWeekSummary } from '../services/api';
import type { CalendarData, WeekSummary } from '../types';

const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

interface CalendarViewProps {
  setpoint: number;
}

export default function CalendarView({ setpoint }: CalendarViewProps) {
  const now = new Date();
  const [calDate, setCalDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [calData, setCalData] = useState<CalendarData>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [weekSummary, setWeekSummary] = useState<WeekSummary | null>(null);

  const loadCalendar = useCallback(async () => {
    try {
      const data = await fetchCalendar(calDate.getFullYear(), calDate.getMonth() + 1);
      setCalData(data);
    } catch { /* keep existing */ }
  }, [calDate]);

  const loadWeekSummary = useCallback(async () => {
    try {
      const data = await fetchWeekSummary();
      setWeekSummary(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadCalendar(); }, [loadCalendar]);
  useEffect(() => { loadWeekSummary(); }, [loadWeekSummary]);

  const changeMonth = (delta: number) => {
    setCalDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
    setSelectedDay(null);
  };

  const firstDay    = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const isCurrentMonth =
    now.getFullYear() === calDate.getFullYear() && now.getMonth() === calDate.getMonth();

  const dotColor = (day: number) => {
    const d = calData[String(day)];
    if (!d) return 'var(--line)';
    if (d.moisture < setpoint) return '#EF4444';
    if (d.moisture < setpoint + 12) return '#E6A700';
    return '#059669';
  };

  const selected = selectedDay ? calData[String(selectedDay)] : null;
  const selectedLabel = selectedDay
    ? new Date(calDate.getFullYear(), calDate.getMonth(), selectedDay)
        .toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <div className="content-grid">
      <div className="panel reveal">
        {/* Calendar Header */}
        <div className="cal-head">
          <div className="panel-title" id="calMonthLabel">
            {calDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </div>
          <div className="cal-nav">
            <button className="press" onClick={() => changeMonth(-1)}>‹</button>
            <button className="press" onClick={() => changeMonth(1)}>›</button>
          </div>
        </div>

        {/* Day of week headers */}
        <div className="cal-grid">
          {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        </div>

        {/* Day cells */}
        <div className="cal-grid" style={{ marginTop: 6 }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} className="cal-cell blank" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = isCurrentMonth && day === now.getDate();
            const isSelected = day === selectedDay;
            return (
              <div
                key={day}
                className={`cal-cell${isToday ? ' today' : ''}${isSelected && !isToday ? ' selected' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <span>{day}</span>
                <span className="cdot" style={{ background: dotColor(day) }} />
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="legend-row">
          <div className="legend-item"><span className="cdot" style={{ background: 'var(--leaf-dark)' }} />Kelembaban optimal</div>
          <div className="legend-item"><span className="cdot" style={{ background: 'var(--sun-dark)' }} />Perlu diperhatikan</div>
          <div className="legend-item"><span className="cdot" style={{ background: 'var(--red)' }} />Kering / di bawah setpoint</div>
        </div>

        {/* Day detail */}
        {selected && (
          <div className="day-detail">
            <div className="day-detail-item"><div className="label">{selectedLabel}</div></div>
            <div className="day-detail-item">
              <div className="label">Rata-rata kelembaban</div>
              <div className="value">{selected.moisture}%</div>
            </div>
            <div className="day-detail-item">
              <div className="label">Rata-rata suhu</div>
              <div className="value">{selected.temp}°C</div>
            </div>
            <div className="day-detail-item">
              <div className="label">Siklus penyiraman</div>
              <div className="value">{selected.cycles}×</div>
            </div>
          </div>
        )}
      </div>

      {/* Week summary panel */}
      <div className="panel reveal">
        <div className="panel-title" style={{ marginBottom: 12 }}>Catatan Panen &amp; Tindakan</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.7 }}>
          Klik salah satu tanggal untuk melihat rata-rata kelembaban tanah, suhu udara, dan jumlah
          siklus penyiraman otomatis pada hari itu.
        </div>
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 8 }}>Ringkasan 7 hari terakhir</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span>Rata-rata kelembaban</span>
            <b>{weekSummary?.avg_moisture != null ? `${weekSummary.avg_moisture}%` : '—'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span>Rata-rata suhu</span>
            <b>{weekSummary?.avg_temp != null ? `${weekSummary.avg_temp}°C` : '—'}</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0' }}>
            <span>Total siklus siram</span>
            <b>{weekSummary != null ? `${weekSummary.total_cycles}×` : '—'}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
