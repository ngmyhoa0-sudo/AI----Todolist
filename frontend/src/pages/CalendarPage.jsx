import { useState, useEffect, useMemo } from "react";
import { getTodos } from "../services/todoService";
import { getErrorMessage } from "../utils/errorMessage";

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

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
    const tasksForSelected = tasksByDate[selectedKey] || [];

    const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
    const goNextMonth = () => setCursor(new Date(year, month + 1, 1));

    const monthLabel = cursor.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

    return (
        <div>
            <h1 style={styles.title}>Lịch</h1>

            {loading && <p style={styles.loading}>Đang tải...</p>}
            {error && <p style={styles.error}>{error}</p>}

            {!loading && !error && (
                <>
                    <div style={styles.calendarCard}>
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
                                        key={idx}
                                        onClick={() => setSelectedDate(date)}
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
                            {selectedDate.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" })}
                        </h2>
                        {tasksForSelected.length === 0 && (
                            <p style={styles.empty}>Không có task nào vào ngày này.</p>
                        )}
                        {tasksForSelected.map((t) => (
                            <div key={t.id} style={styles.taskItem}>
                                <span style={{ ...styles.taskDot, backgroundColor: t.is_completed ? "#2d7a4f" : "#111" }} />
                                <span style={{ ...styles.taskTitle, ...(t.is_completed ? styles.taskTitleDone : {}) }}>
                                    {t.title}
                                </span>
                                <span style={styles.taskTime}>
                                    {new Date(t.deadline).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {t.repeat_rule && <span style={styles.repeatIcon}>🔄</span>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px", fontWeight: "700", color: "#111",
        margin: "0 0 20px 0", letterSpacing: "-0.3px",
    },
    loading: { textAlign: "center", color: "#999", fontSize: "14px", padding: "20px 0" },
    error: {
        fontSize: "13px", color: "#d0453a", padding: "10px 12px",
        backgroundColor: "#fff5f5", borderRadius: "6px", border: "1px solid #fcc",
    },
    calendarCard: {
        backgroundColor: "#fff", border: "1px solid #eee", borderRadius: "10px",
        padding: "16px", marginBottom: "16px",
    },
    calHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "12px",
    },
    navBtn: {
        background: "none", border: "none", fontSize: "20px", color: "#444",
        cursor: "pointer", padding: "4px 10px",
    },
    monthLabel: { fontSize: "15px", fontWeight: "600", color: "#111", textTransform: "capitalize" },
    weekRow: {
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
        marginBottom: "4px",
    },
    weekday: { textAlign: "center", fontSize: "12px", color: "#999", padding: "4px 0" },
    grid: {
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px",
    },
    cellEmpty: { padding: "8px 0" },
    cell: {
        position: "relative", padding: "8px 0", fontSize: "13px", color: "#111",
        background: "none", border: "none", borderRadius: "8px", cursor: "pointer",
    },
    cellSelected: { backgroundColor: "#111", color: "#fff", fontWeight: "600" },
    cellToday: { border: "1px solid #111", fontWeight: "600" },
    dot: {
        position: "absolute", bottom: "2px", left: "50%", transform: "translateX(-50%)",
        width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#d0453a",
    },
    taskListCard: {
        backgroundColor: "#fff", border: "1px solid #eee", borderRadius: "10px", padding: "16px",
    },
    taskListTitle: {
        fontSize: "14px", fontWeight: "600", color: "#111", margin: "0 0 12px 0",
        textTransform: "capitalize",
    },
    empty: { textAlign: "center", color: "#999", fontSize: "13px", padding: "12px 0" },
    taskItem: {
        display: "flex", alignItems: "center", gap: "8px",
        padding: "8px 0", borderBottom: "1px solid #f5f5f5", fontSize: "13px",
    },
    taskDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
    taskTitle: { flex: 1, color: "#111" },
    taskTitleDone: { color: "#aaa", textDecoration: "line-through" },
    taskTime: { fontSize: "12px", color: "#999" },
    repeatIcon: { fontSize: "12px" },
};