import { useState } from "react";
import ChatBox from "./ChatBox";

// ChatPanel chỉ làm 1 việc: hiện icon nổi, bấm vào mở panel chat trượt từ bên phải
export default function ChatPanel() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={styles.fab}
                aria-label="Trợ lý AI"
            >
                {open ? "✕" : "💬"}
            </button>

            {open && (
                <div style={styles.overlay} onClick={() => setOpen(false)}>
                    <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
                        <ChatBox />
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    fab: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "#4A9EFF",
        color: "#fff",
        border: "none",
        fontSize: "22px",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
        zIndex: 30,
    },
    overlay: {
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.15)",
        zIndex: 20,
        display: "flex",
        justifyContent: "flex-end",
    },
    panel: {
        width: "380px",
        maxWidth: "100vw",
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        overflowY: "auto",
        boxSizing: "border-box",
    },
};