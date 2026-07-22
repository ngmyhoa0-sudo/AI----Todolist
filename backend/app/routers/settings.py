from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database import supabase
from app.dependencies import verify_token

router = APIRouter(prefix="/settings", tags=["settings"])

class TimezoneUpdate(BaseModel):
    timezone: str

@router.get("/timezone")
def get_timezone(user=Depends(verify_token)):
    return {"timezone": user["timezone"]}

@router.put("/timezone")
def update_timezone(body: TimezoneUpdate, user=Depends(verify_token)):
    supabase.table("user_settings").upsert({
        "user_id": user["id"],
        "timezone": body.timezone,
    }).execute()
    return {"message": "Cập nhật múi giờ thành công", "timezone": body.timezone}