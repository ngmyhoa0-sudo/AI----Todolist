import { useState, useEffect } from "react";
import { getStats } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";

// StatsCard chỉ làm 1 việc: hiển thị số liệu tổng quan, tự gọi statsService
export default function StatsCard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStats();
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
    { label: "Tổng task",  value: stats.total     ?? 0, color: "#111"    },
    { label: "Hoàn thành", value: stats.completed ?? 0, color: "#2d7a4f" },
    { label: "Đang làm",   value: stats.active    ?? 0, color: "#a36b00" },
    { label: "Quá hạn", value: stats.overdue ?? 0, color: "#d0453a" },
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} style={styles.card}>
          <span style={{ ...styles.value, color: card.color }}>{card.value}</span>
          <span style={styles.label}>{card.label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "16px 8px",
    backgroundColor: "#fff",
    border: "1px solid #eee",
    borderRadius: "10px",
  },
  value: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "4px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    textAlign: "center",
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