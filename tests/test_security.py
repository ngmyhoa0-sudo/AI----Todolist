# test_security.py — Kiểm thử hộp trắng cho logic xác thực (verify_token) và phân quyền dữ liệu
import csv
import os
from types import SimpleNamespace

results = []


def _record(tc_id, precondition, expected, actual, passed):
    results.append({
        "Test Case": tc_id, "Precondition": precondition,
        "Expected": expected, "Actual": actual, "Kết quả": "PASS" if passed else "FAIL",
    })


def test_tc_sec_01_thieu_header_authorization(client_real_auth):
    res = client_real_auth.get("/todos")  # không gửi header Authorization
    passed = res.status_code == 422  # FastAPI tự báo thiếu header bắt buộc
    _record("TC-SEC-01", "Gọi API cần xác thực nhưng không gửi header Authorization", 422, res.status_code, passed)
    assert passed


def test_tc_sec_02_header_sai_dinh_dang(client_real_auth):
    res = client_real_auth.get("/todos", headers={"Authorization": "Basic xxxxx"})  # không phải "Bearer ..."
    passed = res.status_code == 401
    _record("TC-SEC-02", "Header Authorization sai định dạng (không phải Bearer)", 401, res.status_code, passed)
    assert passed


def test_tc_sec_03_token_khong_hop_le(client_real_auth, mock_supabase):
    mock_supabase.auth.get_user.side_effect = Exception("invalid token")
    res = client_real_auth.get("/todos", headers={"Authorization": "Bearer token-gia-hoac-het-han"})
    passed = res.status_code == 401
    _record("TC-SEC-03", "Token có định dạng Bearer nhưng không hợp lệ/hết hạn", 401, res.status_code, passed)
    assert passed


def test_tc_sec_04_luon_loc_theo_dung_user_id(client, mock_supabase):
    """Đảm bảo thao tác xoá task luôn kèm điều kiện lọc user_id — không cho xoá task của người khác."""
    chain = mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value
    chain.execute.return_value = SimpleNamespace(data=[])
    client.delete("/todos/1", headers={"Authorization": "Bearer fake-token"})

    eq_calls = mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.call_args_list
    called_with_correct_user = any(
        call.args == ("user_id", "test-user-id") for call in eq_calls
    )
    _record("TC-SEC-04", "Xoá task luôn kèm điều kiện .eq('user_id', <user hiện tại>)",
            "Có gọi .eq('user_id', 'test-user-id')", eq_calls, called_with_correct_user)
    assert called_with_correct_user


def test_zzz_xuat_bao_cao_security():
    if not results:
        return
    output_path = os.path.join(os.path.dirname(__file__), "report_security.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)
    print(f"\nBáo cáo đã xuất: {output_path}")