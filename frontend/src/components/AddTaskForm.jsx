import { useState, useRef, useEffect, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale/vi";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

registerLocale("vi", vi);

// Tên task hợp lệ khi chứa ít nhất 1 ký tự chữ/số
const HAS_ALPHANUMERIC = /[\p{L}\p{N}]/u;

function getQuickDate(preset) {
    const d = new Date();
    if (preset === "tomorrow") d.setDate(d.getDate() + 1);
    if (preset === "weekend") {
        const day = d.getDay();
        const diff = (6 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
    }
    if (preset === "nextweek") d.setDate(d.getDate() + 7);
    d.setHours(9, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stringToDate(str) {
    if (!str) return null;
    return new Date(str);
}

function dateToString(date) {
    if (!date) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const QUICK_OPTIONS = [
    { key: "today", labelKey: "todayOpt" },
    { key: "tomorrow", labelKey: "tomorrowOpt" },
    { key: "weekend", labelKey: "weekendOpt" },
    { key: "nextweek", labelKey: "nextWeekOpt" },
];

// Nút hiển thị ngày giờ đã chọn, dùng để thay input datetime-local gốc
const DateInput = forwardRef(({ value, onClick, placeholder, style }, ref) => (
    <button
        type="button"
        ref={ref}
        onClick={onClick}
        style={{
            ...style,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            fontFamily: "inherit",
            textAlign: "left",
            width: "100%",
            display: "block",
        }}
    >
        {value || placeholder}
    </button>
));

// 2 cột giờ/phút cuộn riêng, xếp bên cạnh lịch giống kiểu native
function CustomTimeInput({ value, onChange, colors }) {
    const [h, m] = (value || "00:00").split(":");
    const hour = parseInt(h, 10) || 0;
    const minute = parseInt(m, 10) || 0;
    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    useEffect(() => {
        hourRef.current?.scrollIntoView({ block: "center" });
        minuteRef.current?.scrollIntoView({ block: "center" });
    }, []);

    const pad = (n) => String(n).padStart(2, "0");
    const emitHour = (newHour) => onChange(`${pad(newHour)}:${pad(minute)}`);
    const emitMinute = (newMinute) => onChange(`${pad(hour)}:${pad(newMinute)}`);

    const columnStyle = {
        maxHeight: "200px",
        overflowY: "auto",
        width: "50px",
    };
    const itemStyle = (active) => ({
        padding: "6px 0",
        textAlign: "center",
        fontSize: "13px",
        cursor: "pointer",
        borderRadius: "4px",
        backgroundColor: active ? "#6EC3F4" : "transparent",
        color: active ? "#fff" : colors.text,
    });

    return (
        <div style={{ display: "flex", gap: "4px", padding: "10px", borderLeft: `1px solid ${colors.border}`, height: "100%" }}>
            <div className="time-scroll-col" style={columnStyle}>
                {Array.from({ length: 24 }, (_, i) => (
                    <div
                        key={i}
                        ref={i === hour ? hourRef : null}
                        style={itemStyle(i === hour)}
                        onClick={() => emitHour(i)}
                    >
                        {pad(i)}
                    </div>
                ))}
            </div>
            <div className="time-scroll-col" style={columnStyle}>
                {Array.from({ length: 60 }, (_, i) => (
                    <div
                        key={i}
                        ref={i === minute ? minuteRef : null}
                        style={itemStyle(i === minute)}
                        onClick={() => emitMinute(i)}
                    >
                        {pad(i)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// AddTaskForm chỉ làm 1 việc: nhận input task mới (2 chế độ: thường / AI) rồi gửi qua onAdd
export default function AddTaskForm({ onAdd, onAddNatural }) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const colors = THEMES[theme];
    const [mode, setMode] = useState("normal"); // "normal" | "ai"
    const [text, setText] = useState("");
    const [deadline, setDeadline] = useState("");
    const [repeatRule, setRepeatRule] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedText = text.trim();
        if (!trimmedText || !HAS_ALPHANUMERIC.test(trimmedText)) {
            setError(t("taskNameRequired"));
            return;
        }
        setError("");
        setLoading(true);
        try {
            if (mode === "ai") {
                await onAddNatural(trimmedText);
            } else if (deadline) {
                await onAdd(trimmedText, deadline, repeatRule || undefined);
            } else {
                await onAdd(trimmedText);
            }
            setText("");
            setDeadline("");
            setRepeatRule("");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        form: { marginBottom: "20px" },
        tabRow: { display: "flex", gap: "4px", marginBottom: "10px" },
        tab: {
            padding: "6px 12px", fontSize: "13px", border: "none",
            borderRadius: "6px", backgroundColor: colors.cardBg, color: colors.textMuted, cursor: "pointer",
        },
        tabActive: { backgroundColor: "#6EC3F4", color: "#fff" },
        inputRow: { display: "flex", gap: "8px" },
        input: {
            flex: 1, padding: "10px 12px", border: `1px solid ${colors.border}`,
            borderRadius: "7px", fontSize: "14px", outline: "none",
            backgroundColor: colors.inputBg, color: colors.text,
        },
        inputError: { borderColor: "#d0453a" },
        errorText: { fontSize: "12px", color: "#d0453a", margin: "6px 0 0" },
        addBtn: {
            padding: "10px 18px", backgroundColor: "#6EC3F4", color: "#fff",
            border: "none", borderRadius: "7px", fontSize: "14px",
            fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
        },
        deadlineRow: { display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" },
        quickRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
        quickBtn: {
            padding: "6px 12px", fontSize: "12px", border: `1px solid ${colors.border}`,
            borderRadius: "16px", backgroundColor: colors.inputBg, color: colors.text, cursor: "pointer",
        },
        deadlineLabel: { fontSize: "12px", color: colors.textMuted, marginTop: "4px" },
        deadlineInput: {
            padding: "8px 12px", border: `1px solid ${colors.border}`,
            borderRadius: "7px", fontSize: "13px", color: colors.text,
            outline: "none", backgroundColor: colors.inputBg, textAlign: "left",
            alignSelf: "flex-start", cursor: "pointer", minWidth: "180px",
        },
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.tabRow}>
                <button
                    type="button"
                    style={{ ...styles.tab, ...(mode === "normal" ? styles.tabActive : {}) }}
                    onClick={() => setMode("normal")}
                >
                    {t("normalTab")}
                </button>
                <button
                    type="button"
                    style={{ ...styles.tab, ...(mode === "ai" ? styles.tabActive : {}) }}
                    onClick={() => setMode("ai")}
                >
                    {t("aiTab")}
                </button>
            </div>

            <div style={styles.inputRow}>
                <input
                    style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder={mode === "ai" ? t("aiTaskPlaceholder") : t("taskNamePlaceholder")}
                />
                <button type="submit" style={styles.addBtn} disabled={loading}>
                    {loading ? t("adding") : t("addBtn")}
                </button>
            </div>
            {error && <p style={styles.errorText}>{error}</p>}

            {mode === "normal" && (
                <div style={styles.deadlineRow}>
                    <div style={styles.quickRow}>
                        {QUICK_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                type="button"
                                style={styles.quickBtn}
                                onClick={() => setDeadline(getQuickDate(opt.key))}
                            >
                                {t(opt.labelKey)}
                            </button>
                        ))}
                    </div>
                    <label style={styles.deadlineLabel}>{t("specificDateLabel")}</label>
                    <DatePicker
                        selected={stringToDate(deadline)}
                        onChange={(date) => setDeadline(dateToString(date))}
                        showTimeInput
                        timeCaption={t("timeCaption")}
                        customTimeInput={<CustomTimeInput colors={colors} />}
                        dateFormat="dd/MM/yyyy HH:mm"
                        placeholderText={t("specificDateLabel")}
                        locale={language === "vi" ? "vi" : "en-US"}
                        calendarClassName={theme === "dark" ? "app-datepicker-dark" : ""}
                        customInput={<DateInput style={styles.deadlineInput} />}
                    />

                    <label style={styles.deadlineLabel}>{t("repeatLabel")}</label>
                    <select
                        style={styles.deadlineInput}
                        value={repeatRule}
                        onChange={(e) => setRepeatRule(e.target.value)}
                    >
                        <option value="">{t("repeatNone")}</option>
                        <option value="daily">{t("repeatDaily")}</option>
                        <option value="weekday">{t("repeatWeekday")}</option>
                        <option value="weekly">{t("repeatWeekly")}</option>
                        <option value="monthly">{t("repeatMonthly")}</option>
                        <option value="yearly">{t("repeatYearly")}</option>
                    </select>
                </div>
            )}
        </form>
    );
}