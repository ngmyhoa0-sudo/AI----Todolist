# test_todos.py — Kiểm thử hộp trắng cho các endpoint /todos
# Kỹ thuật: luồng điều khiển (CRUD) + luồng dữ liệu (biến deadline/title qua các trạng thái)
import csv
import os
from types import SimpleNamespace
from datetime import datetime
from postgrest.exceptions import APIError

from app.routers.todo import _advance_deadline

AUTH_HEADERS = {"Authorization": "Bearer fake-token"}

results = []


def _record(tc_id, precondition, action, expected_status, actual_status, passed):
    results.append({
        "Test Case": tc_id,
        "Precondition": precondition,
        "Action": action,
        "Expected Status": expected_status,
        "Actual Status": actual_status,
        "Kết quả": "PASS" if passed else "FAIL",
    })


def _rls_error():
    return APIError({
        "message": 'new row violates row-level security policy for table "tasks"',
        "code": "42501", "hint": None, "details": None,
    })


def _other_db_error():
    return APIError({"message": "connection error", "code": "08000", "hint": None, "details": None})


# ---------- GET /todos ----------

def test_tc_todo_01_get_todos_rong(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=[])
    res = client.get("/todos", headers=AUTH_HEADERS)
    passed = res.status_code == 200 and res.json() == []
    _record("TC-TODO-01", "User chưa có task nào", "GET /todos", 200, res.status_code, passed)
    assert passed


