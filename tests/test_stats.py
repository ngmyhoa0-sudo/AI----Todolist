# test_stats.py — Kiểm thử hộp trắng cho GET /stats
import csv
import os
from types import SimpleNamespace

AUTH_HEADERS = {"Authorization": "Bearer fake-token"}
results = []


def _record(tc_id, precondition, expected, actual, passed):
    results.append({
        "Test Case": tc_id, "Precondition": precondition,
        "Expected": expected, "Actual": actual, "Kết quả": "PASS" if passed else "FAIL",
    })


def test_tc_stats_01_tinh_dung_so_lieu(client, mock_supabase):
    fake_tasks = [
        {"id": 1, "is_completed": True, "deadline": None},
        {"id": 2, "is_completed": False, "deadline": "2020-01-01T00:00:00"},  # quá hạn (quá khứ)
        {"id": 3, "is_completed": False, "deadline": "2099-01-01T00:00:00"},  # còn hạn (tương lai)
        {"id": 4, "is_completed": False, "deadline": None},                   # đang làm, không deadline
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats", headers=AUTH_HEADERS)
    body = res.json()
    expected = {"total": 4, "completed": 1, "active": 2, "overdue": 1}
    passed = res.status_code == 200 and body == expected
    _record("TC-STATS-01", "Có 4 task: 1 hoàn thành, 1 quá hạn, 2 đang làm", expected, body, passed)
    assert passed


def test_tc_stats_02_khong_co_task_nao(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=[])
    res = client.get("/stats", headers=AUTH_HEADERS)
    body = res.json()
    expected = {"total": 0, "completed": 0, "active": 0, "overdue": 0}
    passed = res.status_code == 200 and body == expected
    _record("TC-STATS-02", "User chưa có task nào", expected, body, passed)
    assert passed


def test_zzz_xuat_bao_cao_stats():
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_stats.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")