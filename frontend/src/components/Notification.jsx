// Notification chỉ làm 1 việc: hiển thị thông báo deadline, không tự gọi API
// Nhận vào danh sách todos đã có, tự tính task nào sắp đến hạn / đã quá hạn
const HOURS_BEFORE_DEADLINE_WARNING = 24;

function getDeadlineStatus(deadline) {
  const now = new Date();
  const due = new Date(deadline);
  const diffHours = (due - now) / (1000 * 60 * 60);
  if (diffHours < 0) return "overdue";
  if (diffHours <= HOURS_BEFORE_DEADLINE_WARNING) return "soon";
  return "normal";
}

export default function Notification({ todos }) {
  const alerts = todos
    .filter((t) => !t.is_completed && t.deadline)
    .map((t) => ({ ...t, status: getDeadlineStatus(t.deadline) }))
    .filter((t) => t.status !== "normal")
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  if (alerts.length === 0) return null;

  return (
    <div style={styles.wrapper}>
      {alerts.map((todo) => (
        <div
          key={todo.id}
          style={{
            ...styles.item,
            ...(todo.status === "overdue" ? styles.itemOverdue : styles.itemSoon),
          }}
        >
          <span style={styles.icon}>{todo.status === "overdue" ? "⚠️" : "⏰"}</span>
          <span style={styles.text}>
            {todo.status === "overdue" ? "Đã quá hạn: " : "Sắp đến hạn: "}
            <strong>{todo.title}</strong>
            {" — "}
            {new Date(todo.deadline).toLocaleString("vi-VN", {
              day: "2-digit", month: "2-digit",
              hour: "2-digit", minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" },
  item: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "7px", fontSize: "13px" },
  itemOverdue: { backgroundColor: "#fff5f5", border: "1px solid #fcc", color: "#d0453a" },
  itemSoon: { backgroundColor: "#fffaf0", border: "1px solid #fcd9a0", color: "#a36b00" },
  icon: { fontSize: "14px", flexShrink: 0 },
  text: { flex: 1 },
};