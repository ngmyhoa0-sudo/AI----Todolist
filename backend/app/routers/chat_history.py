from fastapi import APIRouter, Depends
from app.schemas.chat import ChatCreate
from app.database import supabase
from app.dependencies import verify_token

router = APIRouter(prefix="/chat", tags=["chat"])

# Lấy lịch sử chat
@router.get("/history")
def get_chat_history(user=Depends(verify_token)):
    res = supabase.table("chat_history").select("*").eq("user_id", user["id"]).order("created_at").execute()
    return res.data

# Lưu tin nhắn vào database
@router.post("/history")
def save_message(chat: ChatCreate, role: str, user=Depends(verify_token)):
    res = supabase.table("chat_history").insert({
        "user_id": user["id"],
        "role": role,
        "content": chat.message
    }).execute()
    return res.data

# Xóa toàn bộ lịch sử chat
@router.delete("/history")
def delete_chat_history(user=Depends(verify_token)):
    supabase.table("chat_history").delete().eq("user_id", user["id"]).execute()
    return {"message": "Đã xóa lịch sử chat"}