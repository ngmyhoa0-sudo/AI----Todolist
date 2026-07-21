import { useState } from "react";
import StatsCard from "../components/StatsCard";
import StatsChart from "../components/StatsChart";
import StatsDonut from "../components/StatsDonut";
import { useTaskRefresh } from "../context/TaskRefreshContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

function getWeekRange(offset) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - now.getDay() + offset * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
}

function getMonthLabelParts(offset) {
    const now = new Date();
    const totalMonths = now.getFullYear() * 12 + now.getMonth() + offset;
    const year = Math.floor(totalMonths / 12);
    const month = totalMonths % 12;
    return { year, month };
}

function formatShortDate(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

export default function StatsPage() {
    const { version } = useTaskRefresh();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = THEMES[theme];
    const [view, setView] = useState("trend");
    const [range, setRange] = useState("week");
    const [offset, setOffset] = useState(0);

    const changeRange = (newRange) => {
        setRange(newRange);
        setOffset(0);
    };

    const periodLabel = (() => {
        if (range === "week") {
            if (offset === 0) return t("thisWeek");
            const { start, end } = getWeekRange(offset);
            return `${formatShortDate(start)} - ${formatShortDate(end)}`;
        }
        if (range === "month") {
            if (offset === 0) return t("thisMonth");
            const { year, month } = getMonthLabelParts(offset);
            return `${t("monthRange")} ${month + 1}/${year}`;
        }
        if (offset === 0) return t("thisYear");
        return `${t("yearLabel")} ${new Date().getFullYear() + offset}`;
    })();

    const styles = {
        title: {
            fontSize: "22px",
            fontWeight: "700",
            color: colors.heading,
            margin: "0 0 20px 0",
            letterSpacing: "-0.3px",
        },
        toggleRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "12px",
        },
        chartTitle: {
            fontSize: "15px",
            fontWeight: "700",
            color: colors.heading,
            margin: 0,
        },
        toggleContainer: {
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: colors.cardBg,
            borderRadius: "999px",
            padding: "4px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        },
        toggleBtn: {
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            fontSize: "13px",
            fontWeight: "600",
            border: "none",
            borderRadius: "999px",
            backgroundColor: "transparent",
            color: colors.textMuted,
            cursor: "pointer",
        },
        toggleBtnActive: {
            backgroundColor: "#d7ecfb",
            color: "#2E7BC4",
        },
    };

    return (
        <div>
            <h1 style={styles.title}>{t("statsPageTitle")}</h1>
            <StatsCard refreshTrigger={version} />

            <div style={styles.toggleRow}>
                <h3 style={styles.chartTitle}>
                    {view === "trend" ? t("completedTasksChartTitle") : t("statusRatioTitle")}
                </h3>
                <div style={styles.toggleContainer}>
                    <button
                        type="button"
                        style={{ ...styles.toggleBtn, ...(view === "distribution" ? styles.toggleBtnActive : {}) }}
                        onClick={() => setView("distribution")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                            <path d="M22 12A10 10 0 0 0 12 2v10z" />
                        </svg>
                        {view === "distribution" && t("distributionTab")}
                    </button>
                    <button
                        type="button"
                        style={{ ...styles.toggleBtn, ...(view === "trend" ? styles.toggleBtnActive : {}) }}
                        onClick={() => setView("trend")}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                        {view === "trend" && t("trendTab")}
                    </button>
                </div>
            </div>

            {view === "trend" ? (
                <StatsChart
                    refreshTrigger={version}
                    range={range}
                    offset={offset}
                    onRangeChange={changeRange}
                    onOffsetChange={setOffset}
                    periodLabel={periodLabel}
                />
            ) : (
                <StatsDonut
                    refreshTrigger={version}
                    range={range}
                    offset={offset}
                    onRangeChange={changeRange}
                    onOffsetChange={setOffset}
                    periodLabel={periodLabel}
                />
            )}
        </div>
    );
}