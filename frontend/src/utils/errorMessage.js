// True khi lỗi là do phiên đăng nhập hết hạn (401 sau khi interceptor ở api.js đã thử refresh
// token mà vẫn thất bại, hoặc không còn refresh token để thử) — dùng để phân biệt với các lỗi
// tạm thời khác (network, 500 do nguyên nhân khác...) mà vẫn nên giữ nguyên dữ liệu đang hiển thị
export function isSessionExpiredError(err) {
  return err.response?.status === 401 || err.message === "Không có refresh token";
}

// Trả về thông báo lỗi dạng chuỗi an toàn để render ra UI.
// FastAPI trả `detail` là mảng object khi lỗi validate (422),
// và là chuỗi khi lỗi nghiệp vụ thường (401, 400)
export function getErrorMessage(err) {
  if (isSessionExpiredError(err)) {
    return "Phiên đăng nhập đã hết hạn, vui lòng tải lại trang hoặc đăng nhập lại.";
  }

  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return err.message || "Đã có lỗi xảy ra.";
}
