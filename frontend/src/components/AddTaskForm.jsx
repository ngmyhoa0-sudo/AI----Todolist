import { useState } from "react";

// AddTaskForm chỉ làm 1 việc: nhận input task mới (thường + ngôn ngữ tự nhiên) rồi gửi lên qua onAdd
export default function AddTaskForm({ onAdd, onAddNatural }) {
  const [mode, setMode] = useState("normal");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      if (mode === "normal") {
        await onAdd(text);
      } else {
        await onAddNatural(text);
      }
      setText("");
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
          style={styles.input}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
  addBtn: {
    padding: "10px 18px", backgroundColor: "#111", color: "#fff",
    border: "none", borderRadius: "7px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
  },
};