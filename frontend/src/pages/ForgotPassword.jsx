import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

// ForgotPassword chỉ làm 1 việc: hiển thị form reset mật khẩu 2 bước
export default function ForgotPassword() {
  const navigate = useNavigate();

  // "email" — bước 1: nhập email
  // "otp"   — bước 2: nhập mã OTP + mật khẩu mới
  const [step, setStep] = useState("email");

  // Dữ liệu form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trạng thái UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── Bước 1: Gửi email reset ──────────────────────────────────────────────
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccessMsg("Mã OTP đã được gửi đến email của bạn.");
      setStep("otp");
    } catch (err) {
      setError(err.message || "Không thể gửi email. Thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 2: Xác nhận OTP + đặt mật khẩu mới ────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email, otp, newPassword });
      setSuccessMsg("Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Mã OTP không đúng hoặc đã hết hạn. Thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>✓</span>
          <h1 style={styles.appName}>AI Todolist</h1>
          <p style={styles.tagline}>
            {step === "email" ? "Nhập email để nhận mã OTP" : "Nhập mã OTP và mật khẩu mới"}
          </p>
        </div>

        {/* Thanh tiến trình 2 bước */}
        <div style={styles.stepRow}>
          <div style={styles.stepItem}>
            <div style={{ ...styles.stepCircle, ...styles.stepCircleActive }}>1</div>
            <span style={{ ...styles.stepLabel, ...styles.stepLabelActive }}>Nhập email</span>
          </div>
          <div style={styles.stepLine} />
          <div style={styles.stepItem}>
            <div style={{
              ...styles.stepCircle,
              ...(step === "otp" ? styles.stepCircleActive : styles.stepCircleInactive)
            }}>2</div>
            <span style={{
              ...styles.stepLabel,
              ...(step === "otp" ? styles.stepLabelActive : styles.stepLabelInactive)
            }}>Đặt lại mật khẩu</span>
          </div>
        </div>

        {/* ── Form bước 1: Nhập email ── */}
        {step === "email" && (
          <form onSubmit={handleSendEmail} style={styles.form}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              required
              autoComplete="email"
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
          </form>
        )}

        {/* ── Form bước 2: Nhập OTP + mật khẩu mới ── */}
        {step === "otp" && (
          <form onSubmit={handleResetPassword} style={styles.form}>

            {successMsg && <p style={styles.success}>{successMsg}</p>}

            <label style={styles.label}>Mã OTP</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Nhập mã OTP từ email"
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(""); }}
              required
              autoComplete="one-time-code"
            />

            <label style={styles.label}>Mật khẩu mới</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              required
              autoComplete="new-password"
            />

            <label style={styles.label}>Xác nhận mật khẩu mới</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
              required
              autoComplete="new-password"
            />

            {error && <p style={styles.error}>{error}</p>}

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </button>

            {/* Gửi lại OTP */}
            <div style={styles.resendRow}>
              <span style={styles.resendText}>Không nhận được mã? </span>
              <button
                type="button"
                style={styles.resendBtn}
                onClick={() => { setStep("email"); setError(""); setSuccessMsg(""); }}
              >
                Gửi lại
              </button>
            </div>
          </form>
        )}

        {/* Quay lại đăng nhập */}
        <div style={styles.backRow}>
          <button
            type="button"
            style={styles.backBtn}
            onClick={() => navigate("/")}
          >
            ← Quay lại đăng nhập
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
    backgroundColor: "#f7f7f5",
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
  stepRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "28px",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    flex: 1,
  },
  stepCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    fontSize: "13px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleActive: {
    backgroundColor: "#111",
    color: "#fff",
  },
  stepCircleInactive: {
    backgroundColor: "#eee",
    color: "#aaa",
  },
  stepLabel: {
    fontSize: "12px",
  },
  stepLabelActive: {
    color: "#111",
    fontWeight: "600",
  },
  stepLabelInactive: {
    color: "#aaa",
  },
  stepLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#eee",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
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
  resendRow: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "13px",
  },
  resendText: {
    color: "#aaa",
  },
  resendBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#555",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
  },
  backRow: {
    textAlign: "center",
    marginTop: "20px",
  },
  backBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "#888",
    cursor: "pointer",
    padding: 0,
  },
};