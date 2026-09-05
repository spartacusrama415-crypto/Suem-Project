"""
WebSocket Connection Manager
Mengelola semua koneksi WS aktif dan broadcast data real-time ke seluruh klien.
"""
from fastapi import WebSocket
import asyncio
import logging
import json

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(
            "WS client connected. Total: %d", len(self.active_connections)
        )

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(
            "WS client disconnected. Total: %d", len(self.active_connections)
        )

    async def broadcast(self, data: dict):
        """Kirim data ke semua klien yang terhubung."""
        if not self.active_connections:
            return
        message = json.dumps(data, default=str)
        dead: list[WebSocket] = []
        for ws in self.active_connections:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    @property
    def connection_count(self) -> int:
        return len(self.active_connections)


# Singleton instance
ws_manager = ConnectionManager()
