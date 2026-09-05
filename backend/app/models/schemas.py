"""
Pydantic models untuk validasi data request/response.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --------------- Zones ---------------

class Zone(BaseModel):
    id: str
    name: str
    moisture: int = Field(ge=0, le=100)
    temp: float
    auto: bool = True
    watering: bool = False
    updated_at: Optional[datetime] = None


class ZonePatch(BaseModel):
    """Digunakan untuk PATCH /zones/{id} — semua field opsional."""
    moisture: Optional[int] = Field(default=None, ge=0, le=100)
    temp: Optional[float] = None
    auto: Optional[bool] = None
    watering: Optional[bool] = None


# --------------- Sensor ---------------

class SensorReading(BaseModel):
    """Data yang dikirim ESP32 ke /sensor/ingest"""
    moisture: int = Field(ge=0, le=100)
    temp: float = Field(ge=-10, le=60)
    humidity: int = Field(ge=0, le=100)
    zone_id: str = "A1"


class SensorLatest(BaseModel):
    moisture: int
    temp: float
    humidity: int
    zone_id: str
    recorded_at: Optional[datetime] = None


# --------------- Settings ---------------

class AppSettings(BaseModel):
    setpoint: int = Field(default=35, ge=10, le=70)
    temp_alert: int = Field(default=34, ge=25, le=42)
    mode: str = Field(default="sim", pattern="^(sim|live)$")
    esp32_ip: str = ""
    humidity: int = Field(default=68, ge=0, le=100)


# --------------- History ---------------

class HistoryPoint(BaseModel):
    recorded_at: datetime
    moisture: int
    temp: float
    humidity: Optional[int] = None
    zone_id: str


# --------------- Activity Log ---------------

class ActivityEntry(BaseModel):
    zone_id: Optional[str] = None
    action: str
    created_at: Optional[datetime] = None


# --------------- WebSocket Broadcast ---------------

class LivePayload(BaseModel):
    zones: list[Zone]
    humidity: int
    settings: AppSettings
    timestamp: datetime
