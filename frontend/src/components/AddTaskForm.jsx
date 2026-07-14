import { useState } from "react";

// Tên task hợp lệ khi chứa ít nhất 1 ký tự chữ/số
const HAS_ALPHANUMERIC = /[\p{L}\p{N}]/u;

function getQuickDate(preset) {
    const d = new Date();
    if (preset === "tomorrow") d.setDate(d.getDate() + 1);
    if (preset === "weekend") {
        const day = d.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
    }
    if (preset === "nextweek") d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const QUICK_OPTIONS = [
    { key: "today", label: "Hôm nay" },
    { key: "tomorrow", label: "Ngày mai" },
    { key: "weekend", label: "Cuối tuần này" },
    { key: "nextweek", label: "Tuần sau" },
];

// AddTaskForm chỉ làm 1 việc: nhận input task mới (3 chế độ: thường / ngày giờ / AI) rồi gửi qua onAdd
export default function AddTaskForm({ onAdd, onAddNatural }) {
    const [mode, setMode] = useState("normal"); // "normal" | "datetime" | "ai"
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
            if (mode === "ai") {
                await onAddNatural(trimmedText);
            } else if (mode === "datetime" && deadline) {
                await onAdd(trimmedText, deadline);
            } else {
                await onAdd(trimmedText);
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
                    style={{ ...styles.tab, ...(mode === "datetime" ? styles.tabActive : {}) }}
                    onClick={() => setMode("datetime")}
                >
                    Ngày giờ
                </button>
                <button
                    type="button"
                    style={{ ...styles.tab, ...(mode === "ai" ? styles.tabActive : {}) }}
                    onClick={() => setMode("ai")}
                >
                    AI
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
                    placeholder={mode === "ai" ? "Ví dụ: Họp nhóm lúc 3 giờ chiều mai" : "Nhập tên task..."}
                />
                <button type="submit" style={styles.addBtn} disabled={loading}>
                    {loading ? "Đang thêm..." : "Thêm"}
                </button>
            </div>
            {error && <p style={styles.errorText}>{error}</p>}

            {mode === "datetime" && (
                <div style={styles.deadlineRow}>
                    <div style={styles.quickRow}>
                        {QUICK_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                style={styles.quickBtn}
                                onClick={() => setDeadline(getQuickDate(opt.key))}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <label style={styles.deadlineLabel}>Ngày &amp; giờ cụ thể</label>
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
    deadlineRow: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" },
    quickRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
    quickBtn: {
        padding: "6px 12px", fontSize: "12px", border: "1px solid #e0e0e0",
        borderRadius: "16px", backgroundColor: "#fafafa", color: "#444", cursor: "pointer",
    },
    deadlineLabel: { fontSize: "12px", color: "#888", marginTop: "4px" },
    deadlineInput: {
        padding: "8px 12px", border: "1px solid #e0e0e0",
        borderRadius: "7px", fontSize: "13px", color: "#111",
        outline: "none", backgroundColor: "#fafafa", alignSelf: "flex-start",
    },
};