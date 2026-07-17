import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getStats } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";

const COLORS = { completed: "#4caf82", active: "#e0a83e", overdue: "#e57373" };

// StatsDonut chỉ làm 1 việc: hiển thị tỉ lệ % Hoàn thành/Đang làm/Quá hạn trên tổng số task
export default function StatsDonut({ refreshTrigger }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, [refreshTrigger]);

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

    if (loading) return <p style={styles.loading}>Đang tải biểu đồ...</p>;
    if (error) return <p style={styles.error}>{error}</p>;
    if (!stats) return null;

    const data = [
        { name: "Hoàn thành", value: stats.completed ?? 0, color: COLORS.completed },
        { name: "Đang làm", value: stats.active ?? 0, color: COLORS.active },
        { name: "Quá hạn", value: stats.overdue ?? 0, color: COLORS.overdue },
    ];
    const hasData = data.some((d) => d.value > 0);

    return (
        <div style={styles.wrapper}>
            <h3 style={styles.title}>Tỉ lệ trạng thái task</h3>
            {!hasData ? (
                <p style={styles.empty}>Chưa có dữ liệu để hiển thị</p>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

const styles = {
    wrapper: {
        borderRadius: "16px",
        backgroundColor: "#fff",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
    },
    title: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#1a2b4c",
        margin: "0 0 14px 0",
    },
    empty: {
        textAlign: "center",
        color: "#999",
        fontSize: "13px",
        padding: "40px 0",
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