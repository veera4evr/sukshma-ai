from fastapi import APIRouter
from typing import Optional

router = APIRouter()

@router.get("/")
async def get_advisory(
    panchayat_id: str,
    crop: str,
    growth_stage: str,
    valid_time: Optional[str] = None
):
    # TODO: Connect to rule engine
    return [
        {
            "priority": "High",
            "action": "Delay spraying",
            "reason": "Rain probability is 60%",
            "validity": "Next 24 hours",
            "supporting_weather": {"rainProb": 60}
        }
    ]
