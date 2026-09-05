import { useState, useEffect, useCallback } from 'react';
import { fetchHistory } from '../services/api';
import type { HistoryPoint, HistoryRange } from '../types';

export function useHistory(initialRange: HistoryRange = '24h', zoneId = 'A1') {
  const [history, setHistory]   = useState<HistoryPoint[]>([]);
  const [range, setRange]       = useState<HistoryRange>(initialRange);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async (r: HistoryRange, z: string) => {
    setLoading(true);
    try {
      const data = await fetchHistory(r, z);
      setHistory(data);
      setError(null);
    } catch {
      setError('Gagal memuat riwayat sensor');
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
