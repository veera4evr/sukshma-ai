from fastapi import APIRouter, Query
from typing import Optional, List

router = APIRouter()

@router.get("/")
async def get_weather(
    panchayat_id: str,
    valid_time: Optional[str] = None,
    variables: Optional[List[str]] = Query(None)
):
    # TODO: Connect to DB and ML model outputs.
    return {
        "panchayat_id": panchayat_id,
        "rainMm": 12.5,
        "rainProb": 60,
        "tempC": 31.2,
        "humidity": 75,
        "reliability": 0.82
    }

@router.get("/grid")
async def get_weather_grid(
    panchayat_id: Optional[str] = None,
    variable: Optional[str] = None,
    resolution: Optional[str] = "1km"
):
    # TODO: Return fine-grid values for map rendering
    return {"message": "Grid data placeholder"}

@router.get("/delta")
async def get_weather_delta():
    return {"message": "Coarse vs refined differences placeholder"}
