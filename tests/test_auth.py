# test_auth.py — Kiểm thử hộp trắng cho các endpoint /auth/*
# Kỹ thuật: luồng điều khiển (control flow) — mỗi TC tương ứng 1 nhánh rẽ (thành công/thất bại)
import csv
import os
from types import SimpleNamespace


def _fake_session(access="fake-access-token", refresh="fake-refresh-token", user_id="u1", email="test@example.com"):
    return SimpleNamespace(
        session=SimpleNamespace(access_token=access, refresh_token=refresh),
        user=SimpleNamespace(id=user_id, email=email),
    )


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


def test_tc_auth_01_register_thanh_cong(client, mock_supabase):
    mock_supabase.auth.sign_up.return_value = None
    res = client.post("/auth/register", json={"email": "new@example.com", "password": "123456"})
    passed = res.status_code == 200
    _record("TC-AUTH-01", "Email chưa tồn tại", "POST /auth/register", 200, res.status_code, passed)
    assert passed


def test_tc_auth_02_register_that_bai_email_da_ton_tai(client, mock_supabase):
    mock_supabase.auth.sign_up.side_effect = Exception("email exists")
    res = client.post("/auth/register", json={"email": "exist@example.com", "password": "123456"})
    passed = res.status_code == 400
    _record("TC-AUTH-02", "Email đã tồn tại", "POST /auth/register", 400, res.status_code, passed)
    assert passed


def test_tc_auth_03_login_thanh_cong(client, mock_supabase):
    mock_supabase.auth.sign_in_with_password.return_value = _fake_session()
    res = client.post("/auth/login", json={"email": "test@example.com", "password": "123456"})
    passed = res.status_code == 200 and "access_token" in res.json() and "refresh_token" in res.json()
    _record("TC-AUTH-03", "Email/mật khẩu đúng", "POST /auth/login", 200, res.status_code, passed)
    assert passed


def test_tc_auth_04_login_sai_mat_khau(client, mock_supabase):
    mock_supabase.auth.sign_in_with_password.side_effect = Exception("invalid credentials")
    res = client.post("/auth/login", json={"email": "test@example.com", "password": "saipass"})
    passed = res.status_code == 401
    _record("TC-AUTH-04", "Mật khẩu sai", "POST /auth/login", 401, res.status_code, passed)
    assert passed


def test_tc_auth_05_guest_login_thanh_cong(client, mock_supabase):
    mock_supabase.auth.sign_in_anonymously.return_value = _fake_session()
    res = client.post("/auth/guest")
    passed = res.status_code == 200 and "access_token" in res.json()
    _record("TC-AUTH-05", "Chưa đăng nhập, bấm 'Dùng thử với tư cách khách'", "POST /auth/guest", 200, res.status_code, passed)
    assert passed


def test_tc_auth_06_guest_login_that_bai(client, mock_supabase):
    mock_supabase.auth.sign_in_anonymously.side_effect = Exception("anonymous sign-in disabled")
    res = client.post("/auth/guest")
    passed = res.status_code == 500
    _record("TC-AUTH-06", "Supabase chưa bật Anonymous Sign-in", "POST /auth/guest", 500, res.status_code, passed)
    assert passed


def test_tc_auth_07_refresh_token_thanh_cong(client, mock_supabase):
    mock_supabase.auth.refresh_session.return_value = _fake_session(access="new-token", refresh="new-refresh")
    res = client.post("/auth/refresh", json={"refresh_token": "old-refresh-token"})
    passed = res.status_code == 200 and res.json().get("access_token") == "new-token"
    _record("TC-AUTH-07", "Refresh token còn hợp lệ", "POST /auth/refresh", 200, res.status_code, passed)
    assert passed


def test_tc_auth_08_refresh_token_het_han(client, mock_supabase):
    mock_supabase.auth.refresh_session.side_effect = Exception("refresh token expired")
    res = client.post("/auth/refresh", json={"refresh_token": "expired-token"})
    passed = res.status_code == 401
    _record("TC-AUTH-08", "Refresh token đã hết hạn/không hợp lệ", "POST /auth/refresh", 401, res.status_code, passed)
    assert passed


def test_zzz_xuat_bao_cao_auth():
    """Đặt tên bắt đầu bằng 'zzz' để pytest chạy SAU CÙNG trong file này, đảm bảo results đã đủ dữ liệu."""
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_auth.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")