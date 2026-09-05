"""
ESP32 Poller: mereplikasi pollLiveESP32() dari index.html
Polling HTTP GET ke IP ESP32 dan menyimpan hasilnya ke Supabase.
"""
import asyncio
import logging
import httpx
from datetime import datetime, timezone

from app.services.supabase_client import get_supabase
from app.ws.manager import ws_manager

logger = logging.getLogger(__name__)

_poll_task: asyncio.Task | None = None
_esp32_connected: bool = False


async def _poll_loop(esp32_ip: str, interval: int = 5):
    global _esp32_connected
    logger.info("ESP32 polling started: http://%s/data", esp32_ip)
    db = get_supabase()

    async with httpx.AsyncClient(timeout=4.0) as client:
        while True:
            try:
                resp = await client.get(f"http://{esp32_ip}/data")
                data = resp.json()

                moisture = max(0, min(100, int(data.get("moisture", 0))))
                temp = float(data.get("temp", 0))
                humidity = max(0, min(100, int(data.get("humidity", 0))))

                # Update zona A1 (sensor utama dari ESP32)
                db.table("zones").update({
                    "moisture": moisture,
                    "temp": temp,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", "A1").execute()

                db.table("settings").update({"value": str(humidity)}).eq("key", "humidity").execute()

                db.table("sensor_history").insert({
                    "zone_id": "A1",
                    "moisture": moisture,
                    "temp": temp,
                    "humidity": humidity,
                    "recorded_at": datetime.now(timezone.utc).isoformat(),
                }).execute()

                _esp32_connected = True

                await ws_manager.broadcast({
                    "type": "esp32_update",
                    "zone_id": "A1",
                    "moisture": moisture,
                    "temp": temp,
                    "humidity": humidity,
                    "esp32_ip": esp32_ip,
                    "connected": True,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            except Exception as exc:
                _esp32_connected = False
                logger.warning("ESP32 poll failed: %s", exc)
                await ws_manager.broadcast({
                    "type": "esp32_status",
                    "connected": False,
                    "esp32_ip": esp32_ip,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })

            await asyncio.sleep(interval)


def start_polling(esp32_ip: str, interval: int = 5):
    global _poll_task
    stop_polling()
    loop = asyncio.get_event_loop()
    _poll_task = loop.create_task(_poll_loop(esp32_ip, interval))
    logger.info("ESP32 poll task created for %s", esp32_ip)


def stop_polling():
    global _poll_task, _esp32_connected
    if _poll_task:
        _poll_task.cancel()
        _poll_task = None
        _esp32_connected = False


def is_connected() -> bool:
    return _esp32_connected
