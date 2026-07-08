import { Component } from "react";

// ErrorBoundary chỉ làm 1 việc: bắt lỗi render, tránh sập trắng toàn bộ SPA
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary bắt được lỗi:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <p style={styles.text}>Đã có lỗi xảy ra. Vui lòng tải lại trang.</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  text: { color: "#d0453a", fontSize: "15px" },
  btn: {
    padding: "10px 18px",
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
  },
};
