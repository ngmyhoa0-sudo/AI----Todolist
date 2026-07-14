import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";

export default function AccountPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    return (
        <div>
            <h1 style={styles.title}>Tài khoản</h1>
            <div style={styles.card}>
                <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
                    Đăng xuất
                </button>
            </div>
            <p style={styles.placeholder}>Tuỳ chọn ngôn ngữ sẽ được thêm sau.</p>
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#111",
        margin: "0 0 20px 0",
        letterSpacing: "-0.3px",
    },
    card: {
        backgroundColor: "#fff",
        border: "1px solid #eee",
        borderRadius: "10px",
        padding: "16px",
    },
    logoutBtn: {
        background: "none",
        border: "1px solid #ddd",
        borderRadius: "7px",
        padding: "8px 14px",
        fontSize: "13px",
        color: "#555",
        cursor: "pointer",
    },
    placeholder: {
        textAlign: "center",
        color: "#999",
        fontSize: "14px",
        padding: "20px 0",
    },
};