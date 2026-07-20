import { useState } from "react";
import ChatBox from "./ChatBox";
import useTransparentIcon from "../hooks/useTransparentIcon";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

// ChatPanel chỉ làm 1 việc: hiện icon nổi, bấm vào mở panel chat trượt từ bên phải
export default function ChatPanel() {
    const [open, setOpen] = useState(false);
    const transparentIcon = useTransparentIcon("/chat-icon.png");
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = THEMES[theme];

    const styles = {
        fab: {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: theme === "dark" ? "#2e7bc4" : "#6EC3F4",
            color: "#fff",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            backgroundColor: colors.cardBg,
            boxShadow: "-4px 0 20px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            padding: "16px",
            overflowY: "auto",
            boxSizing: "border-box",
        },
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                style={styles.fab}
                aria-label={t("aiAssistant")}
            >
                {open ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                ) : (
                    <img src={transparentIcon || "/chat-icon.png"} alt="" style={{ width: "56px", height: "56px" }} />
                )}
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