"""
Simulator sensor: mereplikasi logika simulateStep() dari index.html
Dijalankan sebagai background task FastAPI ketika mode='sim'.
"""
import random
import asyncio
import logging
from datetime import datetime, timezone

from app.services.supabase_client import get_supabase
from app.ws.manager import ws_manager

logger = logging.getLogger(__name__)

_simulation_task: asyncio.Task | None = None


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


async def _run_simulation_loop(interval: int = 5):
    """Loop simulasi: update zona di Supabase tiap `interval` detik, lalu broadcast WS."""
    logger.info("Simulation loop started (interval=%ds)", interval)
    db = get_supabase()

    while True:
        try:
            # Ambil data terkini dari Supabase
            zones_resp = db.table("zones").select("*").execute()
            settings_resp = db.table("settings").select("*").execute()

            zones = zones_resp.data or []
            settings_map = {r["key"]: r["value"] for r in (settings_resp.data or [])}
            setpoint = int(settings_map.get("setpoint", 35))
            humidity_raw = int(settings_map.get("humidity", 68))

            # Simulasi perubahan sensor (sama persis seperti index.html simulateStep)
            humidity = int(_clamp(
                humidity_raw + (random.random() - 0.5) * 2, 40, 90
            ))

            updated_zones = []
            for z in zones:
                drift = (random.random() - 0.55) * 3
                moisture = int(_clamp(round(z["moisture"] + drift), 8, 95))
                temp = round(z["temp"] + (random.random() - 0.5) * 0.6, 1)
                watering = (moisture < setpoint) if z["auto"] else z["watering"]

                # Simpan ke Supabase
                db.table("zones").update({
                    "moisture": moisture,
                    "temp": temp,
                    "watering": watering,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", z["id"]).execute()

                updated_zones.append({**z, "moisture": moisture, "temp": temp, "watering": watering})

            # Simpan humidity terbaru ke settings
            db.table("settings").update({"value": str(humidity)}).eq("key", "humidity").execute()

            # Simpan ke sensor_history (zona A1 sebagai zona utama)
            if updated_zones:
                z1 = next((z for z in updated_zones if z["id"] == "A1"), updated_zones[0])
                db.table("sensor_history").insert({
                    "zone_id": z1["id"],
                    "moisture": z1["moisture"],
                    "temp": z1["temp"],
                    "humidity": humidity,
                    "recorded_at": datetime.now(timezone.utc).isoformat(),
                }).execute()

            # Broadcast ke semua WebSocket klien
            await ws_manager.broadcast({
                "type": "live_update",
                "zones": updated_zones,
                "humidity": humidity,
                "setpoint": setpoint,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })

        except Exception as exc:
            logger.error("Simulation error: %s", exc)

        await asyncio.sleep(interval)


def start_simulation(interval: int = 5):
    global _simulation_task
    if _simulation_task and not _simulation_task.done():
        return
    loop = asyncio.get_event_loop()
    _simulation_task = loop.create_task(_run_simulation_loop(interval))
    logger.info("Simulation task created.")


def stop_simulation():
    global _simulation_task
    if _simulation_task:
        _simulation_task.cancel()
        _simulation_task = None
        logger.info("Simulation task cancelled.")
