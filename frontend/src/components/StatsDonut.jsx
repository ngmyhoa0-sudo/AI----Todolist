import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getPeriodStatus } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";
import PeriodNav from "./PeriodNav";

const COLORS = { completed: "#8EC3F4", active: "#2E7BC4", overdue: "#c0392b" };

// StatsDonut chỉ làm 1 việc: hiển thị tỉ lệ % Hoàn thành/Đang làm/Quá hạn trong đúng kỳ (tuần/năm) do StatsPage truyền xuống
export default function StatsDonut({ refreshTrigger, range, offset, onRangeChange, onOffsetChange, periodLabel }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadStats();
    }, [refreshTrigger, range, offset]);

    useEffect(() => {
        const interval = setInterval(loadStats, 60000);
        return () => clearInterval(interval);
    }, [range, offset]);

    const loadStats = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getPeriodStatus(range, offset);
            setStats(data.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ ...styles.wrapper, backgroundColor: colors.cardBg }}>
            <PeriodNav
                range={range}
                onRangeChange={onRangeChange}
                offset={offset}
                onOffsetChange={onOffsetChange}
                periodLabel={periodLabel}
            />

            {loading && <p style={styles.loading}>{t("loadingChart")}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {!loading && !error && (() => {
                const data = [
                    { name: t("completedTasks"), value: stats?.completed ?? 0, color: COLORS.completed },
                    { name: t("activeTasks"), value: stats?.active ?? 0, color: COLORS.active },
                    { name: t("overdueTasks"), value: stats?.overdue ?? 0, color: COLORS.overdue },
                ];
                const hasData = data.some((d) => d.value > 0);

                return !hasData ? (
                    <p style={{ ...styles.empty, color: colors.textMuted }}>{t("noDataMsg")}</p>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={0}>
                                {data.map((entry) => (
                                    <Cell key={entry.name} fill={entry.color} stroke={colors.cardBg} strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text }} />
                            <Legend wrapperStyle={{ color: colors.text }} />
                        </PieChart>
                    </ResponsiveContainer>
                );
            })()}
        </div>
    );
}

const styles = {
    wrapper: {
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
    },
    empty: {
        textAlign: "center",
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