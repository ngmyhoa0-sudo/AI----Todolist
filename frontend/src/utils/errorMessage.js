// Endpoint xác thực công khai — 401 từ đây (vd sai email/mật khẩu, sai OTP) là lỗi nghiệp vụ
// bình thường, KHÔNG phải "phiên hết hạn" (làm gì có phiên nào mà hết hạn khi còn chưa đăng nhập)
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/guest",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// True khi lỗi là do phiên đăng nhập hết hạn (401 từ 1 API cần xác thực, sau khi interceptor
// ở api.js đã thử refresh token mà vẫn thất bại, hoặc không còn refresh token để thử) — dùng để
// phân biệt với các lỗi tạm thời khác (network, 500 do nguyên nhân khác, sai mật khẩu lúc đăng
// nhập...) mà vẫn nên giữ nguyên dữ liệu đang hiển thị
export function isSessionExpiredError(err) {
  const url = err.config?.url || "";
  if (PUBLIC_AUTH_PATHS.some((path) => url.includes(path))) return false;
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