def test_tc_todo_02_get_todos_co_du_lieu(client, mock_supabase):
    fake_data = [{"id": 1, "title": "Học bài", "deadline": None, "is_completed": False, "user_id": "test-user-id"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_data)
    res = client.get("/todos", headers=AUTH_HEADERS)
    passed = res.status_code == 200 and len(res.json()) == 1
    _record("TC-TODO-02", "User đã có 1 task", "GET /todos", 200, res.status_code, passed)
    assert passed


def test_tc_todo_03_get_todos_loi_phien_het_han(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = _rls_error()
    res = client.get("/todos", headers=AUTH_HEADERS)
    passed = res.status_code == 401
    _record("TC-TODO-03", "Token/phiên đã hết hạn giữa chừng", "GET /todos", 401, res.status_code, passed)
    assert passed


def test_tc_todo_04_get_todos_loi_server_khac(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = _other_db_error()
    res = client.get("/todos", headers=AUTH_HEADERS)
    passed = res.status_code == 500
    _record("TC-TODO-04", "Lỗi kết nối database không liên quan RLS", "GET /todos", 500, res.status_code, passed)
    assert passed


# ---------- POST /todos ----------

def test_tc_todo_05_create_thanh_cong_co_deadline(client, mock_supabase):
    mock_supabase.table.return_value.insert.return_value.execute.return_value = \
        SimpleNamespace(data=[{"id": 2, "title": "Ôn thi", "deadline": "2026-07-20T08:00:00", "is_completed": False}])
    res = client.post("/todos", json={"title": "Ôn thi", "deadline": "2026-07-20T08:00:00"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-TODO-05", "Nhập tên task + deadline hợp lệ", "POST /todos", 200, res.status_code, passed)
    assert passed


def test_tc_todo_06_create_thanh_cong_khong_deadline(client, mock_supabase):
    mock_supabase.table.return_value.insert.return_value.execute.return_value = \
        SimpleNamespace(data=[{"id": 3, "title": "Đọc sách", "deadline": None, "is_completed": False}])
    res = client.post("/todos", json={"title": "Đọc sách"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-TODO-06", "Nhập tên task, bỏ trống deadline", "POST /todos", 200, res.status_code, passed)
    assert passed


def test_tc_todo_07_create_that_bai_ten_rong(client, mock_supabase):
    res = client.post("/todos", json={"title": "   "}, headers=AUTH_HEADERS)
    passed = res.status_code == 422
    _record("TC-TODO-07", "Tên task chỉ có khoảng trắng", "POST /todos", 422, res.status_code, passed)
    assert passed


def test_tc_todo_08_create_that_bai_ky_tu_dac_biet(client, mock_supabase):
    res = client.post("/todos", json={"title": "!!!---..."}, headers=AUTH_HEADERS)
    passed = res.status_code == 422
    _record("TC-TODO-08", "Tên task chỉ toàn ký tự đặc biệt", "POST /todos", 422, res.status_code, passed)
    assert passed


def test_tc_todo_09_create_loi_phien_het_han(client, mock_supabase):
    mock_supabase.table.return_value.insert.return_value.execute.side_effect = _rls_error()
    res = client.post("/todos", json={"title": "Task bất kỳ"}, headers=AUTH_HEADERS)
    passed = res.status_code == 401
    _record("TC-TODO-09", "Token/phiên đã hết hạn khi đang thêm task", "POST /todos", 401, res.status_code, passed)
    assert passed


# ---------- PUT /todos/{id} ----------

def test_tc_todo_10_update_doi_ten_thanh_cong(client, mock_supabase):
    chain = mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value
    chain.execute.return_value = SimpleNamespace(data=[{"id": 1, "title": "Tên mới"}])
    res = client.put("/todos/1", json={"title": "Tên mới"}, headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-TODO-10", "Task đã tồn tại, đổi tên hợp lệ", "PUT /todos/1", 200, res.status_code, passed)
    assert passed


def test_tc_todo_11_update_danh_dau_hoan_thanh(client, mock_supabase):
    select_chain = mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value
    select_chain.execute.return_value = SimpleNamespace(data=[])

    chain = mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value
    chain.execute.return_value = SimpleNamespace(data=[{"id": 1, "is_completed": True}])
    res = client.put("/todos/1", json={"is_completed": True}, headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-TODO-11", "Đánh dấu task đã hoàn thành", "PUT /todos/1", 200, res.status_code, passed)
    assert passed


def test_tc_todo_12_update_that_bai_ten_rong(client, mock_supabase):
    res = client.put("/todos/1", json={"title": ""}, headers=AUTH_HEADERS)
    passed = res.status_code == 422
    _record("TC-TODO-12", "Sửa tên task thành chuỗi rỗng", "PUT /todos/1", 422, res.status_code, passed)
    assert passed


# ---------- DELETE /todos/{id} ----------

def test_tc_todo_13_delete_thanh_cong(client, mock_supabase):
    chain = mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value
    chain.execute.return_value = SimpleNamespace(data=[])
    res = client.delete("/todos/1", headers=AUTH_HEADERS)
    passed = res.status_code == 200
    _record("TC-TODO-13", "Task tồn tại và thuộc về user", "DELETE /todos/1", 200, res.status_code, passed)
    assert passed


def test_tc_todo_14_delete_loi_phien_het_han(client, mock_supabase):
    chain = mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value
    chain.execute.side_effect = _rls_error()
    res = client.delete("/todos/1", headers=AUTH_HEADERS)
    passed = res.status_code == 401
    _record("TC-TODO-14", "Token/phiên đã hết hạn khi đang xoá task", "DELETE /todos/1", 401, res.status_code, passed)
    assert passed


# ---------- _advance_deadline (logic task lặp lại) ----------

def test_tc_todo_15_lap_lai_hang_ngay():
    start = datetime(2026, 1, 15, 10, 0)
    result = _advance_deadline(start, "daily")
    expected = datetime(2026, 1, 16, 10, 0)
    passed = result == expected
    _record("TC-TODO-15", "Task lặp lại hàng ngày (daily)", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_16_lap_lai_ngay_trong_tuan_qua_cuoi_tuan():
    # 2024-01-05 là thứ Sáu -> phải nhảy qua thứ 7, CN, dừng ở thứ 2 (2024-01-08)
    start = datetime(2024, 1, 5, 9, 0)
    result = _advance_deadline(start, "weekday")
    expected = datetime(2024, 1, 8, 9, 0)
    passed = result == expected
    _record("TC-TODO-16", "Task lặp lại ngày trong tuần (weekday), rơi vào thứ Sáu", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_17_lap_lai_hang_tuan():
    start = datetime(2026, 1, 1, 8, 0)
    result = _advance_deadline(start, "weekly")
    expected = datetime(2026, 1, 8, 8, 0)
    passed = result == expected
    _record("TC-TODO-17", "Task lặp lại hàng tuần (weekly)", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_18_lap_lai_hang_thang_binh_thuong():
    start = datetime(2026, 3, 15, 14, 0)
    result = _advance_deadline(start, "monthly")
    expected = datetime(2026, 4, 15, 14, 0)
    passed = result == expected
    _record("TC-TODO-18", "Task lặp lại hàng tháng, ngày bình thường", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_19_lap_lai_hang_thang_thang_thieu_ngay():
    # 31/1 lặp hàng tháng, tháng 2/2026 chỉ có 28 ngày -> phải lùi về 28/2, không lỗi ngày không tồn tại
    start = datetime(2026, 1, 31, 23, 59)
    result = _advance_deadline(start, "monthly")
    expected = datetime(2026, 2, 28, 23, 59)
    passed = result == expected
    _record("TC-TODO-19", "Task lặp hàng tháng vào ngày 31, tháng sau chỉ có 28 ngày", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_20_lap_lai_hang_nam_binh_thuong():
    start = datetime(2026, 5, 20, 7, 0)
    result = _advance_deadline(start, "yearly")
    expected = datetime(2027, 5, 20, 7, 0)
    passed = result == expected
    _record("TC-TODO-20", "Task lặp lại hàng năm, ngày bình thường", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_tc_todo_21_lap_lai_hang_nam_ngay_nhuan():
    # 29/2/2024 (năm nhuận) lặp hàng năm -> 2025 không nhuận, phải lùi về 28/2
    start = datetime(2024, 2, 29, 12, 0)
    result = _advance_deadline(start, "yearly")
    expected = datetime(2025, 2, 28, 12, 0)
    passed = result == expected
    _record("TC-TODO-21", "Task lặp hàng năm rơi đúng 29/2 năm nhuận", "_advance_deadline", str(expected), str(result), passed)
    assert passed


def test_zzz_xuat_bao_cao_todos():
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_todos.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")