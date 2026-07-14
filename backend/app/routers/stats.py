from fastapi import APIRouter, Depends
from app.database import supabase
from app.dependencies import verify_token
from datetime import datetime
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

router = APIRouter(prefix="/stats", tags=["stats"])

def _is_overdue(deadline_str: str) -> bool:
    deadline_dt = datetime.fromisoformat(deadline_str)
    if deadline_dt.tzinfo is not None:
        # Chuẩn hóa về naive datetime để so sánh cùng "múi giờ" với datetime.now()
        deadline_dt = deadline_dt.replace(tzinfo=None)
    return deadline_dt < datetime.now(VN_TZ).replace(tzinfo=None)

@router.get("")
def get_stats(user=Depends(verify_token)):
    res = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute()
    tasks = res.data

    total = len(tasks)
    completed = len([t for t in tasks if t["is_completed"]])
    overdue = len([
        t for t in tasks
        if not t["is_completed"]
        and t["deadline"]
        and _is_overdue(t["deadline"])
    ])
    # "Đang làm" chỉ tính task chưa hoàn thành VÀ còn hạn — tách biệt hoàn toàn với "Quá hạn",
    # khớp với danh sách hiển thị ở tab "Đang làm" trên frontend (total = completed + active + overdue)
    active = total - completed - overdue

    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    }