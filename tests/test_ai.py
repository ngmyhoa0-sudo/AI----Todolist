# test_ai.py — Kiểm thử hộp trắng cho /ai/chat và /ai/parse-task
# Kỹ thuật: giả lập phản hồi Groq, kiểm tra backend thực thi đúng action (add/update/delete)
import csv
import os
import json
from types import SimpleNamespace

import app.routers.ai as ai_router

AUTH_HEADERS = {"Authorization": "Bearer fake-token"}

results = []


def _record(tc_id, precondition, action, expected, actual, passed):
    results.append({
        "Test Case": tc_id, "Precondition": precondition, "Action": action,
        "Expected": expected, "Actual": actual, "Kết quả": "PASS" if passed else "FAIL",
    })


def _mock_groq_reply(monkeypatch, content: str):
    """Giả lập Groq trả về đúng chuỗi `content` cho lần gọi tiếp theo."""
    fake_response = SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=content))])
    monkeypatch.setattr(ai_router.client.chat.completions, "create", lambda **kw: fake_response)


def _bare_exception(cls, msg="loi gia lap"):
    e = cls.__new__(cls)
    e.args = (msg,)
    return e


def _setup_empty_context(mock_supabase):
    """Giả lập danh sách task & lịch sử chat rỗng — dùng chung cho các TC không cần task có sẵn."""
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=[])
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.limit.return_value \
        .execute.return_value = SimpleNamespace(data=[])


def test_tc_ai_01_chat_them_task_thanh_cong(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [{"action": "add_task", "title": "Học tiếng Anh", "deadline": "2026-07-20 23:59"}],
        "reply": "Đã thêm task Học tiếng Anh nhé!",
    }))
    res = client.post("/ai/chat", json={"message": "thêm task học tiếng Anh"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is True
    _record("TC-AI-01", "AI trả về 1 action add_task", "POST /ai/chat", "task_added=True", res.json().get("task_added"), passed)
    assert passed


def test_tc_ai_02_chat_chi_tro_chuyen(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [], "reply": "Bạn chưa có task nào cả.",
    }))
    res = client.post("/ai/chat", json={"message": "tôi còn bao nhiêu task"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is False
    _record("TC-AI-02", "AI trả về actions rỗng (chỉ hỏi đáp)", "POST /ai/chat", "task_added=False", res.json().get("task_added"), passed)
    assert passed


def test_tc_ai_03_chat_them_nhieu_task_cung_luc(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [
            {"action": "add_task", "title": "Đi chợ", "deadline": "2026-07-20 10:00"},
            {"action": "add_task", "title": "Thăm ông bà", "deadline": "2026-07-21 09:00"},
        ],
        "reply": "Đã thêm 2 task nhé!",
    }))
    res = client.post("/ai/chat", json={"message": "tạo lịch đi chợ và thăm ông bà"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is True
    insert_calls = ai_router.supabase.table.return_value.insert.call_count
    passed = passed and insert_calls >= 2  # 2 lần insert task + có thể thêm insert chat_history
    _record("TC-AI-03", "AI trả về mảng 2 actions add_task", "POST /ai/chat", ">=2 lần insert", insert_calls, passed)
    assert passed


def test_tc_ai_04_chat_sua_deadline_task(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [{"action": "update_task", "task_id": 7, "deadline": "2026-07-21 15:00"}],
        "reply": "Đã sửa deadline cuộc họp nhé!",
    }))
    res = client.post("/ai/chat", json={"message": "sửa cuộc họp thành 3h chiều mai"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is True
    _record("TC-AI-04", "AI trả về action update_task đổi deadline", "POST /ai/chat", "task_added=True", res.json().get("task_added"), passed)
    assert passed


def test_tc_ai_05_chat_danh_dau_hoan_thanh(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [{"action": "update_task", "task_id": 9, "is_completed": True}],
        "reply": "Đã đánh dấu hoàn thành!",
    }))
    res = client.post("/ai/chat", json={"message": "tôi đã học bài xong rồi"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is True
    _record("TC-AI-05", "AI trả về action update_task is_completed=true", "POST /ai/chat", "task_added=True", res.json().get("task_added"), passed)
    assert passed


def test_tc_ai_06_chat_xoa_task(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    _mock_groq_reply(monkeypatch, json.dumps({
        "actions": [{"action": "delete_task", "task_id": 7}],
        "reply": "Đã xoá task cuộc họp!",
    }))
    res = client.post("/ai/chat", json={"message": "xoá task cuộc họp"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json().get("task_added") is True
    _record("TC-AI-06", "AI trả về action delete_task", "POST /ai/chat", "task_added=True", res.json().get("task_added"), passed)
    assert passed


def test_tc_ai_07_chat_groq_timeout(client, mock_supabase, monkeypatch):
    _setup_empty_context(mock_supabase)
    from groq import APITimeoutError
    monkeypatch.setattr(
        ai_router.client.chat.completions, "create",
        lambda **kw: (_ for _ in ()).throw(_bare_exception(APITimeoutError)),
    )
    res = client.post("/ai/chat", json={"message": "bất kỳ"}, headers=AUTH_HEADERS)
    passed = res.status_code == 504
    _record("TC-AI-07", "Groq API timeout khi đang xử lý", "POST /ai/chat", 504, res.status_code, passed)
    assert passed


def test_tc_ai_08_parse_task_thanh_cong(client, mock_supabase, monkeypatch):
    _mock_groq_reply(monkeypatch, json.dumps({"title": "Họp nhóm", "deadline": "2026-07-21"}, ensure_ascii=False))
    res = client.post("/ai/parse-task", json={"text": "họp nhóm ngày mai"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200 and "Họp nhóm" in res.json().get("result", "")
    _record("TC-AI-08", "AI trích xuất đúng tên task từ ngôn ngữ tự nhiên", "POST /ai/parse-task", 200, res.status_code, passed)
    assert passed


def test_zzz_xuat_bao_cao_ai():
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_ai.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")