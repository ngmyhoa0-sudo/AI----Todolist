// TodoItem chỉ làm 1 việc: hiển thị 1 task đơn lẻ
export default function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li style={styles.item}>
      <input
        type="checkbox"
        checked={todo.is_completed}
        onChange={() => onToggle(todo.id, todo.is_completed)}
        style={styles.checkbox}
      />
      <span style={{
        ...styles.title,
        ...(todo.is_completed ? styles.titleDone : {}),
      }}>
        {todo.title}
      </span>
      {todo.deadline && (
        <span style={styles.deadline}>
          {new Date(todo.deadline).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Bạn có chắc chắn muốn xoá task này không?")) {
            onDelete(todo.id);
          }
        }}
        style={styles.deleteBtn}
        aria-label="Xóa task"
      >
        Xóa
      </button>
    </li>
  );
}

const styles = {
  item: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 14px", backgroundColor: "#fff",
    border: "1px solid #eee", borderRadius: "8px", marginBottom: "8px",
  },
  checkbox: { width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 },
  title: { flex: 1, fontSize: "14px", color: "#111" },
  titleDone: { color: "#aaa", textDecoration: "line-through" },
  deadline: { fontSize: "12px", color: "#999", whiteSpace: "nowrap" },
  deleteBtn: {
    background: "none", border: "none", color: "#d0453a",
    fontSize: "13px", cursor: "pointer", padding: "4px 8px",
  },
};