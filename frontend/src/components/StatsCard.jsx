import { useState, useEffect } from "react";
import { getStats } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";

// StatsCard chỉ làm 1 việc: hiển thị số liệu tổng quan, tự gọi statsService
export default function StatsCard({ refreshTrigger }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, [refreshTrigger]);

    // Tự động gọi lại API mỗi 60 giây để số liệu (đặc biệt "Quá hạn") cập nhật theo thời gian thực,
    // không chỉ khi người dùng thêm/sửa/xoá task
    useEffect(() => {
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getStats();
            setStats(data.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p style={styles.loading}>Đang tải thống kê...</p>;
    if (error) return <p style={styles.error}>{error}</p>;
    if (!stats) return null;

    const cards = [
        { label: "Tổng task", value: stats.total ?? 0, bg: "#eef2f9" },
        { label: "Hoàn thành", value: stats.completed ?? 0, bg: "#e3f2e6" },
        { label: "Đang làm", value: stats.active ?? 0, bg: "#fdf3df" },
        { label: "Quá hạn", value: stats.overdue ?? 0, bg: "#fbe6e6" },
    ];

    return (
        <div style={styles.grid}>
            {cards.map((card) => (
                <div key={card.label} style={{ ...styles.card, backgroundColor: card.bg }}>
                    <span style={styles.value}>{card.value}</span>
                    <span style={styles.label}>{card.label}</span>
                </div>
            ))}
        </div>
    );
}

const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
        marginBottom: "20px",
    },
    card: {
        display: "flex",
        flexDirection: "column",
        padding: "20px 18px",
        borderRadius: "16px",
    },
    value: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#1a2b4c",
        marginBottom: "4px",
        letterSpacing: "-0.5px",
    },
    label: {
        fontSize: "13px",
        color: "#6b7280",
        fontWeight: "500",
    },
    loading: {
        textAlign: "center",
        color: "#999",
        fontSize: "13px",
        padding: "12px 0",
    },
    error: {
        fontSize: "13px",
        color: "#d0453a",
        padding: "10px 12px",
        backgroundColor: "#fff5f5",
        borderRadius: "6px",
        border: "1px solid #fcc",
        marginBottom: "16px",
    },
};