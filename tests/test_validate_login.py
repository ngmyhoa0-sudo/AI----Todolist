# test_validate_login.py
import csv
import os
import re

# ==================== HÀM LOGIC CẦN TEST ====================
def validate_login(email, password):
    email_clean = email.strip() if email else email

    if not email_clean:
        return False, "Email là bắt buộc"
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email_clean):
        return False, "Email không hợp lệ"
    if not password:
        return False, "Password là bắt buộc"
    if len(password) < 6:
        return False, "Password phải từ 6 ký tự"

    return True, "Hợp lệ"


# ==================== DỮ LIỆU TEST ====================
# (tc_id, precondition, email, password, expected_valid, expected_msg)
test_cases = [
    ("TC01", "Người dùng ở trang đăng nhập",
     "khanhxuan@gmail.com", "123456", True, "Hợp lệ"),
    ("TC02", "Người dùng ở trang đăng nhập",
     "", "123456", False, "Email là bắt buộc"),
    ("TC03", "Người dùng ở trang đăng nhập",
     "khanhxuan@gmail", "123456", False, "Email không hợp lệ"),
    ("TC04", "Người dùng ở trang đăng nhập",
     "khanhxuan@gmail.com", "", False, "Password là bắt buộc"),
    ("TC05", "Người dùng ở trang đăng nhập",
     "khanhxuan@gmail.com", "123", False, "Password phải từ 6 ký tự"),
    ("TC06", "Người dùng ở trang đăng nhập",
     " khanhxuan@gmail.com ", "123456", True, "Hợp lệ"),
    ("TC07", "Người dùng ở trang đăng nhập",
     "", "", False, "Email là bắt buộc"),
]


# ==================== CHẠY TEST VÀ XUẤT CSV ====================
def test_generate_report():
    results = []
    for tc_id, precondition, email, password, expected_valid, expected_msg in test_cases:
        actual_valid, actual_msg = validate_login(email, password)
        passed = (actual_valid == expected_valid) and (actual_msg == expected_msg)
        results.append({
            "Test Case": tc_id,
            "Precondition": precondition,
            "Input Email": email if email else "(rỗng)",
            "Input Password": "*" * len(password) if password else "(rỗng)",
            "Expected Valid": expected_valid,
            "Expected Message": expected_msg,
            "Actual Valid": actual_valid,
            "Actual Message": actual_msg,
            "Kết quả": "PASS" if passed else "FAIL",
        })

    # Xuất ra file CSV
    output_path = os.path.join(os.path.dirname(__file__), "report_validate_login.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

    print(f"\nBáo cáo đã xuất: {output_path}")

    # Kiểm tra tất cả đều pass
    failed = [r for r in results if r["Kết quả"] == "FAIL"]
    assert len(failed) == 0, f"{len(failed)} test case bị FAIL!"