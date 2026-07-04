from fastapi import APIRouter, Depends
from app.database import supabase
from app.dependencies import verify_token
from datetime import datetime

router = APIRouter(prefix="/stats", tags=["stats"])

def _is_overdue(deadline_str: str) -> bool:
    deadline_dt = datetime.fromisoformat(deadline_str)
    if deadline_dt.tzinfo is not None:
        # Chuẩn hóa về naive datetime để so sánh cùng "múi giờ" với datetime.now()
        deadline_dt = deadline_dt.replace(tzinfo=None)
    return deadline_dt < datetime.now()

@router.get("")
def get_stats(user=Depends(verify_token)):
    res = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute()
    tasks = res.data

    total = len(tasks)
    completed = len([t for t in tasks if t["is_completed"]])
    active = total - completed
    overdue = len([
        t for t in tasks
        if not t["is_completed"]
        and t["deadline"]
        and _is_overdue(t["deadline"])
    ])

    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    
    }