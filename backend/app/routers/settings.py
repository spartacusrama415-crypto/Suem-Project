"""
Router: /api/settings
GET /api/settings            — ambil semua pengaturan
PUT /api/settings            — simpan semua pengaturan
PUT /api/settings/mode       — ubah mode (sim/live) dan atur polling ESP32
"""
from fastapi import APIRouter
from app.models.schemas import AppSettings
from app.services.supabase_client import get_supabase
from app.services import simulator, esp32_poller
from app.config import get_settings as get_env

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _load_settings_from_db() -> AppSettings:
    db = get_supabase()
    resp = db.table("settings").select("*").execute()
    m = {r["key"]: r["value"] for r in (resp.data or [])}
    return AppSettings(
        setpoint=int(m.get("setpoint", 35)),
        temp_alert=int(m.get("temp_alert", 34)),
        mode=m.get("mode", "sim"),
        esp32_ip=m.get("esp32_ip", ""),
        humidity=int(m.get("humidity", 68)),
    )


@router.get("", response_model=AppSettings)
async def get_settings():
    return _load_settings_from_db()


@router.put("", response_model=AppSettings)
async def save_settings(payload: AppSettings):
    """Simpan pengaturan dan restart task yang sesuai (sim atau live)."""
    db = get_supabase()
    env = get_env()

    updates = {
        "setpoint":   str(payload.setpoint),
        "temp_alert": str(payload.temp_alert),
        "mode":       payload.mode,
        "esp32_ip":   payload.esp32_ip,
        "humidity":   str(payload.humidity),
    }
    for key, value in updates.items():
        db.table("settings").upsert({"key": key, "value": value}).execute()

    # Atur background task berdasarkan mode
    if payload.mode == "sim":
        esp32_poller.stop_polling()
        simulator.start_simulation(env.poll_interval_seconds)
    else:
        simulator.stop_simulation()
        if payload.esp32_ip:
            esp32_poller.start_polling(payload.esp32_ip, env.poll_interval_seconds)
        else:
            esp32_poller.stop_polling()

    return _load_settings_from_db()
