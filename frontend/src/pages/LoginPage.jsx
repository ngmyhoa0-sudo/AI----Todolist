import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { getErrorMessage } from "../utils/errorMessage";
import { useLanguage } from "../context/LanguageContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { t } = useLanguage();
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
            setError(t("passwordMismatch"));
            return;
        }

        setLoading(true);
        try {
            if (mode === "login") {
                await authService.login({ email: form.email, password: form.password });
                navigate("/home");
            } else {
                await authService.register({ email: form.email, password: form.password });
                setSuccessMsg(t("registerSuccess"));
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
            <svg
                style={styles.waveSvg}
                viewBox="0 0 1200 800"
                preserveAspectRatio="xMidYMid slice"
            >
                <defs>
                    <filter id="waveBlur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="45" />
                    </filter>
                    <path
                        id="gentle-wave"
                        d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v300h-352z"
                    />
                </defs>
                <g transform="translate(0, 500) scale(3.2)">
                    <use href="#gentle-wave" x="0" y="0" fill="#ffffff" fillOpacity="0.35" filter="url(#waveBlur)" />
                    <use href="#gentle-wave" x="88" y="10" fill="#ffffff" fillOpacity="0.25" filter="url(#waveBlur)" />
                </g>
            </svg>
            <div style={styles.card}>
                <div style={styles.header}>
                    <span style={styles.logo}>✓</span>
                    <h1 style={styles.appName}>AI Todolist</h1>
                    <p style={styles.tagline}>{t("loginTagline")}</p>
                </div>

                <div style={styles.tabRow}>
                    <button
                        style={{ ...styles.tab, ...(mode === "login" ? styles.tabActive : {}) }}
                        onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); }}
                    >
                        {t("loginTab")}
                    </button>
                    <button
                        style={{ ...styles.tab, ...(mode === "register" ? styles.tabActive : {}) }}
                        onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); }}
                    >
                        {t("registerTab")}
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>{t("emailLabel")}</label>
                    <div style={styles.inputWrap}>
                        <span style={styles.inputIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 6-10 7L2 6" />
                            </svg>
                        </span>
                        <input
                            className="login-input"
                            style={styles.input}
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <label style={styles.label}>{t("passwordLabel")}</label>
                    <div style={styles.inputWrap}>
                        <span style={styles.inputIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </span>
                        <input
                            className="login-input"
                            style={styles.input}
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    {mode === "register" && (
                        <>
                            <label style={styles.label}>{t("confirmPasswordLabel")}</label>
                            <div style={styles.inputWrap}>
                                <span style={styles.inputIcon}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    className="login-input"
                                    style={styles.input}
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        </>
                    )}

                    {mode === "login" && (
                        <div style={styles.forgotRow}>
                            <button
                                type="button"
                                style={styles.forgotBtn}
                                onClick={() => navigate("/forgot-password")}
                            >
                                {t("forgotPasswordLink")}
                            </button>
                        </div>
                    )}

                    {error && <p style={styles.error}>{error}</p>}
                    {successMsg && <p style={styles.success}>{successMsg}</p>}

                    <button type="submit" className="login-submit-btn" style={styles.submitBtn} disabled={loading}>
                        {loading
                            ? t("processing")
                            : mode === "login" ? t("loginSubmitBtn") : t("createAccountBtn")}
                    </button>
                </form>

                <div style={styles.guestRow}>
                    <span style={styles.guestText}>{t("noAccountPrompt")}</span>
                    <button
                        type="button"
                        style={styles.guestBtn}
                        onClick={handleGuestLogin}
                        disabled={loading}
                    >
                        {t("guestLoginBtn")}
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
        position: "relative",
        overflow: "hidden",
        backgroundImage: "linear-gradient(135deg, #dff7ff -50%, #bfe7ff 1%, #b8ddf7 -50%, #abd7ff 100%, #d7f0ff 200%)",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "16px",
    },
    waveSvg: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
    },
    card: {
        position: "relative",
        zIndex: 10,
        backgroundColor: "transparent",
        borderRadius: "12px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "none",
    },
    header: {
        textAlign: "center",
        marginBottom: "28px",
    },
    logo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px",
        fontSize: "32px",
        backgroundColor: "rgba(255,255,255,0.12)",
        color: "#fff",
        border: "2px solid rgba(255,255,255,0.55)",
        borderRadius: "50%",
        width: "84px",
        height: "84px",
    },
    appName: {
        fontSize: "22px",
        fontWeight: "700",
        color: "#3A6EA5",
        margin: "0 0 4px 0",
        letterSpacing: "-0.3px",
        textShadow: "0 1px 4px rgba(0,0,0,0.15)",
    },
    tagline: {
        fontSize: "13px",
        color: "rgba(255,255,255,0.85)",
        margin: 0,
    },
    tabRow: {
        display: "flex",
        borderBottom: "1px solid rgba(255,255,255,0.3)",
        marginBottom: "24px",
    },
    tab: {
        flex: 1,
        background: "none",
        border: "none",
        padding: "10px 0",
        fontSize: "14px",
        color: "#2E7BC4",
        cursor: "pointer",
        fontWeight: "500",
        borderBottom: "2px solid transparent",
        marginBottom: "-1px",
        transition: "color 0.15s, border-color 0.15s",
    },
    tabActive: {
        color: "#2E7BC4",
        borderBottomColor: "#fff",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "0px",
    },
    label: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#4A85C0",
        marginBottom: "6px",
        marginTop: "14px",
    },
    inputWrap: {
        position: "relative",
        display: "flex",
        alignItems: "center",
    },
    inputIcon: {
        position: "absolute",
        left: "14px",
        display: "flex",
        color: "rgba(255,255,255,0.75)",
        pointerEvents: "none",
    },
    input: {
        width: "100%",
        padding: "12px 16px 12px 40px",
        border: "1.5px solid rgba(255,255,255,0.5)",
        borderRadius: "999px",
        fontSize: "14px",
        color: "#fff",
        outline: "none",
        backgroundColor: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        transition: "border-color 0.15s, background-color 0.15s",
    },
    forgotRow: {
        textAlign: "right",
        marginTop: "8px",
    },
    forgotBtn: {
        background: "none",
        border: "none",
        fontSize: "13px",
        color: "#4A85C0",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
    },
    error: {
        fontSize: "13px",
        color: "#b3261e",
        marginTop: "12px",
        marginBottom: "0",
        padding: "10px 12px",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.6)",
    },
    success: {
        fontSize: "13px",
        color: "#1e6b3e",
        marginTop: "12px",
        marginBottom: "0",
        padding: "10px 12px",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderRadius: "6px",
        border: "1px solid rgba(255,255,255,0.6)",
    },
    submitBtn: {
        marginTop: "20px",
        padding: "13px",
        backgroundColor: "#fff",
        color: "#2E7BC4",
        border: "none",
        borderRadius: "999px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        letterSpacing: "0.3px",
        transition: "background-color 0.15s, transform 0.15s",
    },
    guestRow: {
        textAlign: "center",
        marginTop: "20px",
        fontSize: "13px",
    },
    guestText: {
        color: "rgba(255,255,255,0.75)",
    },
    guestBtn: {
        background: "none",
        border: "none",
        fontSize: "13px",
        color: "#fff",
        cursor: "pointer",
        padding: 0,
        textDecoration: "underline",
    },
};