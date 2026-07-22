from fastapi import APIRouter, Depends
from app.database import supabase
from app.dependencies import verify_token
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

router = APIRouter(prefix="/stats", tags=["stats"])

def _is_overdue(deadline_str: str, tz) -> bool:
    deadline_dt = datetime.fromisoformat(deadline_str)
    if deadline_dt.tzinfo is not None:
        deadline_dt = deadline_dt.replace(tzinfo=None)
    return deadline_dt < datetime.now(tz).replace(tzinfo=None)

def _to_naive(dt_str: str, tz) -> datetime:
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is not None:
        dt = dt.astimezone(tz).replace(tzinfo=None)
    return dt

def _week_bounds(offset: int, tz):
    now = datetime.now(tz).replace(tzinfo=None)
    today_index = (now.weekday() + 1) % 7
    start_of_this_week = (now - timedelta(days=today_index)).replace(hour=0, minute=0, second=0, microsecond=0)
    start = start_of_this_week + timedelta(weeks=offset)
    end = start + timedelta(days=7)
    return start, end

def _month_bounds(offset: int, tz):
    now = datetime.now(tz)
    total_months = now.year * 12 + (now.month - 1) + offset
    year = total_months // 12
    month = total_months % 12 + 1
    start = datetime(year, month, 1)
    end = datetime(year + 1, 1, 1) if month == 12 else datetime(year, month + 1, 1)
    return start, end

@router.get("")
def get_stats(user=Depends(verify_token)):
    tz = ZoneInfo(user["timezone"])
    res = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute()
    tasks = res.data

    total = len(tasks)
    completed = len([t for t in tasks if t["is_completed"]])
    overdue = len([
        t for t in tasks
        if not t["is_completed"]
        and t["deadline"]
        and _is_overdue(t["deadline"], tz)
    ])
    active = total - completed - overdue

    return {
        "total": total,
        "completed": completed,
        "active": active,
        "overdue": overdue,
    }

# Tóm tắt các mốc thời gian thực sự có dữ liệu (dựa trên deadline hoặc completed_at),
# dùng để giới hạn danh sách năm/tháng/tuần chọn nhanh trong modal thống kê.
@router.get("/activity-summary")
def get_activity_summary(user=Depends(verify_token)):
    tz = ZoneInfo(user["timezone"])
    res = supabase.table("tasks").select("deadline,completed_at").eq("user_id", user["id"]).execute()

    days = set()
    for t in res.data:
        if t.get("deadline"):
            days.add(_to_naive(t["deadline"], tz).date().isoformat())
        if t.get("completed_at"):
            days.add(_to_naive(t["completed_at"], tz).date().isoformat())

    months = {d[:7] for d in days}
    years = {int(d[:4]) for d in days}
    current_year = datetime.now(tz).year

    return {
        "days": sorted(days),
        "months": sorted(months),
        "earliestYear": min(years) if years else current_year,
    }

# Tỉ lệ trạng thái task (Hoàn thành/Đang làm/Quá hạn) tính riêng cho 1 tuần, 1 tháng hoặc 1 năm cụ thể,
# dựa trên deadline rơi vào đúng kỳ đó. "Quá hạn" vẫn so với thời điểm hiện tại (không phải theo kỳ đã qua).
@router.get("/period-status")
def get_period_status(range: str = "week", offset: int = 0, user=Depends(verify_token)):
    tz = ZoneInfo(user["timezone"])
    if range == "year":
        year = datetime.now(tz).year + offset
        start = datetime(year, 1, 1)
        end = datetime(year + 1, 1, 1)
    elif range == "month":
        start, end = _month_bounds(offset, tz)
    else:
        start, end = _week_bounds(offset, tz)

    res = supabase.table("tasks").select("is_completed,deadline").eq("user_id", user["id"]).execute()

    completed = active = overdue = 0
    for t in res.data:
        if not t["deadline"]:
            continue
        dt = _to_naive(t["deadline"], tz)
        if not (start <= dt < end):
            continue
        if t["is_completed"]:
            completed += 1
        elif _is_overdue(t["deadline"], tz):
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
    tz = ZoneInfo(user["timezone"])
    start_of_week, end_of_week = _week_bounds(offset, tz)

    res = supabase.table("tasks").select("completed_at").eq("user_id", user["id"]).execute()
    counts = [0] * 7
    for t in res.data:
        if not t.get("completed_at"):
            continue
        dt = _to_naive(t["completed_at"], tz)
        if start_of_week <= dt < end_of_week:
            day_index = (dt.weekday() + 1) % 7
            counts[day_index] += 1

    return {"counts": counts, "startDate": start_of_week.date().isoformat()}

# Số task hoàn thành theo từng ngày trong 1 THÁNG cụ thể, dựa trên completed_at thật.
# offset=0 là tháng hiện tại, offset=-1 là tháng trước, v.v.
@router.get("/completed-by-month-days")
def get_completed_by_month_days(offset: int = 0, user=Depends(verify_token)):
    tz = ZoneInfo(user["timezone"])
    start, end = _month_bounds(offset, tz)
    days_in_month = (end - start).days

    res = supabase.table("tasks").select("completed_at").eq("user_id", user["id"]).execute()
    counts = [0] * days_in_month
    for t in res.data:
        if not t.get("completed_at"):
            continue
        dt = _to_naive(t["completed_at"], tz)
        if start <= dt < end:
            counts[dt.day - 1] += 1

    return {"counts": counts, "year": start.year, "month": start.month}

# Số task hoàn thành theo từng tháng trong 1 năm, kèm năm trước đó nếu có dữ liệu.
# offset=0 là năm hiện tại, offset=-1 là năm trước, v.v.
@router.get("/completed-by-month")
def get_completed_by_month(offset: int = 0, user=Depends(verify_token)):
    tz = ZoneInfo(user["timezone"])
    current_year = datetime.now(tz).year + offset
    prev_year = current_year - 1

    res = supabase.table("tasks").select("completed_at").eq("user_id", user["id"]).execute()
    current_counts = [0] * 12
    prev_counts = [0] * 12
    for t in res.data:
        if not t.get("completed_at"):
            continue
        dt = _to_naive(t["completed_at"], tz)
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