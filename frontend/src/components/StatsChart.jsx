import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { getCompletedByDay, getCompletedByMonthDays, getCompletedByMonth } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";
import PeriodNav from "./PeriodNav";

// StatsChart chỉ làm 1 việc: hiển thị biểu đồ cột số task hoàn thành theo tuần/tháng/năm do StatsPage truyền xuống
export default function StatsChart({ refreshTrigger, range, offset, onRangeChange, onOffsetChange, periodLabel }) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const colors = THEMES[theme];
    const [chartData, setChartData] = useState([]);
    const [hasPrevYear, setHasPrevYear] = useState(false);
    const [years, setYears] = useState({ current: null, prev: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, [refreshTrigger, range, offset, language]);

    useEffect(() => {
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, [range, offset]);

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const weekdays = t("weekdaysShort");
            const months = t("monthsShort");
            if (range === "week") {
                const res = await getCompletedByDay(offset);
                const counts = res.data.counts;
                setChartData(weekdays.map((label, i) => ({ name: label, count: counts[i] })));
                setHasPrevYear(false);
            } else if (range === "month") {
                const res = await getCompletedByMonthDays(offset);
                const counts = res.data.counts;
                setChartData(counts.map((c, i) => ({ name: String(i + 1), count: c })));
                setHasPrevYear(false);
            } else {
                const res = await getCompletedByMonth(offset);
                const { currentYear, currentCounts, prevYear, prevCounts } = res.data;
                setYears({ current: currentYear, prev: prevYear });
                setHasPrevYear(!!prevCounts);
                setChartData(
                    months.map((label, i) => ({
                        name: label,
                        current: currentCounts[i],
                        ...(prevCounts ? { prev: prevCounts[i] } : {}),
                    }))
                );
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        wrapper: {
            borderRadius: "16px",
            backgroundColor: colors.cardBg,
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
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

    return (
        <div style={styles.wrapper}>
            <PeriodNav
                range={range}
                onRangeChange={onRangeChange}
                offset={offset}
                onOffsetChange={onOffsetChange}
                periodLabel={periodLabel}
            />

            {loading && <p style={styles.loading}>{t("loadingChart")}</p>}
            {error && <p style={styles.error}>{error}</p>}

            {!loading && !error && (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke={colors.border} />
                        <XAxis dataKey="name" tick={{ fill: colors.textMuted, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fill: colors.textMuted }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`, color: colors.text }}
                            cursor={{ fill: colors.border, opacity: 0 }}
                        />
                        {range === "year" && hasPrevYear && <Legend wrapperStyle={{ color: colors.text }} />}
                        {range === "week" || range === "month" ? (
                            <Bar dataKey="count" name={t("completedTasks")} fill="#5b8def" radius={[6, 6, 0, 0]} />
                        ) : hasPrevYear ? (
                            <>
                                <Bar dataKey="prev" name={`${t("yearLabel")} ${years.prev}`} fill="#c9dcf5" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="current" name={`${t("yearLabel")} ${years.current}`} fill="#5b8def" radius={[6, 6, 0, 0]} />
                            </>
                        ) : (
                            <Bar dataKey="current" name={t("completedTasks")} fill="#5b8def" radius={[6, 6, 0, 0]} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}