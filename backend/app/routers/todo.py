import calendar
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from ..schemas.todo import TodoCreate, TodoUpdate
from ..database import supabase
from ..dependencies import verify_token
router = APIRouter(prefix="/todos", tags=["todos"])

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
_RLS_ERROR_CODE = "42501"


def _execute(query):
    try:
        return query.execute()
    except APIError as e:
        if e.code == _RLS_ERROR_CODE or "jwt" in (e.message or "").lower():
            raise HTTPException(status_code=401, detail="Phiên đăng nhập đã hết hạn, vui lòng tải lại trang hoặc đăng nhập lại.")
        raise HTTPException(status_code=500, detail="Có lỗi xảy ra khi xử lý task, vui lòng thử lại.")


def _advance_deadline(deadline_dt: datetime, rule: str) -> datetime:
    """Tính deadline của lần lặp tiếp theo dựa trên quy tắc lặp lại."""
    if rule == "daily":
        return deadline_dt + timedelta(days=1)
    if rule == "weekday":
        next_dt = deadline_dt + timedelta(days=1)
        while next_dt.weekday() >= 5:  # 5=Thứ 7, 6=Chủ nhật
            next_dt += timedelta(days=1)
        return next_dt
    if rule == "weekly":
        return deadline_dt + timedelta(days=7)
    if rule == "monthly":
        month = deadline_dt.month + 1
        year = deadline_dt.year + (1 if month > 12 else 0)
        month = month if month <= 12 else 1
        last_day = calendar.monthrange(year, month)[1]
        day = min(deadline_dt.day, last_day)
        return deadline_dt.replace(year=year, month=month, day=day)
    if rule == "yearly":
        try:
            return deadline_dt.replace(year=deadline_dt.year + 1)
        except ValueError:
            # Ngày 29/2 ở năm không nhuận -> lùi về 28/2
            return deadline_dt.replace(year=deadline_dt.year + 1, day=28)
    return deadline_dt


# Lấy danh sách task
@router.get("")
def get_todos(user=Depends(verify_token)):
    res = _execute(supabase.table("tasks").select("*").eq("user_id", user["id"]))
    return res.data


# Thêm task mới
@router.post("")
def create_todo(todo: TodoCreate, user=Depends(verify_token)):
    res = _execute(supabase.table("tasks").insert({
        "title": todo.title,
        "deadline": str(todo.deadline) if todo.deadline else None,
        "repeat_rule": todo.repeat_rule,
        "user_id": user["id"],
        "is_completed": False
    }))
    return res.data


# Cập nhật task
@router.put("/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate, user=Depends(verify_token)):
    update_data = {}
    if todo.title is not None:
        update_data["title"] = todo.title
    if todo.deadline is not None:
        update_data["deadline"] = str(todo.deadline)
    if todo.repeat_rule is not None:
        update_data["repeat_rule"] = None if todo.repeat_rule == "none" else todo.repeat_rule

    if todo.is_completed is not None:
        if todo.is_completed:
            current = _execute(
                supabase.table("tasks").select("deadline,repeat_rule").eq("id", todo_id).eq("user_id", user["id"])
            )
            current_task = current.data[0] if current.data else None
            now_vn = datetime.now(VN_TZ)
            if current_task and current_task.get("repeat_rule") and current_task.get("deadline"):
                next_deadline = _advance_deadline(
                    datetime.fromisoformat(current_task["deadline"]), current_task["repeat_rule"]
                )
                update_data["deadline"] = next_deadline.isoformat()
                update_data["is_completed"] = False
                update_data["completed_at"] = now_vn.isoformat()
            else:
                update_data["is_completed"] = True
                update_data["completed_at"] = now_vn.isoformat()
        else:
            update_data["is_completed"] = False
            update_data["completed_at"] = None

    res = _execute(
        supabase.table("tasks").update(update_data).eq("id", todo_id).eq("user_id", user["id"])
    )
    return res.data


# Xóa task
@router.delete("/{todo_id}")
def delete_todo(todo_id: int, user=Depends(verify_token)):
    _execute(supabase.table("tasks").delete().eq("id", todo_id).eq("user_id", user["id"]))
    return {"message": "Đã xóa task"}