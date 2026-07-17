import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { useLanguage } from "../context/LanguageContext";

export default function AccountPage() {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    const toggleLanguage = () => {
        setLanguage(language === "vi" ? "en" : "vi");
    };

    return (
        <div>
            <h1 style={styles.title}>{t("accountTitle")}</h1>

            <p style={styles.sectionLabel}>Tuỳ chỉnh</p>
            <div style={styles.list}>
                <button type="button" style={styles.row} onClick={toggleLanguage}>
                    <span style={styles.iconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                    </span>
                    <span style={styles.rowText}>
                        <span style={styles.rowLabel}>{t("languageLabel")}</span>
                    </span>
                    <span style={styles.rowValue}>
                        {language === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                    <span style={styles.chevron}>›</span>
                </button>

                <button type="button" style={{ ...styles.row, ...styles.rowLast }} onClick={handleLogout}>
                    <span style={styles.iconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </span>
                    <span style={styles.rowText}>
                        <span style={styles.rowLabel}>{t("logout")}</span>
                    </span>
                    <span style={styles.chevron}>›</span>
                </button>
            </div>
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px", fontWeight: "700", color: "#111",
        margin: "0 0 20px 0", letterSpacing: "-0.3px",
    },
    sectionLabel: {
        fontSize: "12px", fontWeight: "600", color: "#999",
        textTransform: "uppercase", letterSpacing: "0.5px",
        margin: "0 0 8px 4px",
    },
    list: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        border: "1px solid #eee",
        overflow: "hidden",
    },
    row: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "14px 16px",
        background: "none",
        border: "none",
        borderBottom: "1px solid #f2f2f2",
        cursor: "pointer",
        textAlign: "left",
        gap: "12px",
    },
    rowLast: {
        borderBottom: "none",
    },
    iconBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        backgroundColor: "#E3F2FD",
        color: "#2E7BC4",
        flexShrink: 0,
    },
    rowText: {
        flex: 1,
    },
    rowLabel: {
        fontSize: "14px",
        fontWeight: "500",
        color: "#111",
    },
    rowValue: {
        fontSize: "13px",
        color: "#999",
    },
    chevron: {
        fontSize: "18px",
        color: "#ccc",
    },
};