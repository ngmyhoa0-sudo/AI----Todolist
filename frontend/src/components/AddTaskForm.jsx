import { useState } from "react";

// Tên task hợp lệ khi chứa ít nhất 1 ký tự chữ/số (chặn chuỗi chỉ toàn ký tự đặc biệt như `" "`, `---`, `...`)
const HAS_ALPHANUMERIC = /[\p{L}\p{N}]/u;

// AddTaskForm chỉ làm 1 việc: nhận input task mới (thường + ngôn ngữ tự nhiên) rồi gửi lên qua onAdd
export default function AddTaskForm({ onAdd, onAddNatural }) {
  const [mode, setMode] = useState("normal");
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText || !HAS_ALPHANUMERIC.test(trimmedText)) {
      setError("Vui lòng nhập tên task");
      return;
    }
    setError("");
    setLoading(true);
    try {
      if (mode === "normal") {
        if (deadline) {
          await onAdd(trimmedText, deadline);
        } else {
          await onAdd(trimmedText);
        }
      } else {
        await onAddNatural(trimmedText);
      }
      setText("");
      setDeadline("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.tabRow}>
        <button
          type="button"
          style={{ ...styles.tab, ...(mode === "normal" ? styles.tabActive : {}) }}
          onClick={() => setMode("normal")}
        >
          Thường
        </button>
        <button
          type="button"
          style={{ ...styles.tab, ...(mode === "natural" ? styles.tabActive : {}) }}
          onClick={() => setMode("natural")}
        >
          Ngôn ngữ tự nhiên
        </button>
      </div>
      <div style={styles.inputRow}>
        <input
          style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError("");
          }}
          placeholder={
            mode === "normal"
              ? "Nhập tên task..."
              : "Ví dụ: Họp nhóm lúc 3 giờ chiều mai"
          }
        />
        <button type="submit" style={styles.addBtn} disabled={loading}>
          {loading ? "Đang thêm..." : "Thêm"}
        </button>
      </div>
      {error && <p style={styles.errorText}>{error}</p>}
      {mode === "normal" && (
        <div style={styles.deadlineRow}>
          <label style={styles.deadlineLabel}>Deadline (không bắt buộc)</label>
          <input
            style={styles.deadlineInput}
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
      )}
    </form>
  );
}

const styles = {
  form: { marginBottom: "20px" },
  tabRow: { display: "flex", gap: "4px", marginBottom: "10px" },
  tab: {
    padding: "6px 12px", fontSize: "13px", border: "none",
    borderRadius: "6px", backgroundColor: "#f0f0f0", color: "#888", cursor: "pointer",
  },
  tabActive: { backgroundColor: "#111", color: "#fff" },
  inputRow: { display: "flex", gap: "8px" },
  input: {
    flex: 1, padding: "10px 12px", border: "1px solid #e0e0e0",
    borderRadius: "7px", fontSize: "14px", outline: "none", backgroundColor: "#fafafa",
  },
  inputError: { borderColor: "#d0453a" },
  errorText: { fontSize: "12px", color: "#d0453a", margin: "6px 0 0" },
  addBtn: {
    padding: "10px 18px", backgroundColor: "#111", color: "#fff",
    border: "none", borderRadius: "7px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },
  deadlineRow: { display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px" },
  deadlineLabel: { fontSize: "12px", color: "#888" },
  deadlineInput: {
    padding: "8px 12px", border: "1px solid #e0e0e0",
    borderRadius: "7px", fontSize: "13px", color: "#111",
    outline: "none", backgroundColor: "#fafafa", alignSelf: "flex-start",
  },
};