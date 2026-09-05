import { useState, useEffect, useCallback } from 'react';
import { fetchZones, patchZone } from '../services/api';
import type { Zone } from '../types';

export function useZones() {
  const [zones, setZones]     = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchZones();
      setZones(data);
      setError(null);
    } catch (e) {
      setError('Gagal memuat data zona');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Toggle watering untuk satu zona & update Supabase via backend.
   */
  const toggleZone = useCallback(async (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Optimistic UI update
    setZones(prev =>
      prev.map(z =>
        z.id === zoneId
          ? { ...z, auto: false, watering: !z.watering }
          : z
      )
    );

    try {
      const updated = await patchZone(zoneId, {
        auto: false,
        watering: !zone.watering,
      });
      setZones(prev => prev.map(z => (z.id === zoneId ? updated : z)));
    } catch {
      // Rollback on error
      setZones(prev =>
        prev.map(z =>
          z.id === zoneId ? { ...z, auto: zone.auto, watering: zone.watering } : z
        )
      );
      setError('Gagal mengubah status zona');
    }
  }, [zones]);

  /** Dipanggil dari useWebSocket saat menerima update real-time */
  const updateZones = useCallback((newZones: Zone[]) => {
    setZones(newZones);
  }, []);

  /** Dipanggil dari useWebSocket saat menerima ingest_update untuk 1 zona */
  const updateZone = useCallback((zoneId: string, moisture: number, temp: number) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, moisture, temp } : z));
  }, []);

  return { zones, loading, error, toggleZone, updateZones, updateZone, reload: load };
}
