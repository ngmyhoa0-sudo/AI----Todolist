import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { getErrorMessage } from "../utils/errorMessage";

export default function LoginPage() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Vào trang đăng nhập nghĩa là chưa (hoặc không còn) có phiên hợp lệ — xoá sạch token cũ/hỏng
    // còn sót trong localStorage để tránh các lỗi phái sinh khó hiểu (vd interceptor tự ý thử
    // refresh bằng token cũ khi đăng nhập thất bại vì lý do khác như sai mật khẩu)
    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
        setSuccessMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (mode === "register" && form.password !== form.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await authService.login({ email: form.email, password: form.password });
                navigate("/home");
            } else {
                await authService.register({ email: form.email, password: form.password });
                setSuccessMsg("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setError("");
        setLoading(true);
        try {
            await authService.guestLogin();
            navigate("/home?guest=true");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <span style={styles.logo}>✓</span>
                    <h1 style={styles.appName}>AI Todolist</h1>
                    <p style={styles.tagline}>Quản lý công việc thông minh hơn</p>
                </div>

                <div style={styles.tabRow}>
                    <button
                        style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
                        onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                    >
                        Đăng nhập
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }}
                        onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                    >
                        Đăng ký
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>Email</label>
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                    />

                    <label style={styles.label}>Mật khẩu</label>
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                    />

                    {mode === "register" && (
                        <>
                            <label style={styles.label}>Xác nhận mật khẩu</label>
                            <input
                                style={styles.input}
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </>
                    )}

                    {mode === "login" && (
                        <div style={styles.forgotRow}>
                            <button
                                type="button"
                                style={styles.forgotBtn}
                                onClick={() => navigate("/forgot-password")}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                    )}

                    {error && <p style={styles.error}>{error}</p>}
                    {successMsg && <p style={styles.success}>{successMsg}</p>}

                    <button type="submit" style={styles.submitBtn} disabled={loading}>
                        {loading
                            ? "Đang xử lý..."
                            : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                    </button>
                </form>

                <div style={styles.guestRow}>
                    <span style={styles.guestText}>Không muốn đăng ký? </span>
                    <button
                        type="button"
                        style={styles.guestBtn}
                        onClick={handleGuestLogin}
                        disabled={loading}
                    >
                        Dùng thử với tư cách khách
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E3F2FD",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "16px",
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)",
    },
    header: {
        textAlign: "center",
        marginBottom: "28px",
    },
    logo: {
        display: "inline-block",
        fontSize: "28px",
        backgroundColor: "#111",
        color: "#fff",
        borderRadius: "8px",
        width: "44px",
        height: "44px",
        lineHeight: "44px",
        marginBottom: "12px",
    },
    appName: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111",
        margin: "0 0 4px 0",
        letterSpacing: "-0.3px",
    },
    tagline: {
        fontSize: "13px",
        color: "#888",
        margin: 0,
    },
    tabRow: {
        display: "flex",
        borderBottom: "1px solid #eee",
        marginBottom: "24px",
    },
    tab: {
        flex: 1,
        background: "none",
        border: "none",
        padding: "10px 0",
        fontSize: "14px",
        color: "#999",
        cursor: "pointer",
        fontWeight: "500",
        borderBottom: "2px solid transparent",
        marginBottom: "-1px",
        transition: "color 0.15s, border-color 0.15s",
    },
    tabActive: {
        color: "#111",
        borderBottomColor: "#111",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "0px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#444",
        marginBottom: "6px",
        marginTop: "14px",
    },
    input: {
        padding: "10px 12px",
        border: "1px solid #e0e0e0",
        borderRadius: "7px",
        fontSize: "14px",
        color: "#111",
        outline: "none",
        backgroundColor: "#fafafa",
        transition: "border-color 0.15s",
    },
    forgotRow: {
        textAlign: "right",
        marginTop: "8px",
    },
    forgotBtn: {
        background: "none",
        border: "none",
        fontSize: "13px",
        color: "#888",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
    },
    error: {
        fontSize: "13px",
        color: "#d0453a",
        marginTop: "12px",
        marginBottom: "0",
        padding: "10px 12px",
        backgroundColor: "#fff5f5",
        borderRadius: "6px",
        border: "1px solid #fcc",
    },
    success: {
        fontSize: "13px",
        color: "#2d7a4f",
        marginTop: "12px",
        marginBottom: "0",
        padding: "10px 12px",
        backgroundColor: "#f0faf4",
        borderRadius: "6px",
        border: "1px solid #b2dfcc",
    },
    submitBtn: {
        marginTop: "20px",
        padding: "11px",
        backgroundColor: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "7px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        letterSpacing: "0.2px",
        transition: "background-color 0.15s",
    },
    guestRow: {
        textAlign: "center",
        marginTop: "20px",
        fontSize: "13px",
    },
    guestText: {
        color: "#aaa",
    },
    guestBtn: {
        background: "none",
        border: "none",
        fontSize: "13px",
        color: "#555",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
    },
};