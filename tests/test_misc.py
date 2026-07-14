# test_misc.py — Kiểm thử hộp trắng cho endpoint gốc "/" và /chat/history
import csv
import os
from types import SimpleNamespace

AUTH_HEADERS = {"Authorization": "Bearer fake-token"}
results = []


def _record(tc_id, precondition, action, expected, actual, passed):
    results.append({
        "Test Case": tc_id, "Precondition": precondition, "Action": action,
        "Expected": expected, "Actual": actual, "Kết quả": "PASS" if passed else "FAIL",
    })


def test_tc_misc_01_root_endpoint(client):
    res = client.get("/")
    passed = res.status_code == 200 and "message" in res.json()
    _record("TC-MISC-01", "Server đang chạy", "GET /", 200, res.status_code, passed)
    assert passed


def test_tc_misc_02_lay_lich_su_chat(client, mock_supabase):
    fake_history = [{"id": 1, "role": "user", "content": "xin chào", "created_at": "2026-07-13T00:00:00"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = \
        SimpleNamespace(data=fake_history)
    res = client.get("/chat/history", headers=AUTH_HEADERS)
    passed = res.status_code == 200 and len(res.json()) == 1
    _record("TC-MISC-02", "User đã có 1 tin nhắn trong lịch sử", "GET /chat/history", 200, res.status_code, passed)
    assert passed


def test_tc_misc_03_luu_tin_nhan_thanh_cong(client, mock_supabase):
    mock_supabase.table.return_value.insert.return_value.execute.return_value = \
        SimpleNamespace(data=[{"id": 1, "role": "user", "content": "test"}])
    res = client.post("/chat/history", json={"message": "test", "role": "user"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-MISC-03", "Lưu 1 tin nhắn mới hợp lệ", "POST /chat/history", 200, res.status_code, passed)
    assert passed


def test_tc_misc_04_xoa_toan_bo_lich_su(client, mock_supabase):
    mock_supabase.table.return_value.delete.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=[])
    res = client.delete("/chat/history", headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-MISC-04", "Xoá toàn bộ lịch sử chat của user", "DELETE /chat/history", 200, res.status_code, passed)
    assert passed


def test_zzz_xuat_bao_cao_misc():
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_misc.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")