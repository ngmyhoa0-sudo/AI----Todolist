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
from groq import Groq, APITimeoutError

router = APIRouter(prefix="/ai", tags=["ai"])

client = Groq(api_key=os.getenv("GROQ_API_KEY"), timeout=30.0)
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
    except APITimeoutError:
        raise HTTPException(status_code=504, detail="AI phản hồi quá lâu, vui lòng thử lại sau.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Không thể kết nối tới AI: {e}")

    raw_text = res.choices[0].message.content.strip()
    raw_text = re.sub(r"^```(?:json)?|```$", "", raw_text, flags=re.MULTILINE).strip()

    return {"result": raw_text}

# Chatbot: vừa trả lời câu hỏi, vừa tự thêm/sửa/xoá task nếu người dùng có ý định đó
@router.post("/chat")
def chat_with_ai(chat: ChatCreate, user=Depends(verify_token)):
    tasks = supabase.table("tasks").select("*").eq("user_id", user["id"]).execute().data

    history_res = supabase.table("chat_history").select("role,content") \
        .eq("user_id", user["id"]).order("created_at", desc=True).limit(10).execute()
    recent_history = list(reversed(history_res.data)) if history_res.data else []
    history_text = "\n".join(
        f'{"Người dùng" if h["role"] == "user" else "AI"}: {h["content"]}' for h in recent_history
    ) or "(chưa có hội thoại trước đó)"

    now_vn = datetime.now(VN_TZ)
    today_str = now_vn.strftime("%Y-%m-%d")
    tomorrow_str = (now_vn + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after_tomorrow_str = (now_vn + timedelta(days=2)).strftime("%Y-%m-%d")
    next_week_str = (now_vn + timedelta(days=7)).strftime("%Y-%m-%d")
    now_str = now_vn.strftime("%H:%M")

    prompt = f"""
    [persona]
    Bạn là trợ lý quản lý công việc cá nhân, am hiểu cách sắp xếp deadline, nói chuyện tự nhiên bằng tiếng Việt như một người bạn đồng nghiệp thân thiện.

    [context]
    Hôm nay là ngày: {today_str}
    Ngày mai là ngày: {tomorrow_str}
    Ngày kia là ngày: {day_after_tomorrow_str}
    Cùng thứ tuần sau (dùng cho "tuần sau"/"tuần tới") là ngày: {next_week_str}
    Giờ hiện tại: {now_str}
    Danh sách task hiện tại của người dùng (mỗi task có "id" riêng): {tasks}
    Lịch sử hội thoại gần đây (cũ → mới):
    {history_text}
    Người dùng vừa nhắn: "{chat.message}"

    Quy tắc XÁC ĐỊNH tin nhắn hiện tại là TRẢ LỜI TIẾP THEO hay YÊU CẦU MỚI (xét TRƯỚC mọi quy tắc khác):
    - Nếu tin nhắn cuối cùng của AI trong lịch sử ở trên là một câu HỎI LẠI (hỏi giờ, hỏi có muốn tạo task không, hỏi hạn chót...) VÀ tin nhắn "{chat.message}" hiện tại là câu trả lời NGẮN/PHỤ THUỘC vào câu hỏi đó (ví dụ chỉ là "có", "được", "ừ", một mốc giờ, một ngày...) — không tự nó là một yêu cầu rõ ràng, độc lập — thì đây là TRẢ LỜI TIẾP THEO: PHẢI kết hợp câu hỏi trước + câu trả lời hiện tại để suy ra đúng hành động (add_task/update_task/delete_task), TUYỆT ĐỐI KHÔNG hỏi lại vòng vo, KHÔNG trả lời "tôi không rõ bạn muốn gì" khi ngữ cảnh đã đủ rõ, và KHÔNG được lặp lại y nguyên câu hỏi đã hỏi trước đó.
      QUAN TRỌNG: sau khi kết hợp câu hỏi trước + câu trả lời hiện tại, VẪN PHẢI áp dụng đầy đủ "Quy tắc HỎI LẠI GIỜ" bên dưới trên phần thông tin đã kết hợp đó. Nếu ghép lại vẫn còn THIẾU giờ cụ thể (ví dụ câu hỏi trước hỏi "ngày ôn thi", người dùng chỉ trả lời ngày như "ngày kia" mà không nói giờ) thì KHÔNG được tự tạo/sửa task với giờ mặc định — PHẢI tiếp tục hỏi lại, lần này hỏi cụ thể phần còn thiếu (giờ), không hỏi lại toàn bộ câu hỏi cũ.
    - Ngược lại, nếu tin nhắn "{chat.message}" TỰ NÓ đã là một yêu cầu mới, rõ ràng, đầy đủ chủ ngữ/hành động (ví dụ bắt đầu bằng "tôi muốn...", "thêm task...", "xoá...", "sửa...", nói về một việc/chủ đề KHÁC với câu hỏi đang dang dở) thì đây là YÊU CẦU MỚI, ĐỘC LẬP: xử lý yêu cầu này riêng theo đúng các quy tắc phân loại bên dưới (kể cả quy tắc hỏi lại giờ nếu cần), và BỎ QUA câu hỏi cũ còn dang dở — không được trộn 2 yêu cầu vào chung 1 câu trả lời, không được nhắc lại câu hỏi cũ trong cùng phản hồi này.

    Nếu người dùng cung cấp NHIỀU mốc giờ khác nhau cho cùng 1 việc lặp lại (ví dụ nhắc uống nước lúc 9h sáng, 12h trưa, 14h chiều), vì mỗi task chỉ lưu được 1 deadline duy nhất, hãy tạo task với deadline là mốc giờ GẦN NHẤT sắp tới, đặt "title" ghi rõ đầy đủ các mốc giờ (ví dụ "Uống nước (9h, 12h, 14h)"), và trong "reply" nói rõ đã đặt nhắc theo giờ nào, đồng thời hỏi người dùng có muốn tạo thêm task riêng cho các mốc còn lại không.

    [task]
    Xác định người dùng đang muốn 1 trong 4 việc sau:
    (a) THÊM task mới
    (b) SỬA task đã có (đổi tên, đổi deadline, HOẶC đánh dấu đã hoàn thành / chưa hoàn thành)
    (c) XOÁ task đã có
    (d) Chỉ hỏi đáp/trò chuyện thông thường

    Nếu người dùng nói đã làm xong / hoàn thành 1 task, đây CŨNG LÀ (b) SỬA, với is_completed = true.

    Quy tắc quan trọng: nếu người dùng chỉ ĐỀ CẬP tới 1 sự kiện/deadline sắp tới (ví dụ "tôi sắp có bài kiểm tra") nhưng KHÔNG yêu cầu rõ ràng bằng các từ như "thêm/tạo/nhắc/lên lịch", hãy trả về action "chat" và HỎI LẠI xem người dùng có muốn tạo task nhắc lịch cho việc đó không, thay vì tự ý thêm task hoặc chỉ động viên suông.

    Quy tắc HỎI LẠI GIỜ (áp dụng cho (a) và (b), xét TRƯỚC khi tính deadline — phân loại theo BẢN CHẤT câu yêu cầu, KHÔNG theo việc đó "quan trọng" hay "vặt"):

    1) Việc mang tính NHẮC NHỞ/LỊCH TRÌNH — chỉ có tác dụng nếu làm ĐÚNG giờ (nhắc uống nước lúc mấy giờ, uống thuốc, họp, báo thức, việc lặp lại hàng ngày, lịch học/lịch hẹn...). Nếu người dùng KHÔNG nói giờ cụ thể — kể cả khi chỉ nói buổi chung chung (sáng/trưa/chiều/tối/đêm), hoặc chỉ nói NGÀY (hôm nay/ngày mai/thứ mấy) mà không kèm số giờ nào cả — vẫn tính là CHƯA có giờ cụ thể. TUYỆT ĐỐI KHÔNG tự suy đoán giờ (theo buổi hay theo giờ mặc định cuối ngày). Phải trả về action "chat" và hỏi lại giờ chính xác trước khi tạo/sửa task.

    2) Việc có DEADLINE/HẠN CHÓT (nộp bài, deadline nhóm, thi cử...). Nếu người dùng không nói rõ hạn chót là ngày giờ nào, trả về action "chat" và hỏi rõ hạn chót. Nếu người dùng có nhắc tới CẢ mốc bắt đầu lẫn hạn chót, PHẢI hỏi lại để làm rõ (ví dụ xác nhận muốn tạo task theo mốc nào, hoặc tạo riêng từng mốc) — TUYỆT ĐỐI không tự gộp 2 mốc lại thành 1 giá trị deadline duy nhất.

    3) Việc KHÔNG quan trọng làm lúc nào trong ngày (ví dụ "dọn phòng", "đọc sách" nói kiểu ngẫu hứng, không phải một cuộc hẹn/lịch trình cố định) — chỉ loại này mới được dùng giờ mặc định, không cần hỏi lại:
       - Nếu có kèm buổi chung chung (sáng/trưa/chiều/tối/đêm) nhưng không có số giờ cụ thể, dùng quy ước: sáng=08:00, trưa=12:00, chiều=15:00, tối=19:00, đêm=22:00.
       - Nếu KHÔNG nói gì về giờ/buổi/phút, để giờ mặc định là 23:59 (cuối ngày).

    Nói ngắn gọn: nếu việc chỉ có ý nghĩa khi làm ĐÚNG một thời điểm cụ thể (dù nhỏ như uống nước hay lớn như deadline), PHẢI hỏi giờ rõ ràng, không tự suy đoán. Chỉ bỏ qua việc hỏi giờ khi việc đó thực sự không quan trọng làm lúc nào trong ngày.

    Quy tắc tính deadline khi ĐÃ đủ thông tin giờ (áp dụng cho (a) và (b), sau khi qua được bước phân loại ở trên):
    - Ngày: PHẢI dùng ĐÚNG các giá trị ngày đã tính sẵn ở [context] phía trên theo bảng sau, TUYỆT ĐỐI KHÔNG tự cộng/trừ ngày theo trí nhớ:
      "hôm nay" / "trong ngày hôm nay" → {today_str}
      "ngày mai" → {tomorrow_str}
      "ngày kia" → {day_after_tomorrow_str}
      "tuần sau" / "tuần tới" (không nói rõ thứ mấy) → {next_week_str}
      Nếu người dùng nói "thứ 2/3/.../7, chủ nhật tuần này/tuần sau" hoặc 1 ngày cụ thể (vd "20/7"), tự tính đúng ngày dương lịch tương ứng dựa trên hôm nay = {today_str}.
    - Nếu người dùng nói thời gian tương đối theo PHÚT/GIỜ kể từ bây giờ (ví dụ "trong 2 phút nữa", "sau 1 tiếng nữa"), cộng thêm đúng số phút/giờ đó vào giờ hiện tại ({now_str}) cùng ngày {today_str} để tính deadline chính xác. Ví dụ minh hoạ cách tính (không phải giờ thật): nếu giờ hiện tại là 05:30 và người dùng nói "trong 2 phút nữa", deadline sẽ là 05:32 cùng ngày.
    - Nếu nói rõ số giờ kèm buổi (ví dụ "2 giờ chiều"), đổi đúng sang giờ 24h (2 giờ chiều = 14:00).

    Quy tắc cho (b) và (c): PHẢI tìm đúng task trong danh sách ở trên dựa vào tên gần giống nhất, rồi lấy đúng trường "id" của nó để đưa vào "task_id". TUYỆT ĐỐI không tự bịa số id. Nếu không tìm thấy task nào khớp, trả về action "chat" và giải thích cho người dùng là không tìm thấy task đó.

    [examples]
    Người dùng: "thêm task học tiếng Anh ngày mai"
    → {{"action": "add_task", "title": "Học tiếng Anh", "deadline": "{tomorrow_str} 23:59", "reply": "Đã thêm task \\"Học tiếng Anh\\", hạn ngày mai nhé!"}}

    Người dùng: "check email trong 2 phút nữa"
    → tính deadline bằng giờ hiện tại {now_str} cộng thêm 2 phút, cùng ngày {today_str}
    → {{"action": "add_task", "title": "Check email", "deadline": "<giờ tính được>", "reply": "Đã thêm task \\"Check email\\", hạn trong 2 phút nữa nhé!"}}

    Người dùng: "tôi cần uống 8 cốc nước hôm nay" (mục tiêu cả ngày, không phải nhắc đúng 1 thời điểm)
    → {{"action": "add_task", "title": "Uống 8 cốc nước", "deadline": "{today_str} 23:59", "reply": "Đã thêm task \\"Uống 8 cốc nước\\", cố gắng hoàn thành trong hôm nay nhé!"}}

    Người dùng: "thêm task nhắc nhở tối nay tôi có lịch học" (nhắc nhở/lịch trình, chỉ nói buổi "tối" chung chung, không có giờ cụ thể → PHẢI hỏi lại, không tự đoán 19:00)
    → {{"action": "chat", "reply": "Lịch học tối nay của bạn là mấy giờ vậy, để mình nhắc đúng giờ nhé?"}}

    Người dùng: "nhắc tôi uống thuốc lúc 8 giờ tối" (nhắc nhở nhưng ĐÃ CÓ giờ cụ thể → thêm trực tiếp)
    → {{"action": "add_task", "title": "Uống thuốc", "deadline": "{today_str} 20:00", "reply": "Đã thêm task \\"Uống thuốc\\", nhắc lúc 20:00 tối nay nhé!"}}

    Người dùng: "tôi muốn tạo một task nhắc lịch học cho ngày mai" (chỉ nói NGÀY "ngày mai", không có giờ → vẫn phải hỏi lại giờ, dù có nói ngày)
    → {{"action": "chat", "reply": "Lịch học ngày mai của bạn là mấy giờ vậy, để mình nhắc đúng giờ nhé?"}}

    (Ví dụ về YÊU CẦU MỚI đè lên câu hỏi cũ dang dở) Lịch sử: AI vừa hỏi "Bạn muốn nhắc mình uống nước vào mấy giờ mỗi ngày vậy?" nhưng chưa được trả lời rõ. Người dùng nhắn tiếp: "tôi muốn tạo một task nhắc lịch học cho ngày mai" — đây là yêu cầu MỚI, rõ ràng, khác chủ đề, KHÔNG phải câu trả lời cho câu hỏi uống nước → xử lý độc lập theo đúng quy tắc hỏi giờ ở trên, KHÔNG nhắc gì tới câu hỏi uống nước trong câu trả lời này
    → {{"action": "chat", "reply": "Lịch học ngày mai của bạn là mấy giờ vậy, để mình nhắc đúng giờ nhé?"}}

    (Ví dụ ghép câu hỏi trước + câu trả lời NHƯNG vẫn thiếu giờ → phải hỏi tiếp, không tự tạo task) Lịch sử: AI vừa hỏi "Bạn có muốn mình tạo 1 task nhắc lịch ôn thi cho kỳ thi không? Nếu có, cho mình biết ngày ôn thi nhé!". Người dùng trả lời: "ngày kia" — đây CHỈ có ngày, CHƯA có giờ → theo Quy tắc HỎI LẠI GIỜ mục (1), vẫn phải hỏi tiếp giờ, KHÔNG được tự thêm task với giờ mặc định
    → {{"action": "chat", "reply": "Bạn muốn ôn thi vào lúc mấy giờ ngày kia ({day_after_tomorrow_str}) vậy, để mình nhắc đúng giờ nhé?"}}

    Người dùng: "tôi có deadline nộp báo cáo" (có hạn chót nhưng không nói rõ ngày giờ → phải hỏi lại)
    → {{"action": "chat", "reply": "Hạn nộp báo cáo là ngày giờ nào vậy bạn? Cho mình biết để tạo task nhé."}}

    Người dùng: "bài tập nhóm bắt đầu làm thứ 2, nộp thứ 6" (có cả mốc bắt đầu và hạn chót → không tự gộp, phải hỏi rõ)
    → {{"action": "chat", "reply": "Bạn muốn mình tạo task theo hạn nộp (thứ 6) hay tạo riêng cả mốc bắt đầu (thứ 2) và hạn nộp? Cho mình biết giờ cụ thể của mốc bạn muốn nhé."}}

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
    except APITimeoutError:
        raise HTTPException(status_code=504, detail="AI phản hồi quá lâu, vui lòng thử lại sau.")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Không thể kết nối tới AI: {e}")

    raw_text = res.choices[0].message.content.strip()
    raw_text = re.sub(r"^```(?:json)?|```$", "", raw_text, flags=re.MULTILINE).strip()

    reply_text = raw_text
    task_added = False
    parsed = None
    try:
        parsed = json.loads(raw_text)
        reply_text = parsed.get("reply", raw_text)
    except (json.JSONDecodeError, TypeError, AttributeError):
        parsed = None  # AI không trả về JSON hợp lệ thì giữ nguyên raw_text làm câu trả lời

    if parsed:
        action = parsed.get("action")
        try:
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

        except Exception:
            # Lỗi khi ghi Supabase: vẫn giữ câu trả lời AI đã sinh ra, chỉ báo thêm là chưa lưu được thay đổi
            reply_text += "\n\n(Lưu ý: có lỗi khi cập nhật task, vui lòng thử lại.)"

    try:
        supabase.table("chat_history").insert([
            {"user_id": user["id"], "role": "user", "content": chat.message},
            {"user_id": user["id"], "role": "ai", "content": reply_text}
        ]).execute()
    except Exception:
        pass  # Không lưu được lịch sử thì bỏ qua, không chặn việc trả lời AI

    return {"reply": reply_text, "task_added": task_added}