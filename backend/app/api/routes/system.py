from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/status")
async def get_system_status():
    return {
        "api_status": "ok",
        "data_freshness": datetime.now(timezone.utc).isoformat(),
        "model_version": "v0.1.0-alpha",
        "demo_mode": True,
        "latest_inference": None
    }
