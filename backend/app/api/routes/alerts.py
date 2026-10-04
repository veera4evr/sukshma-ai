from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SmsTestRequest(BaseModel):
    phone_number: str
    panchayat_id: str
    alert_type: str

@router.get("/")
async def get_alerts():
    # TODO: Connect to active alerts from DB
    return [
        {
            "id": "alert-1",
            "category": "Heavy Rain",
            "severity": "Moderate",
            "panchayat": "Example Panchayat",
            "period": "Today",
            "confidence": 85,
            "action": "Check drainage"
        }
    ]

@router.post("/sms/test")
async def test_sms(request: SmsTestRequest):
    # Demo/test endpoint only.
    # Production credentials must stay server-side.
    return {"status": "queued", "message": f"Test SMS queued for {request.phone_number}"}
