"""
FastAPI Main Application — SuemProject Backend
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import zones, sensor, history, settings as settings_router
from app.services import simulator, esp32_poller
from app.ws.manager import ws_manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────
#  Lifecycle: startup / shutdown
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: jalankan simulator atau polling ESP32 sesuai setting DB."""
    env = get_settings()
    logger.info("SuemProject backend starting (env=%s)", env.app_env)

    try:
        from app.services.supabase_client import get_supabase
        db = get_supabase()
        resp = db.table("settings").select("*").execute()
        m = {r["key"]: r["value"] for r in (resp.data or [])}
        mode = m.get("mode", "sim")
        esp32_ip = m.get("esp32_ip", "")

        if mode == "sim":
            simulator.start_simulation(env.poll_interval_seconds)
            logger.info("Simulation mode activated.")
        elif mode == "live" and esp32_ip:
            esp32_poller.start_polling(esp32_ip, env.poll_interval_seconds)
            logger.info("Live ESP32 polling started: %s", esp32_ip)
        else:
            logger.warning(
                "Mode='%s' tapi ESP32 IP kosong — tidak ada task background.", mode
            )
    except Exception as exc:
        logger.error("Failed to read settings at startup: %s", exc)
        # Fallback: jalankan simulator supaya frontend tidak kosong
        simulator.start_simulation(env.poll_interval_seconds)

    yield  # ← aplikasi berjalan di sini

    # Shutdown
    simulator.stop_simulation()
    esp32_poller.stop_polling()
    logger.info("SuemProject backend shut down.")


# ─────────────────────────────────────────────
#  App Instance
# ─────────────────────────────────────────────
env = get_settings()

app = FastAPI(
    title="SuemProject API",
    description="Backend monitoring lahan pertanian — ESP32 + Supabase",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — izinkan frontend React (lokal + Netlify + Railway + domain custom)
_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:3000",
]
# Tambahkan FRONTEND_URL dari env jika ada
if env.frontend_url:
    _origins.append(env.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=r"https://(.*\.)?(vercel\.app|railway\.app|up\.railway\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
#  Routers
# ─────────────────────────────────────────────
app.include_router(zones.router)
app.include_router(sensor.router)
app.include_router(history.router)
app.include_router(settings_router.router)


# ─────────────────────────────────────────────
#  Health Check
# ─────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "ws_clients": ws_manager.connection_count,
        "esp32_connected": esp32_poller.is_connected(),
    }


# ─────────────────────────────────────────────
#  WebSocket Endpoint
# ─────────────────────────────────────────────
@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """
    Frontend terhubung ke sini untuk menerima update real-time.
    Broadcast dikirim dari simulator.py atau esp32_poller.py.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Tunggu pesan dari klien (bisa ping/pong atau perintah)
            data = await websocket.receive_text()
            # Saat ini kita ignore pesan dari klien (read-only stream)
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
