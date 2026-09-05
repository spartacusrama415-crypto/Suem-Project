"""
Router: /api/zones
GET  /api/zones          — ambil semua zona
PATCH /api/zones/{id}   — update satu zona (toggle watering, dll)
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.models.schemas import Zone, ZonePatch, ActivityEntry
from app.services.supabase_client import get_supabase

router = APIRouter(prefix="/api/zones", tags=["zones"])


@router.get("", response_model=list[Zone])
async def get_zones():
    """Ambil semua zona dari Supabase."""
    db = get_supabase()
    resp = db.table("zones").select("*").order("id").execute()
    return resp.data or []


@router.patch("/{zone_id}", response_model=Zone)
async def patch_zone(zone_id: str, payload: ZonePatch):
    """Update satu zona (contoh: toggle watering, ubah auto mode)."""
    db = get_supabase()

    # Pastikan zona ada
    existing = db.table("zones").select("*").eq("id", zone_id).single().execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail=f"Zona '{zone_id}' tidak ditemukan")

    update_data = payload.model_dump(exclude_none=True)
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()

    updated = db.table("zones").update(update_data).eq("id", zone_id).select().single().execute()

    # Log aktivitas
    action = _build_action_text(payload)
    if action:
        db.table("activity_log").insert({
            "zone_id": zone_id,
            "action": action,
        }).execute()

    return updated.data


def _build_action_text(patch: ZonePatch) -> str:
    parts = []
    if patch.watering is True:
        parts.append("Penyiraman manual dinyalakan")
    elif patch.watering is False:
        parts.append("Penyiraman manual dimatikan")
    if patch.auto is True:
        parts.append("Mode otomatis diaktifkan")
    elif patch.auto is False:
        parts.append("Mode manual diaktifkan")
    return "; ".join(parts)
