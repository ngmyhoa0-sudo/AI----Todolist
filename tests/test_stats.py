# test_stats.py — Kiểm thử hộp trắng cho GET /stats và các endpoint thống kê mới
import csv
import os
from types import SimpleNamespace
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

AUTH_HEADERS = {"Authorization": "Bearer fake-token"}
TZ = ZoneInfo("Asia/Ho_Chi_Minh")
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


def test_tc_stats_03_activity_summary_co_du_lieu(client, mock_supabase):
    fake_tasks = [
        {"deadline": "2026-01-10T10:00:00", "completed_at": None},
        {"deadline": None, "completed_at": "2026-03-05T09:00:00"},
        {"deadline": "2026-01-10T10:00:00", "completed_at": "2025-12-25T08:00:00"},
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/activity-summary", headers=AUTH_HEADERS)
    body = res.json()
    expected = {"days": ["2025-12-25", "2026-01-10", "2026-03-05"], "months": ["2025-12", "2026-01", "2026-03"], "earliestYear": 2025}
    passed = (
        res.status_code == 200
        and body["days"] == expected["days"]
        and body["months"] == expected["months"]
        and body["earliestYear"] == expected["earliestYear"]
    )
    _record("TC-STATS-03", "Có task với deadline/completed_at ở nhiều ngày khác nhau", expected, body, passed)
    assert passed


def test_tc_stats_04_activity_summary_rong(client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=[])
    res = client.get("/stats/activity-summary", headers=AUTH_HEADERS)
    body = res.json()
    current_year = datetime.now(TZ).year
    expected = {"days": [], "months": [], "earliestYear": current_year}
    passed = (
        res.status_code == 200
        and body["days"] == []
        and body["months"] == []
        and body["earliestYear"] == current_year
    )
    _record("TC-STATS-04", "User chưa có task nào", expected, body, passed)
    assert passed


def test_tc_stats_05_period_status_tuan_hien_tai(client, mock_supabase):
    now = datetime.now(TZ).replace(tzinfo=None, microsecond=0)
    fake_tasks = [
        {"is_completed": True, "deadline": now.isoformat()},
        {"is_completed": False, "deadline": (now - timedelta(hours=1)).isoformat()},
        {"is_completed": False, "deadline": (now + timedelta(hours=1)).isoformat()},
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/period-status?range=week&offset=0", headers=AUTH_HEADERS)
    body = res.json()
    expected = {"total": 3, "completed": 1, "active": 1, "overdue": 1}
    passed = res.status_code == 200 and body == expected
    _record("TC-STATS-05", "Tuần hiện tại có 1 hoàn thành, 1 quá hạn, 1 đang làm", expected, body, passed)
    assert passed


def test_tc_stats_06_period_status_thang_khong_co_du_lieu(client, mock_supabase):
    fake_tasks = [{"is_completed": False, "deadline": "2000-01-15T10:00:00"}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/period-status?range=month&offset=0", headers=AUTH_HEADERS)
    body = res.json()
    expected = {"total": 0, "completed": 0, "active": 0, "overdue": 0}
    passed = res.status_code == 200 and body == expected
    _record("TC-STATS-06", "Task có deadline ngoài tháng đang xem (năm 2000)", expected, body, passed)
    assert passed


def test_tc_stats_07_completed_by_day(client, mock_supabase):
    now = datetime.now(TZ).replace(tzinfo=None, microsecond=0)
    fake_tasks = [{"completed_at": now.isoformat()}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/completed-by-day?offset=0", headers=AUTH_HEADERS)
    body = res.json()
    day_index = (now.weekday() + 1) % 7
    passed = (
        res.status_code == 200
        and len(body["counts"]) == 7
        and body["counts"][day_index] == 1
        and sum(body["counts"]) == 1
    )
    _record("TC-STATS-07", "1 task hoàn thành hôm nay, kiểm tra đúng cột ngày trong tuần", f"counts[{day_index}]=1", body.get("counts"), passed)
    assert passed


def test_tc_stats_08_completed_by_month_days(client, mock_supabase):
    now = datetime.now(TZ).replace(tzinfo=None, microsecond=0)
    fake_tasks = [{"completed_at": now.isoformat()}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/completed-by-month-days?offset=0", headers=AUTH_HEADERS)
    body = res.json()
    passed = (
        res.status_code == 200
        and body["year"] == now.year
        and body["month"] == now.month
        and body["counts"][now.day - 1] == 1
        and sum(body["counts"]) == 1
    )
    _record("TC-STATS-08", "1 task hoàn thành hôm nay, kiểm tra đúng cột ngày trong tháng", f"counts[{now.day - 1}]=1", body.get("counts"), passed)
    assert passed


def test_tc_stats_09_completed_by_month_khong_co_nam_truoc(client, mock_supabase):
    now = datetime.now(TZ).replace(tzinfo=None, microsecond=0)
    fake_tasks = [{"completed_at": now.isoformat()}]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/completed-by-month?offset=0", headers=AUTH_HEADERS)
    body = res.json()
    passed = (
        res.status_code == 200
        and body["currentYear"] == now.year
        and body["currentCounts"][now.month - 1] == 1
        and body["prevCounts"] is None
    )
    _record("TC-STATS-09", "Chỉ có task hoàn thành năm nay, không có năm trước", "prevCounts=None", body.get("prevCounts"), passed)
    assert passed


def test_tc_stats_10_completed_by_month_co_nam_truoc(client, mock_supabase):
    now = datetime.now(TZ).replace(tzinfo=None, microsecond=0)
    prev_year_date = datetime(now.year - 1, 6, 15, 10, 0)
    fake_tasks = [
        {"completed_at": now.isoformat()},
        {"completed_at": prev_year_date.isoformat()},
    ]
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = \
        SimpleNamespace(data=fake_tasks)
    res = client.get("/stats/completed-by-month?offset=0", headers=AUTH_HEADERS)
    body = res.json()
    passed = (
        res.status_code == 200
        and body["prevYear"] == now.year - 1
        and body["prevCounts"] is not None
        and body["prevCounts"][5] == 1  # tháng 6 = index 5
    )
    _record("TC-STATS-10", "Có task hoàn thành cả năm nay và năm trước (tháng 6)", "prevCounts[5]=1", body.get("prevCounts"), passed)
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