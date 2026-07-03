from fastapi import APIRouter, Depends
from app.schemas.chat import ChatCreate
from app.database import supabase
from app.dependencies import verify_token
from google import genai
import os

router = APIRouter(prefix="/ai", tags=["ai"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Thêm task bằng ngôn ngữ tự nhiên
@router.post("/parse-task")
def parse_task(chat: ChatCreate, user=Depends(verify_token)):
    prompt = f"""
    Người dùng muốn thêm task: "{chat.message}"
    Hãy trích xuất thông tin và trả về JSON với format:
    {{"title": "tên task", "deadline": "YYYY-MM-DD hoặc null"}}
    Chỉ trả về JSON, không giải thích thêm.
    """
    res = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )
    return {"result": res.text}

# Chatbot trả lời câu hỏi về task
@router.post("/chat")
def chat_with_ai(chat: ChatCreate, user=Depends(verify_token)):
    tasks = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute().data

    prompt = f"""
    Danh sách task hiện tại của người dùng: {tasks}
    Câu hỏi: "{chat.message}"
    Hãy trả lời ngắn gọn, hữu ích bằng tiếng Việt.
    """
    res = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    supabase.table("chat_history").insert([
        {"user_id": user["id"], "role": "user", "content": chat.message},
        {"user_id": user["id"], "role": "ai", "content": res.text}
    ]).execute()

    return {"reply": res.text}