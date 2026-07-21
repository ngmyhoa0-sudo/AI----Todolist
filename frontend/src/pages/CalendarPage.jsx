import { useState, useEffect, useMemo } from "react";
import { getTodos } from "../services/todoService";
import { getErrorMessage } from "../utils/errorMessage";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

const PASTEL_COLORS = ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D7BAFF", "#FFBAF0"];
function formatKey(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function buildMonthGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
}

export default function CalendarPage() {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = THEMES[theme];
    const WEEKDAYS = t("weekdaysShort");
    const dateLocale = t("dateLocale");
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cursor, setCursor] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getTodos();
            setTodos(data.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const tasksByDate = useMemo(() => {
        const map = {};
        for (const t of todos) {
            if (!t.deadline) continue;
            const key = formatKey(new Date(t.deadline));
            if (!map[key]) map[key] = [];
            map[key].push(t);
        }
        return map;
    }, [todos]);

    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

    const selectedKey = formatKey(selectedDate);
    const tasksForSelected = useMemo(() => {
        const list = tasksByDate[selectedKey] || [];
        return [...list].sort((a, b) => (a.is_completed === b.is_completed ? 0 : a.is_completed ? 1 : -1));
    }, [tasksByDate, selectedKey]);

    const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
    const goNextMonth = () => setCursor(new Date(year, month + 1, 1));

    const monthLabel = cursor.toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

    const styles = {
        pageWrapper: {
            position: "relative",
        },
        contentWrap: {
            position: "relative",
            zIndex: 1,
        },
        title: {
            fontSize: "22px", fontWeight: "700", color: colors.heading,
            margin: "0 0 20px 0", letterSpacing: "-0.3px",
        },
        loading: { textAlign: "center", color: colors.textMuted, fontSize: "14px", padding: "20px 0" },
        error: {
            fontSize: "13px", color: "#d0453a", padding: "10px 12px",
            backgroundColor: "#fff5f5", borderRadius: "6px", border: "1px solid #fcc",
        },
        calendarCard: {
            position: "relative",
            padding: "0", marginBottom: "20px",
        },
        deskCalendarIcon: {
            position: "absolute",
            right: "10px",
            bottom: "-50px",
            width: "clamp(90px, 25vw, 180px)",
            opacity: 0.1,
            pointerEvents: "none",
            transform: "scaleX(-1)",
        },
        clockIcon: {
            position: "absolute",
            left: "50px",
            bottom: "110px",
            width: "clamp(20px, 12vw, 60px)",
            opacity: 0.1,
            pointerEvents: "none",
            transform: "scaleY(-1)",
        },
        calHeader: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "12px",
        },
        navBtn: {
            background: "none", border: "none", fontSize: "20px", color: colors.textMuted,
            cursor: "pointer", padding: "4px 10px",
        },
        monthLabel: { fontSize: "15px", fontWeight: "700", color: colors.heading, textTransform: "capitalize" },
        weekRow: {
            display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
            marginBottom: "4px",
        },
        weekday: { textAlign: "center", fontSize: "12px", color: colors.textMuted, padding: "4px 0" },
        grid: {
            display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px",
        },
        cellEmpty: { padding: "8px 0" },
        cell: {
            position: "relative", padding: "8px 0", fontSize: "13px", color: colors.text,
            backgroundColor: "transparent", border: "none", borderRadius: "8px", cursor: "pointer",
            outline: "none",
            WebkitTapHighlightColor: "transparent",
            forcedColorAdjust: "none",
        },
        cellSelected: { backgroundColor: "#6EC3F4", color: "#fff", fontWeight: "600" },
        cellToday: { border: "1.61px solid #6EC3F4", fontWeight: "600" },
        dot: {
            position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)",
            width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#4A9EFF",
        },
        taskListCard: {
            backgroundColor: colors.cardBg,
            borderRadius: "16px", padding: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)",
        },
        taskListTitle: {
            fontSize: "14px", fontWeight: "700", color: colors.heading, margin: "0 0 12px 0",
            textTransform: "capitalize",
        },
        empty: { textAlign: "center", color: colors.textMuted, fontSize: "13px", padding: "12px 0" },
        taskItem: {
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 0", borderBottom: `1px solid ${colors.border}`, fontSize: "13px",
        },
        taskDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
        taskCheckIcon: { width: "14px", height: "14px", flexShrink: 0, color: "#8EC3F4" },
        taskTitle: { flex: 1, color: colors.text },
        taskTitleDone: { color: colors.textMuted },
        taskTime: { fontSize: "12px", color: colors.textMuted },
        repeatIcon: { fontSize: "12px" },
    };

    return (
        <div style={styles.pageWrapper}>

            <div style={styles.contentWrap}>
                <h1 style={styles.title}>{t("calendarPageTitle")}</h1>

                {loading && <p style={styles.loading}>{t("loadingText")}</p>}
                {error && <p style={styles.error}>{error}</p>}

                {!loading && !error && (
                    <>
                        <div style={styles.calendarCard}>
                            <img src="/desk-calendar.svg" alt="" style={styles.deskCalendarIcon} />
                            <img src="/clock.svg" alt="" style={styles.clockIcon} />

                            <div style={styles.calHeader}>
                                <button type="button" style={styles.navBtn} onClick={goPrevMonth}>‹</button>
                                <span style={styles.monthLabel}>{monthLabel}</span>
                                <button type="button" style={styles.navBtn} onClick={goNextMonth}>›</button>
                            </div>

                            <div style={styles.weekRow}>
                                {WEEKDAYS.map((w) => (
                                    <span key={w} style={styles.weekday}>{w}</span>
                                ))}
                            </div>

                            <div style={styles.grid}>
                                {cells.map((date, idx) => {
                                    if (!date) return <div key={idx} style={styles.cellEmpty} />;
                                    const key = formatKey(date);
                                    const hasTasks = !!tasksByDate[key];
                                    const isSelected = key === selectedKey;
                                    const isToday = key === formatKey(new Date());
                                    return (
                                        <button
                                            type="button"
                                            className={isSelected ? undefined : "calendar-day-btn"}
                                            key={idx}
                                            onClick={(e) => { setSelectedDate(date); e.currentTarget.blur(); }}
                                            style={{
                                                ...styles.cell,
                                                ...(isSelected ? styles.cellSelected : {}),
                                                ...(isToday && !isSelected ? styles.cellToday : {}),
                                            }}
                                        >
                                            {date.getDate()}
                                            {hasTasks && <span style={styles.dot} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={styles.taskListCard}>
                            <h2 style={styles.taskListTitle}>
                                {selectedDate.toLocaleDateString(dateLocale, { weekday: "long", day: "2-digit", month: "2-digit" })}
                            </h2>
                            {tasksForSelected.length === 0 && (
                                <p style={styles.empty}>{t("noTaskThisDay")}</p>
                            )}
                            {tasksForSelected.map((t2, idx) => (
                                <div key={t2.id} style={styles.taskItem}>
                                    {t2.is_completed ? (
                                        <svg style={styles.taskCheckIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <span style={{ ...styles.taskDot, backgroundColor: PASTEL_COLORS[idx % PASTEL_COLORS.length] }} />
                                    )}
                                    <span style={{ ...styles.taskTitle, ...(t2.is_completed ? styles.taskTitleDone : {}) }}>
                                        {t2.title}
                                    </span>
                                    <span style={styles.taskTime}>
                                        {new Date(t2.deadline).toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                    {t2.repeat_rule && <span style={styles.repeatIcon}>🔄</span>}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}