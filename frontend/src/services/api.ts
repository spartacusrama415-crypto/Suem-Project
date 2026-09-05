import axios from 'axios';
import type {
  Zone, AppSettings, HistoryPoint,
  CalendarData, WeekSummary, HistoryRange,
} from '../types';

const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Zones ───────────────────────────────────────
export const fetchZones = (): Promise<Zone[]> =>
  api.get<Zone[]>('/api/zones').then(r => r.data);

export const patchZone = (id: string, patch: Partial<Zone>): Promise<Zone> =>
  api.patch<Zone>(`/api/zones/${id}`, patch).then(r => r.data);

// ── History ─────────────────────────────────────
export const fetchHistory = (range: HistoryRange = '24h', zone_id = 'A1'): Promise<HistoryPoint[]> =>
  api.get<HistoryPoint[]>('/api/history', { params: { range, zone_id } }).then(r => r.data);

export const fetchCalendar = (year: number, month: number): Promise<CalendarData> =>
  api.get<CalendarData>('/api/history/calendar', { params: { year, month } }).then(r => r.data);

export const fetchWeekSummary = (): Promise<WeekSummary> =>
  api.get<WeekSummary>('/api/history/week-summary').then(r => r.data);

// ── Settings ────────────────────────────────────
export const fetchSettings = (): Promise<AppSettings> =>
  api.get<AppSettings>('/api/settings').then(r => r.data);

export const saveSettings = (payload: AppSettings): Promise<AppSettings> =>
  api.put<AppSettings>('/api/settings', payload).then(r => r.data);

// ── Health ──────────────────────────────────────
export const fetchHealth = () =>
  api.get('/health').then(r => r.data);

export default api;
