from fastapi import APIRouter, Depends
from app.database import supabase
from app.dependencies import verify_token
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")

router = APIRouter(prefix="/stats", tags=["stats"])

def _is_overdue(deadline_str: str) -> bool:
    deadline_dt = datetime.fromisoformat(deadline_str)
    if deadline_dt.tzinfo is not None:
        # Chuẩn hóa về naive datetime để so sánh cùng "múi giờ" với datetime.now()
        deadline_dt = deadline_dt.replace(tzinfo=None)
    return deadline_dt < datetime.now(VN_TZ).replace(tzinfo=None)

def _to_vn_naive(dt_str: str) -> datetime:
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is not None:
        dt = dt.astimezone(VN_TZ).replace(tzinfo=None)
    return dt

def _week_bounds(offset: int):
    now_vn = datetime.now(VN_TZ).replace(tzinfo=None)
    # Python: Thứ 2=0 ... Chủ nhật=6 -> quy đổi sang CN=0 ... T7=6 cho khớp cách hiển thị của app
    today_index = (now_vn.weekday() + 1) % 7
    start_of_this_week = (now_vn - timedelta(days=today_index)).replace(hour=0, minute=0, second=0, microsecond=0)
    start = start_of_this_week + timedelta(weeks=offset)
    end = start + timedelta(days=7)
    return start, end

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
    active = total - completed - overdue

    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    }

# Tỉ lệ trạng thái task (Hoàn thành/Đang làm/Quá hạn) tính riêng cho 1 tuần hoặc 1 năm cụ thể,
# dựa trên deadline rơi vào đúng kỳ đó. "Quá hạn" vẫn so với thời điểm hiện tại (không phải theo kỳ đã qua).
@router.get("/period-status")
def get_period_status(range: str = "week", offset: int = 0, user=Depends(verify_token)):
    if range == "month":
        year = datetime.now(VN_TZ).year + offset
        start = datetime(year, 1, 1)
        end = datetime(year + 1, 1, 1)
    else:
        start, end = _week_bounds(offset)

    res = supabase.table("tasks").select("is_completed,deadline").eq("user_id", user["id"]).execute()

    completed = active = overdue = 0
    for t in res.data:
        if not t["deadline"]:
            continue
        dt = _to_vn_naive(t["deadline"])
        if not (start <= dt < end):
            continue
        if t["is_completed"]:
            completed += 1
        elif _is_overdue(t["deadline"]):
            overdue += 1
        else:
            active += 1

    total = completed + active + overdue
    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    }

# Số task hoàn thành theo từng ngày trong 1 tuần (CN->T7), dựa trên completed_at thật.
# offset=0 là tuần hiện tại, offset=-1 là tuần trước, v.v.
@router.get("/completed-by-day")
def get_completed_by_day(offset: int = 0, user=Depends(verify_token)):
    start_of_week, end_of_week = _week_bounds(offset)

    res = supabase.table("tasks").select("completed_at").eq("user_id", user["id"]).execute()
    counts = [0] * 7
    for t in res.data:
        if not t.get("completed_at"):
            continue
        dt = _to_vn_naive(t["completed_at"])
        if start_of_week <= dt < end_of_week:
            day_index = (dt.weekday() + 1) % 7
            counts[day_index] += 1

    return {"counts": counts, "startDate": start_of_week.date().isoformat()}

# Số task hoàn thành theo từng tháng trong 1 năm, kèm năm trước đó nếu có dữ liệu.
# offset=0 là năm hiện tại, offset=-1 là năm trước, v.v.
@router.get("/completed-by-month")
def get_completed_by_month(offset: int = 0, user=Depends(verify_token)):
    current_year = datetime.now(VN_TZ).year + offset
    prev_year = current_year - 1

    res = supabase.table("tasks").select("completed_at").eq("user_id", user["id"]).execute()
    current_counts = [0] * 12
    prev_counts = [0] * 12
    for t in res.data:
        if not t.get("completed_at"):
            continue
        dt = _to_vn_naive(t["completed_at"])
        if dt.year == current_year:
            current_counts[dt.month - 1] += 1
        elif dt.year == prev_year:
            prev_counts[dt.month - 1] += 1

    has_prev_year = any(c > 0 for c in prev_counts)

    return {
        "currentYear": current_year,
        "currentCounts": current_counts,
        "prevYear": prev_year,
        "prevCounts": prev_counts if has_prev_year else None,
    }