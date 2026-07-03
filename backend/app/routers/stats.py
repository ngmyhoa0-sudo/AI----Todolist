from fastapi import APIRouter, Depends
from app.database import supabase
from app.dependencies import verify_token
from datetime import datetime, timezone

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/")
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
        and datetime.fromisoformat(t["deadline"]).replace(tzinfo=timezone.utc) < datetime.now(timezone.utc)
    ])

    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    
    }