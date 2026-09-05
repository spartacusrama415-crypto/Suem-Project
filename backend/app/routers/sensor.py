"""
Router: /api/sensor
GET  /api/sensor/latest          — data sensor terbaru zona A1
POST /api/sensor/ingest          — terima data dari ESP32 (atau simulasi)
"""
from fastapi import APIRouter, Header, HTTPException
from datetime import datetime, timezone

from app.models.schemas import SensorReading, SensorLatest
from app.services.supabase_client import get_supabase
from app.ws.manager import ws_manager
from app.config import get_settings

router = APIRouter(prefix="/api/sensor", tags=["sensor"])


@router.get("/latest", response_model=SensorLatest)
async def get_latest():
    """Ambil pembacaan sensor terbaru dari history."""
    db = get_supabase()
    resp = (
        db.table("sensor_history")
        .select("*")
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Belum ada data sensor")
    return resp.data[0]


@router.post("/ingest", status_code=201)
async def ingest_sensor(
    data: SensorReading,
    x_api_key: str = Header(default=""),
):
    """
    Endpoint untuk ESP32 mengirim data sensor.
    Header: X-API-Key harus cocok dengan API_SECRET_KEY di .env
    """
    settings = get_settings()
    if settings.app_env != "development" and x_api_key != settings.api_secret_key:
        raise HTTPException(status_code=401, detail="API key tidak valid")

    db = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    # Update zona yang bersangkutan
    db.table("zones").update({
        "moisture": data.moisture,
        "temp": data.temp,
        "updated_at": now,
    }).eq("id", data.zone_id).execute()

    # Simpan ke history
    db.table("sensor_history").insert({
        "zone_id": data.zone_id,
        "moisture": data.moisture,
        "temp": data.temp,
        "humidity": data.humidity,
        "recorded_at": now,
    }).execute()

    # Update humidity di settings
    db.table("settings").update({"value": str(data.humidity)}).eq("key", "humidity").execute()

    # Broadcast ke frontend via WebSocket
    await ws_manager.broadcast({
        "type": "ingest_update",
        "zone_id": data.zone_id,
        "moisture": data.moisture,
        "temp": data.temp,
        "humidity": data.humidity,
        "timestamp": now,
    })

    return {"status": "ok", "recorded_at": now}
