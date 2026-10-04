from fastapi import APIRouter

from app.api.routes import panchayats
from app.api.routes import weather
from app.api.routes import advisory
from app.api.routes import alerts
from app.api.routes import system

router = APIRouter()

router.include_router(panchayats.router, prefix="/panchayats", tags=["panchayats"])
router.include_router(weather.router, prefix="/weather", tags=["weather"])
router.include_router(advisory.router, prefix="/advisory", tags=["advisory"])
router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
router.include_router(system.router, prefix="/system", tags=["system"])
