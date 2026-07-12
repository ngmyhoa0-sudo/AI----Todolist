import re
import os

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatCreate, ParseTaskRequest
from app.database import supabase
from app.dependencies import verify_token
from groq import Groq

router = APIRouter(prefix="/ai", tags=["ai"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# Thêm task bằng ngôn ngữ tự nhiên
@router.post("/parse-task")
def parse_task(chat: ParseTaskRequest, user=Depends(verify_token)):
    prompt = f"""
    Người dùng muốn thêm task: "{chat.text}"
    Hãy trích xuất thông tin và trả về JSON với format:
    {{"title": "tên task", "deadline": "YYYY-MM-DD hoặc null"}}
    Chỉ trả về JSON, không giải thích thêm.
    """
    try:
        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Không thể kết nối tới AI: {e}")

    raw_text = res.choices[0].message.content.strip()
    raw_text = re.sub(r"^```(?:json)?|```$", "", raw_text, flags=re.MULTILINE).strip()

    return {"result": raw_text}

# Chatbot trả lời câu hỏi về task
@router.post("/chat")
def chat_with_ai(chat: ChatCreate, user=Depends(verify_token)):
    tasks = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute().data

    prompt = f"""
    Danh sách task hiện tại của người dùng: {tasks}
    Câu hỏi: "{chat.message}"
    Hãy trả lời ngắn gọn, hữu ích bằng tiếng Việt.
    """
    try:
        res = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Không thể kết nối tới AI: {e}")

    reply_text = res.choices[0].message.content

    try:
        supabase.table("chat_history").insert([
            {"user_id": user["id"], "role": "user", "content": chat.message},
            {"user_id": user["id"], "role": "ai", "content": reply_text}
        ]).execute()
    except Exception:
        pass  # Không lưu được lịch sử thì bỏ qua, không chặn việc trả lời AI

    return {"reply": reply_text}