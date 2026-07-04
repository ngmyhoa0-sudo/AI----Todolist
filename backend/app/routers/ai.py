import json
import re

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatCreate, ParseTaskRequest
from app.database import supabase
from app.dependencies import verify_token
from google import genai
import os

router = APIRouter(prefix="/ai", tags=["ai"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Thêm task bằng ngôn ngữ tự nhiên
@router.post("/parse-task")
def parse_task(chat: ParseTaskRequest, user=Depends(verify_token)):
    prompt = f"""
    Người dùng muốn thêm task: "{chat.text}"
    Hãy trích xuất thông tin và trả về JSON với format:
    {{"title": "tên task", "deadline": "YYYY-MM-DD hoặc null"}}
    Chỉ trả về JSON, không giải thích thêm.
    """
    res = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt
    )

    # Gemini đôi khi bọc JSON trong ```json ... ``` nên cần bóc ra trước khi parse
    raw_text = re.sub(r"^```(?:json)?|```$", "", res.text.strip(), flags=re.MULTILINE).strip()

    try:
        parsed = json.loads(raw_text)
    except (json.JSONDecodeError, TypeError):
        raise HTTPException(status_code=422, detail="Không hiểu được nội dung task, vui lòng thử lại.")

    title = parsed.get("title")
    if not title:
        raise HTTPException(status_code=422, detail="Không nhận diện được tên task.")

    deadline = parsed.get("deadline")
    if deadline in (None, "null", ""):
        deadline = None

    res_insert = supabase.table("tasks").insert({
        "title": title,
        "deadline": deadline,
        "user_id": user["id"],
        "is_completed": False
    }).execute()

    return {"result": res_insert.data}

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