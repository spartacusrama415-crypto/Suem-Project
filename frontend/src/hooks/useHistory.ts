import { useState, useEffect, useCallback } from 'react';
import { fetchHistory } from '../services/api';
import type { HistoryPoint, HistoryRange } from '../types';

/** Buat 24 titik data awal agar chart tidak kosong saat pertama load */
function generateSeedHistory(): HistoryPoint[] {
  const now = Date.now();
  let m = 42, t = 29;
  return Array.from({ length: 24 }, (_, i) => {
    m = Math.max(20, Math.min(80, m + (Math.random() - 0.5) * 4));
    t = Math.max(25, Math.min(36, t + (Math.random() - 0.5) * 0.4));
    return {
      zone_id: 'A1',
      moisture: Math.round(m),
      temp:     parseFloat(t.toFixed(1)),
      humidity: 65,
      recorded_at: new Date(now - (23 - i) * 60 * 60 * 1000).toISOString(),
    };
  });
}

export function useHistory(initialRange: HistoryRange = '24h', zoneId = 'A1') {
  const [history, setHistory]   = useState<HistoryPoint[]>(generateSeedHistory());
  const [range, setRange]       = useState<HistoryRange>(initialRange);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (r: HistoryRange, z: string) => {
    setLoading(true);
    try {
      const data = await fetchHistory(r, z);
      // Gunakan data dari API jika ada, fallback ke seed jika kosong
      if (data && data.length > 0) {
        setHistory(data);
      }
      setError(null);
    } catch {
      setError('Gagal memuat riwayat sensor');
      // Biarkan seed data tetap tampil jika API gagal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(range, zoneId); }, [range, zoneId, load]);

  const changeRange = (r: HistoryRange) => setRange(r);

  /** Tambahkan satu titik baru dari WebSocket */
  const pushPoint = useCallback((point: HistoryPoint) => {
    setHistory(prev => {
      const next = [...prev, point];
      // Batasi 48 titik (sama seperti index.html)
      return next.length > 48 ? next.slice(next.length - 48) : next;
    });
  }, []);

  return { history, range, loading, error, changeRange, pushPoint };
}

