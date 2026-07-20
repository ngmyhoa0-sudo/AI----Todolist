import { useState, useEffect } from "react";
import { getStats } from "../services/statsService";
import { getErrorMessage } from "../utils/errorMessage";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

const CARD_BG = {
    light: { total: "#eef2f9", completed: "#e3f2e6", active: "#fdf3df", overdue: "#fbe6e6" },
    dark: { total: "#1e2735", completed: "#1b2e22", active: "#332c1a", overdue: "#3a2124" },
};

// StatsCard chỉ làm 1 việc: hiển thị số liệu tổng quan, tự gọi statsService
export default function StatsCard({ refreshTrigger }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const cardBg = CARD_BG[theme];
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

    if (loading) return <p style={styles.loading}>{t("loadingStats")}</p>;
    if (error) return <p style={styles.error}>{error}</p>;
    if (!stats) return null;

    const cards = [
        { label: t("totalTasks"), value: stats.total ?? 0, bg: cardBg.total },
        { label: t("completedTasks"), value: stats.completed ?? 0, bg: cardBg.completed },
        { label: t("activeTasks"), value: stats.active ?? 0, bg: cardBg.active },
        { label: t("overdueTasks"), value: stats.overdue ?? 0, bg: cardBg.overdue },
    ];

    return (
        <div style={styles.grid}>
            {cards.map((card) => (
                <div key={card.label} style={{ ...styles.card, backgroundColor: card.bg }}>
                    <span style={{ ...styles.value, color: colors.heading }}>{card.value}</span>
                    <span style={{ ...styles.label, color: colors.textMuted }}>{card.label}</span>
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
        fontWeight: "789",
        marginBottom: "4px",
        letterSpacing: "-0.5px",
    },
    label: {
        fontSize: "13px",
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