from fastapi import APIRouter, Depends
from ..schemas.todo import TodoCreate, TodoUpdate
from ..database import supabase
from ..dependencies import verify_token
router = APIRouter(prefix="/todos", tags=["todos"])

# Lấy danh sách task
@router.get("")
def get_todos(user=Depends(verify_token)):
    res = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute()
    return res.data

# Thêm task mới
@router.post("")
def create_todo(todo: TodoCreate, user=Depends(verify_token)):
    res = supabase.table("tasks").insert({
        "title": todo.title,
        "deadline": str(todo.deadline) if todo.deadline else None,
        "user_id": user["id"],
        "is_completed": False
    }).execute()
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
    res = supabase.table("tasks").update(update_data).eq("id", todo_id).eq("user_id", user["id"]).execute()
    return res.data

# Xóa task
@router.delete("/{todo_id}")
def delete_todo(todo_id: int, user=Depends(verify_token)):
    supabase.table("tasks").delete().eq("id", todo_id).eq("user_id", user["id"]).execute()
    return {"message": "Đã xóa task"}