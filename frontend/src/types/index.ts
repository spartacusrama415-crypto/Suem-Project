// =====================================================
// Global TypeScript types — SuemProject
// =====================================================

export interface Zone {
  id: string;
  name: string;
  moisture: number;
  temp: number;
  auto: boolean;
  watering: boolean;
  updated_at?: string;
}

export interface AppSettings {
  setpoint: number;
  temp_alert: number;
  mode: 'sim' | 'live';
  esp32_ip: string;
  humidity: number;
}

export interface HistoryPoint {
  recorded_at: string;
  moisture: number;
  temp: number;
  humidity?: number;
  zone_id: string;
}

export interface CalendarDay {
  moisture: number;
  temp: number;
  cycles: number;
}

export type CalendarData = Record<string, CalendarDay>;

export interface WeekSummary {
  avg_moisture: number | null;
  avg_temp: number | null;
  total_cycles: number;
}

export interface SensorLatest {
  moisture: number;
  temp: number;
  humidity: number;
  zone_id: string;
  recorded_at?: string;
}

export type HistoryRange = '24h' | '7d' | '30d';

// WebSocket message types
export type WsMessage =
  | { type: 'live_update'; zones: Zone[]; humidity: number; setpoint: number; timestamp: string }
  | { type: 'esp32_update'; zone_id: string; moisture: number; temp: number; humidity: number; connected: boolean; timestamp: string }
  | { type: 'esp32_status'; connected: boolean; esp32_ip: string; timestamp: string }
  | { type: 'ingest_update'; zone_id: string; moisture: number; temp: number; humidity: number; timestamp: string };
