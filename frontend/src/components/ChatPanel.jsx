import { useState, useRef, useEffect } from "react";
import ChatBox from "./ChatBox";
import useTransparentIcon from "../hooks/useTransparentIcon";
import useIsDesktop from "../hooks/useIsDesktop";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

const DEFAULT_CHAT_WIDTH = 380;
const MIN_CHAT_WIDTH = 300;
const MIN_MAIN_WIDTH = 360;

// Mobile: giữ nguyên fab + overlay trượt từ phải như cũ.
// Desktop: khi mở, chia màn hình thành 2 cột (nội dung trái lớn hơn, chat phải),
// có thanh chia kéo được để đổi diện tích.
export default function ChatPanel({ children }) {
    const [open, setOpen] = useState(false);
    const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
    const isDraggingRef = useRef(false);
    const containerRef = useRef(null);

    const isDesktop = useIsDesktop();
    const transparentIcon = useTransparentIcon("/chat-icon.png");
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = THEMES[theme];

    const handleDividerMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const maxChatWidth = rect.width - MIN_MAIN_WIDTH;
            let newWidth = rect.right - e.clientX;
            newWidth = Math.max(MIN_CHAT_WIDTH, Math.min(newWidth, maxChatWidth));
            setChatWidth(newWidth);
        };
        const handleMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

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
        mobilePanel: {
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
        splitContainer: {
            display: "flex",
            alignItems: "stretch",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
        },
        mainPane: {
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflowY: "auto",
        },
        divider: {
            width: "5px",
            flexShrink: 0,
            cursor: "col-resize",
            backgroundColor: "transparent",
        },
        chatPane: {
            flexShrink: 0,
            boxSizing: "border-box",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        },
    };

    return (
        <>
            <div ref={containerRef} style={styles.splitContainer}>
                <div style={styles.mainPane} className="app-scroll-thin">{children}</div>

                {isDesktop && open && (
                    <>
                        <div style={styles.divider} onMouseDown={handleDividerMouseDown} />
                        <div style={{ ...styles.chatPane, width: chatWidth }}>
                            <ChatBox fillHeight />
                        </div>
                    </>
                )}
            </div>

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

            {!isDesktop && open && (
                <div style={styles.overlay} onClick={() => setOpen(false)}>
                    <div style={styles.mobilePanel} onClick={(e) => e.stopPropagation()}>
                        <ChatBox />
                    </div>
                </div>
            )}
        </>
    );
}