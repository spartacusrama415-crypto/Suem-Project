"""
Router: /api/history
GET /api/history?range=24h&zone_id=A1   — riwayat sensor berdasarkan rentang waktu
GET /api/history/calendar?year=2026&month=9  — ringkasan harian untuk kalender
"""
from fastapi import APIRouter, Query
from datetime import datetime, timezone, timedelta

from app.models.schemas import HistoryPoint
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/history", tags=["history"])

RANGE_MAP = {
    "24h":  timedelta(hours=24),
    "7d":   timedelta(days=7),
    "30d":  timedelta(days=30),
}


@router.get("", response_model=list[HistoryPoint])
async def get_history(
    range: str = Query(default="24h", pattern="^(24h|7d|30d)$"),
    zone_id: str = Query(default="A1"),
):
    """Ambil riwayat sensor untuk chart trend."""
    db = get_supabase()
    delta = RANGE_MAP.get(range, RANGE_MAP["24h"])
    since = (datetime.now(timezone.utc) - delta).isoformat()

    resp = (
        db.table("sensor_history")
        .select("*")
        .eq("zone_id", zone_id)
        .gte("recorded_at", since)
        .order("recorded_at", desc=True)
        .limit(1000)
        .execute()
    )
    data = resp.data or []
    data.reverse()  # Balikkan urutan agar kronologis dari lama ke baru
    return data


@router.get("/calendar")
async def get_calendar(
    year: int = Query(default=2026),
    month: int = Query(default=9, ge=1, le=12),
):
    """
    Ringkasan harian untuk tampilan kalender.
    Return: dict {day: {moisture, temp, cycles}}
    """
    db = get_supabase()

    # Hitung rentang bulan
    start = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

    resp = (
        db.table("sensor_history")
        .select("recorded_at, moisture, temp, humidity, zone_id")
        .gte("recorded_at", start.isoformat())
        .lt("recorded_at", end.isoformat())
        .order("recorded_at")
        .execute()
    )

    rows = resp.data or []
    # Kelompokkan per hari
    daily: dict[int, dict] = {}
    for row in rows:
        dt = datetime.fromisoformat(row["recorded_at"].replace("Z", "+00:00"))
        day = dt.day
        if day not in daily:
            daily[day] = {"moisture_sum": 0, "temp_sum": 0, "count": 0, "cycles": 0}
        daily[day]["moisture_sum"] += row["moisture"]
        daily[day]["temp_sum"] += row["temp"]
        daily[day]["count"] += 1

    result = {}
    for day, d in daily.items():
        n = d["count"]
        avg_m = round(d["moisture_sum"] / n)
        avg_t = round(d["temp_sum"] / n, 1)
        from app.services.supabase_client import get_supabase as _db
        sp_resp = _db().table("settings").select("value").eq("key", "setpoint").single().execute()
        setpoint = int(sp_resp.data["value"]) if sp_resp.data else 35
        cycles = max(0, round((n / 12) * (1 if avg_m < setpoint else 0.3)))
        result[str(day)] = {
            "moisture": avg_m,
            "temp": avg_t,
            "cycles": cycles,
        }

    return result


@router.get("/week-summary")
async def get_week_summary():
    """Ringkasan 7 hari terakhir: rata-rata moisture, temp, total cycles."""
    db = get_supabase()
    since = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()

    resp = (
        db.table("sensor_history")
        .select("moisture, temp")
        .gte("recorded_at", since)
        .execute()
    )
    rows = resp.data or []
    if not rows:
        return {"avg_moisture": None, "avg_temp": None, "total_cycles": 0}

    avg_m = round(sum(r["moisture"] for r in rows) / len(rows))
    avg_t = round(sum(r["temp"] for r in rows) / len(rows), 1)

    # Estimasi cycles dari berapa kali moisture < setpoint
    sp_resp = db.table("settings").select("value").eq("key", "setpoint").single().execute()
    setpoint = int(sp_resp.data["value"]) if sp_resp.data else 35
    low_count = sum(1 for r in rows if r["moisture"] < setpoint)
    cycles = round(low_count * 0.3)

    return {"avg_moisture": avg_m, "avg_temp": avg_t, "total_cycles": cycles}
