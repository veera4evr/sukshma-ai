from fastapi import APIRouter, Query
from typing import Optional, List

router = APIRouter()

@router.get("/")
async def get_panchayats(
    district: Optional[str] = None,
    block: Optional[str] = None,
    search: Optional[str] = None,
):
    # TODO: Connect to DB. For now, return mock data.
    return {
        "items": [
            {
                "id": "p001",
                "name": "Example Panchayat",
                "block": "Example Block",
                "district": "Example District"
            }
        ]
    }
