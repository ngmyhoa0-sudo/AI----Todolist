import re
import os
import json

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

VN_TZ = ZoneInfo("Asia/Ho_Chi_Minh")
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

# Chatbot: vừa trả lời câu hỏi, vừa tự thêm/sửa/xoá task nếu người dùng có ý định đó
@router.post("/chat")
def chat_with_ai(chat: ChatCreate, user=Depends(verify_token)):
    tasks = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute().data

    now_vn = datetime.now(VN_TZ)
    today_str = now_vn.strftime("%Y-%m-%d")
    tomorrow_str = (now_vn + timedelta(days=1)).strftime("%Y-%m-%d")
    now_str = now_vn.strftime("%H:%M")

    prompt = f"""
    [persona]
    Bạn là trợ lý quản lý công việc cá nhân, am hiểu cách sắp xếp deadline, nói chuyện tự nhiên bằng tiếng Việt như một người bạn đồng nghiệp thân thiện.

    [context]
    Hôm nay là ngày: {today_str}
    Ngày mai là ngày: {tomorrow_str}
    Giờ hiện tại: {now_str}
    Danh sách task hiện tại của người dùng (mỗi task có "id" riêng): {tasks}
    Người dùng vừa nhắn: "{chat.message}"

    [task]
    Xác định người dùng đang muốn 1 trong 4 việc sau:
    (a) THÊM task mới
    (b) SỬA task đã có (đổi tên, đổi deadline, HOẶC đánh dấu đã hoàn thành / chưa hoàn thành)
    (c) XOÁ task đã có
    (d) Chỉ hỏi đáp/trò chuyện thông thường

    Nếu người dùng nói đã làm xong / hoàn thành 1 task, đây CŨNG LÀ (b) SỬA, với is_completed = true.

    Quy tắc quan trọng: nếu người dùng chỉ ĐỀ CẬP tới 1 sự kiện/deadline sắp tới (ví dụ "tôi sắp có bài kiểm tra") nhưng KHÔNG yêu cầu rõ ràng bằng các từ như "thêm/tạo/nhắc/lên lịch", hãy trả về action "chat" và HỎI LẠI xem người dùng có muốn tạo task nhắc lịch cho việc đó không, thay vì tự ý thêm task hoặc chỉ động viên suông.

    Quy tắc tính deadline (áp dụng cho (a) và (b)):
    - Ngày: tính CHÍNH XÁC theo "hôm nay" = {today_str}, "ngày mai" = {tomorrow_str}.
    - Nếu người dùng nói thời gian tương đối theo PHÚT/GIỜ kể từ bây giờ (ví dụ "trong 2 phút nữa", "sau 1 tiếng nữa"), cộng thêm đúng số phút/giờ đó vào giờ hiện tại ({now_str}) cùng ngày {today_str} để tính deadline chính xác. Ví dụ minh hoạ cách tính (không phải giờ thật): nếu giờ hiện tại là 05:30 và người dùng nói "trong 2 phút nữa", deadline sẽ là 05:32 cùng ngày.
    - Nếu nói buổi chung chung không kèm số giờ cụ thể (sáng/trưa/chiều/tối/đêm), dùng quy ước: sáng=08:00, trưa=12:00, chiều=15:00, tối=19:00, đêm=22:00.
    - Nếu nói rõ số giờ kèm buổi (ví dụ "2 giờ chiều"), đổi đúng sang giờ 24h (2 giờ chiều = 14:00).
    - Nếu KHÔNG nói gì cụ thể về giờ/buổi/phút (ví dụ chỉ nói "hôm nay", "trong ngày hôm nay"), để giờ mặc định là **23:59** (cuối ngày) — vì đây là việc cần hoàn thành trong ngày, không phải việc gấp trong vài phút tới.

    Quy tắc cho (b) và (c): PHẢI tìm đúng task trong danh sách ở trên dựa vào tên gần giống nhất, rồi lấy đúng trường "id" của nó để đưa vào "task_id". TUYỆT ĐỐI không tự bịa số id. Nếu không tìm thấy task nào khớp, trả về action "chat" và giải thích cho người dùng là không tìm thấy task đó.

    [examples]
    Người dùng: "thêm task học tiếng Anh ngày mai"
    → {{"action": "add_task", "title": "Học tiếng Anh", "deadline": "{tomorrow_str} 23:59", "reply": "Đã thêm task \\"Học tiếng Anh\\", hạn ngày mai nhé!"}}

    Người dùng: "check email trong 2 phút nữa"
    → tính deadline bằng giờ hiện tại {now_str} cộng thêm 2 phút, cùng ngày {today_str}
    → {{"action": "add_task", "title": "Check email", "deadline": "<giờ tính được>", "reply": "Đã thêm task \\"Check email\\", hạn trong 2 phút nữa nhé!"}}

    Người dùng: "tôi cần uống 8 cốc nước hôm nay"
    → {{"action": "add_task", "title": "Uống 8 cốc nước", "deadline": "{today_str} 23:59", "reply": "Đã thêm task \\"Uống 8 cốc nước\\", cố gắng hoàn thành trong hôm nay nhé!"}}

    Người dùng: "tôi sắp có bài kiểm tra toán"
    → {{"action": "chat", "reply": "Bạn có muốn mình tạo 1 task nhắc lịch ôn thi cho bài kiểm tra toán không? Nếu có, cho mình biết ngày thi nhé!"}}

    Người dùng: "sửa cuộc họp thành 3 giờ chiều mai" (giả sử tìm thấy task "Cuộc họp" có id là 7 trong danh sách)
    → {{"action": "update_task", "task_id": 7, "deadline": "{tomorrow_str} 15:00", "reply": "Đã sửa deadline \\"Cuộc họp\\" sang 3 giờ chiều mai nhé!"}}

    Người dùng: "xoá task cuộc họp đi"  (giả sử tìm thấy task "Cuộc họp" có id là 7 trong danh sách)
    → {{"action": "delete_task", "task_id": 7, "reply": "Đã xoá task \\"Cuộc họp\\" nhé!"}}

    Người dùng: "tôi còn bao nhiêu task chưa xong"
    → {{"action": "chat", "reply": "Bạn còn 2 task chưa hoàn thành: ..."}}

    Người dùng: "tôi đã hoàn thành học bài rồi" (giả sử tìm thấy task "Học bài" có id là 9 trong danh sách)
    → {{"action": "update_task", "task_id": 9, "is_completed": true, "reply": "Tuyệt vời! Đã đánh dấu \\"Học bài\\" hoàn thành nhé!"}}

    [format]
    Chỉ trả về DUY NHẤT 1 dòng JSON hợp lệ theo đúng 1 trong 4 cấu trúc:
    - Thêm: {{"action": "add_task", "title": "...", "deadline": "YYYY-MM-DD HH:MM hoặc null", "reply": "..."}}
    - Sửa: {{"action": "update_task", "task_id": <số>, "title": "... hoặc null", "deadline": "YYYY-MM-DD HH:MM hoặc null", "is_completed": true/false/null, "reply": "..."}}
    - Xoá: {{"action": "delete_task", "task_id": <số>, "reply": "..."}}
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
        action = parsed.get("action")

        if action == "add_task" and parsed.get("title"):
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

        elif action == "update_task" and parsed.get("task_id"):
            update_data = {}
            title = parsed.get("title")
            if isinstance(title, str) and title.strip().lower() != "null" and title.strip():
                update_data["title"] = title
            deadline = parsed.get("deadline")
            if isinstance(deadline, str) and deadline.strip().lower() != "null" and deadline.strip():
                update_data["deadline"] = deadline
            is_completed = parsed.get("is_completed")
            if isinstance(is_completed, bool):
                update_data["is_completed"] = is_completed
            if update_data:
                supabase.table("tasks").update(update_data) \
                    .eq("id", parsed["task_id"]).eq("user_id", user["id"]).execute()
                task_added = True

        elif action == "delete_task" and parsed.get("task_id"):
            supabase.table("tasks").delete() \
                .eq("id", parsed["task_id"]).eq("user_id", user["id"]).execute()
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