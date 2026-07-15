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

    return (
        <div>
            <h1 style={styles.title}>{t("accountTitle")}</h1>

            <div style={styles.card}>
                <label style={styles.label}>{t("languageLabel")}</label>
                <select
                    style={styles.select}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                </select>
            </div>

            <div style={styles.card}>
                <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
                    {t("logout")}
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
    card: {
        backgroundColor: "#fff", border: "1px solid #eee", borderRadius: "10px",
        padding: "16px", marginBottom: "16px",
    },
    label: { fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" },
    select: {
        padding: "8px 12px", border: "1px solid #e0e0e0", borderRadius: "7px",
        fontSize: "14px", color: "#111", backgroundColor: "#fafafa", outline: "none",
    },
    logoutBtn: {
        background: "none", border: "1px solid #ddd", borderRadius: "7px",
        padding: "8px 14px", fontSize: "13px", color: "#555", cursor: "pointer",
    },
};