# test_validate.py
import csv
import os

# ==================== HÀM LOGIC CẦN TEST ====================

def validate_task(title, priority, deadline):
    if not title or not title.strip():
        return False, "Tiêu đề không được để trống"
    if len(title.strip()) > 100:
        return False, "Tiêu đề không được vượt quá 100 ký tự"
    valid_priorities = ["low", "medium", "high"]
    if priority not in valid_priorities:
        return False, "Mức độ ưu tiên không hợp lệ"
    if deadline is not None and not isinstance(deadline, str):
        return False, "Deadline không hợp lệ"
    if deadline is not None and deadline.strip() == "":
        return False, "Deadline không được để trống nếu có nhập"
    return True, "Hợp lệ"


# ==================== DỮ LIỆU TEST ====================
# (tc_id, precondition, title, priority, deadline, expected_valid, expected_msg)

test_cases = [
    ("TC01", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "Học bài môn kiểm thử", "high", "2026-06-30", True, "Hợp lệ"),

    ("TC02", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "", "medium", "2026-06-30", False, "Tiêu đề không được để trống"),

    ("TC03", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "     ", "medium", "2026-06-30", False, "Tiêu đề không được để trống"),

    ("TC04", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "A" * 101, "low", "2026-06-30", False, "Tiêu đề không được vượt quá 100 ký tự"),

    ("TC05", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "Làm bài tập", "urgent", "2026-06-30", False, "Mức độ ưu tiên không hợp lệ"),

    ("TC06", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "Đọc sách", "low", None, True, "Hợp lệ"),

    ("TC07", "Người dùng đã đăng nhập, đang ở trang tạo task mới",
     "Ôn thi", "high", "", False, "Deadline không được để trống nếu có nhập"),
]


# ==================== CHẠY TEST VÀ XUẤT CSV ====================

def test_generate_report():
    results = []

    for tc_id, precondition, title, priority, deadline, expected_valid, expected_msg in test_cases:
        actual_valid, actual_msg = validate_task(title, priority, deadline)
        passed = (actual_valid == expected_valid) and (actual_msg == expected_msg)

        results.append({
            "Test Case": tc_id,
            "Precondition": precondition,
            "Input Title": title[:30] if title else "(rỗng)",
            "Input Priority": priority,
            "Input Deadline": deadline if deadline is not None else "None",
            "Expected Valid": expected_valid,
            "Expected Message": expected_msg,
            "Actual Valid": actual_valid,
            "Actual Message": actual_msg,
            "Kết quả": "PASS" if passed else "FAIL",
        })

    # Xuất ra file CSV
    output_path = os.path.join(os.path.dirname(__file__), "report_validate.csv")
    with open(output_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=results[0].keys())
        writer.writeheader()
        writer.writerows(results)

    print(f"\nBáo cáo đã xuất: {output_path}")

    # Kiểm tra tất cả đều pass
    failed = [r for r in results if r["Kết quả"] == "FAIL"]
    assert len(failed) == 0, f"{len(failed)} test case bị FAIL!"