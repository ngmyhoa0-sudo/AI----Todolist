import { getChatHistory } from "../services/chatHistoryService";
import { useState, useRef, useEffect } from "react";
import { askAI } from "../services/aiService";

// ChatBox chỉ làm 1 việc: giao diện chatbot AI, tự gọi aiService
export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    const bottomRef = useRef(null);

    // Nạp lại lịch sử chat đã lưu mỗi khi component được mount (ví dụ sau khi F5)
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await getChatHistory();
                setMessages(res.data.map((m) => ({ role: m.role, content: m.content })));
            } catch (err) {
                // Không tải được lịch sử thì bỏ qua, giữ khung chat trống như bình thường
            }
        };
        loadHistory();
    }, []);

  // Auto scroll xuống tin nhắn mới nhất mỗi khi có tin nhắn mới hoặc đang chờ AI trả lời
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || loading) return;

    setMessages((prev) => [...prev, { role: "user", content }]);
    setText("");
    setError("");
    setLoading(true);

    try {
      const res = await askAI(content);
      const reply = res.data.reply;
      setMessages((prev) => [...prev, { role: "ai", content: reply }]);
    } catch (err) {
      setError(err.message || "Không nhận được phản hồi từ AI. Thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>Trợ lý AI</div>

      <div style={styles.messages}>
        {messages.length === 0 && !loading && (
          <p style={styles.empty}>Hỏi AI về task của bạn...</p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.bubbleRow,
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <span
              style={{
                ...styles.bubble,
                ...(msg.role === "user" ? styles.bubbleUser : styles.bubbleAi),
              }}
            >
              {msg.content}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubbleRow, justifyContent: "flex-start" }}>
            <span style={{ ...styles.bubble, ...styles.bubbleAi }}>
              Đang trả lời...
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          disabled={loading}
        />
        <button
          type="button"
          style={styles.sendBtn}
          onClick={handleSend}
          disabled={loading || !text.trim()}
        >
          {loading ? "..." : "Gửi"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  header: {
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#111",
    borderBottom: "1px solid #eee",
  },
  messages: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "14px",
    maxHeight: "320px",
    overflowY: "auto",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    fontSize: "13px",
    padding: "20px 0",
  },
  bubbleRow: {
    display: "flex",
  },
  bubble: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  bubbleUser: {
    backgroundColor: "#111",
    color: "#fff",
    borderBottomRightRadius: "2px",
  },
  bubbleAi: {
    backgroundColor: "#f0f0f0",
    color: "#111",
    borderBottomLeftRadius: "2px",
  },
  error: {
    fontSize: "13px",
    color: "#d0453a",
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    borderTop: "1px solid #fcc",
  },
  inputRow: {
    display: "flex",
    gap: "8px",
    padding: "12px 14px",
    borderTop: "1px solid #eee",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "7px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#fafafa",
  },
  sendBtn: {
    padding: "10px 18px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
