import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getStats } from "../services/statsService";

// StatsChart chỉ làm 1 việc: hiển thị biểu đồ cột thống kê task, tự gọi statsService
export default function StatsChart() {
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
      const msg = err.response?.data?.detail || err.message || "Đã có lỗi xảy ra.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={styles.loading}>Đang tải biểu đồ...</p>;
  if (error) return <p style={styles.error}>{error}</p>;
  if (!stats) return null;

  const chartData = [
    {
      name: "Thống kê",
      total: stats.total ?? 0,
      completed: stats.completed ?? 0,
      active: stats.active ?? 0,
      overdue: stats.overdue ?? 0,
    },
  ];

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>Thống kê công việc</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="total" name="Tổng task" fill="#111" />
          <Bar dataKey="completed" name="Hoàn thành" fill="#2d7a4f" />
          <Bar dataKey="active" name="Đang làm" fill="#a36b00" />
          <Bar dataKey="overdue" name="Quá hạn" fill="#d0453a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  wrapper: {
    border: "1px solid #eee",
    borderRadius: "10px",
    backgroundColor: "#fff",
    padding: "16px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#111",
    margin: "0 0 12px 0",
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
