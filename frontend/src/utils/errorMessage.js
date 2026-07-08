// Trả về thông báo lỗi dạng chuỗi an toàn để render ra UI.
// FastAPI trả `detail` là mảng object khi lỗi validate (422),
// và là chuỗi khi lỗi nghiệp vụ thường (401, 400)
export function getErrorMessage(err) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  return err.message || "Đã có lỗi xảy ra.";
}
