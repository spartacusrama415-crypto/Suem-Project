import { useEffect, useRef, useState, useCallback } from 'react';
import type { WsMessage, Zone } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`;

interface UseWebSocketOptions {
  onZoneUpdate?: (zones: Zone[], humidity: number, setpoint: number) => void;
  onEsp32Status?: (connected: boolean, ip?: string) => void;
  onIngestUpdate?: (zoneId: string, moisture: number, temp: number, humidity: number, timestamp: string) => void;
}

export function useWebSocket({ onZoneUpdate, onEsp32Status }: UseWebSocketOptions = {}) {
  const wsRef              = useRef<WebSocket | null>(null);
  const reconnectTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connected, setConnected]   = useState(false);
  const [esp32Ok, setEsp32Ok]       = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: WsMessage = JSON.parse(event.data as string);

        if (msg.type === 'live_update' || msg.type === 'esp32_update') {
          if ('zones' in msg) {
            onZoneUpdate?.(msg.zones, msg.humidity, msg.setpoint);
          }
          if (msg.type === 'esp32_update') {
            setEsp32Ok(msg.connected);
            onEsp32Status?.(msg.connected);
          }
        }

        if (msg.type === 'esp32_status') {
          setEsp32Ok(msg.connected);
          onEsp32Status?.(msg.connected, msg.esp32_ip);
        }

        if (msg.type === 'ingest_update') {
          // @ts-ignore (we know msg has these properties when type is ingest_update)
          onIngestUpdate?.(msg.zone_id, msg.moisture, msg.temp, msg.humidity, msg.timestamp);
        }
      } catch {
        // invalid JSON — ignore
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect setelah 4 detik
      reconnectTimerRef.current = setTimeout(connect, 4000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [onZoneUpdate, onEsp32Status]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connected, esp32Ok };
}
