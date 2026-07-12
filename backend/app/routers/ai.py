import re
import os
import json

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import ChatCreate, ParseTaskRequest
from app.database import supabase
from app.dependencies import verify_token
from groq import Groq

router = APIRouter(prefix="/ai", tags=["ai"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

# Thêm task bằng ngôn ngữ tự nhiên (tab "Ngôn ngữ tự nhiên")
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

# Chatbot: vừa trả lời câu hỏi, vừa tự thêm task nếu người dùng có ý định đó

    
@router.post("/chat")
def chat_with_ai(chat: ChatCreate, user=Depends(verify_token)):
    tasks = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute().data

    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    prompt = f"""
    [persona]
    Bạn là trợ lý quản lý công việc cá nhân, am hiểu cách sắp xếp deadline, nói chuyện tự nhiên bằng tiếng Việt như một người bạn đồng nghiệp thân thiện.

    [context]
    Hôm nay là ngày: {today_str}
    Ngày mai là ngày: {tomorrow_str}
    Danh sách task hiện tại của người dùng: {tasks}
    Người dùng vừa nhắn: "{chat.message}"

    [task]
    Xác định người dùng đang muốn (a) THÊM một task mới, hay (b) chỉ hỏi đáp/trò chuyện thông thường.
    - Nếu là (a): trích xuất tên task và deadline gồm CẢ NGÀY LẪN GIỜ.
      + Ngày: tính CHÍNH XÁC theo "hôm nay" = {today_str}, "ngày mai" = {tomorrow_str}.
      + Giờ: nếu người dùng nói buổi chung chung không kèm số giờ, dùng quy ước: sáng=08:00, trưa=12:00, chiều=15:00, tối=19:00, đêm=22:00.
      + Nếu người dùng nói rõ số giờ kèm buổi (ví dụ "2 giờ chiều", "3h chiều"), đổi đúng sang giờ 24h (2 giờ chiều = 14:00, 3 giờ chiều = 15:00).
      + Nếu không nói gì về giờ/buổi, để giờ mặc định 08:00.
    - Nếu là (b): trả lời câu hỏi dựa trên danh sách task hiện có.

    [examples]
    Người dùng: "thêm task học tiếng Anh ngày mai"
    → {{"action": "add_task", "title": "Học tiếng Anh", "deadline": "{tomorrow_str} 08:00", "reply": "Đã thêm task \\"Học tiếng Anh\\", hạn ngày mai nhé!"}}

    Người dùng: "tôi có cuộc họp vào chiều nay"
    → {{"action": "add_task", "title": "Cuộc họp", "deadline": "{today_str} 15:00", "reply": "Đã thêm task \\"Cuộc họp\\", hạn chiều nay nhé!"}}

    Người dùng: "chiều mai 2h cũng có họp"
    → {{"action": "add_task", "title": "Cuộc họp", "deadline": "{tomorrow_str} 14:00", "reply": "Đã thêm task \\"Cuộc họp\\", hạn 2 giờ chiều mai nhé!"}}

    Người dùng: "tôi còn bao nhiêu task chưa xong"
    → {{"action": "chat", "reply": "Bạn còn 2 task chưa hoàn thành: ..."}}

    [format]
    Chỉ trả về DUY NHẤT 1 dòng JSON hợp lệ theo đúng 1 trong 2 cấu trúc:
    - Thêm task: {{"action": "add_task", "title": "...", "deadline": "YYYY-MM-DD HH:MM hoặc null", "reply": "..."}}
    - Trò chuyện: {{"action": "chat", "reply": "..."}}
    Không thêm chữ giải thích, không bọc trong dấu ```.

    [tone]
    Giọng văn ngắn gọn, tích cực, khích lệ, giống một trợ lý cá nhân đáng tin cậy.
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

    reply_text = raw_text
    task_added = False
    try:
        parsed = json.loads(raw_text)
        reply_text = parsed.get("reply", raw_text)

        if parsed.get("action") == "add_task" and parsed.get("title"):
            deadline = parsed.get("deadline")
            if isinstance(deadline, str) and deadline.strip().lower() == "null":
                deadline = None
            supabase.table("tasks").insert({
                "title": parsed["title"],
                "deadline": deadline,
                "user_id": user["id"],
                "is_completed": False
            }).execute()
            task_added = True
    except (json.JSONDecodeError, TypeError, AttributeError):
        pass  # AI không trả về JSON hợp lệ thì giữ nguyên raw_text làm câu trả lời

    try:
        supabase.table("chat_history").insert([
            {"user_id": user["id"], "role": "user", "content": chat.message},
            {"user_id": user["id"], "role": "ai", "content": reply_text}
        ]).execute()
    except Exception:
        pass  # Không lưu được lịch sử thì bỏ qua, không chặn việc trả lời AI

    return {"reply": reply_text, "task_added": task_added} 