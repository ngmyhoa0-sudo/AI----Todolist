from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from ..schemas.todo import TodoCreate, TodoUpdate
from ..database import supabase
from ..dependencies import verify_token
router = APIRouter(prefix="/todos", tags=["todos"])

# Postgres báo lỗi 42501 (insufficient_privilege) khi 1 câu insert/update/delete bị RLS chặn —
# trong app này, trường hợp phổ biến nhất là do token/phiên đăng nhập (kể cả phiên khách) đã hết hạn
# giữa chừng. Coi đây là lỗi xác thực (401) thay vì lỗi server chung chung (500) để frontend
# có thể tự động thử refresh token hoặc báo người dùng đăng nhập lại thay vì hiện lỗi khó hiểu.
_RLS_ERROR_CODE = "42501"

def _execute(query):
    try:
        return query.execute()
    except APIError as e:
        if e.code == _RLS_ERROR_CODE or "jwt" in (e.message or "").lower():
            raise HTTPException(status_code=401, detail="Phiên đăng nhập đã hết hạn, vui lòng tải lại trang hoặc đăng nhập lại.")
        raise HTTPException(status_code=500, detail="Có lỗi xảy ra khi xử lý task, vui lòng thử lại.")

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
    if todo.is_completed is not None:
        update_data["is_completed"] = todo.is_completed
    if todo.deadline is not None:
        update_data["deadline"] = str(todo.deadline)
    res = _execute(
        supabase.table("tasks").update(update_data).eq("id", todo_id).eq("user_id", user["id"])
    )
    return res.data

# Xóa task
@router.delete("/{todo_id}")
def delete_todo(todo_id: int, user=Depends(verify_token)):
    _execute(supabase.table("tasks").delete().eq("id", todo_id).eq("user_id", user["id"]))
    return {"message": "Đã xóa task"}
