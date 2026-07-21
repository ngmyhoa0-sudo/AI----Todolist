import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";
import DeadlinePicker from "./DeadlinePicker";

// Tên task hợp lệ khi chứa ít nhất 1 ký tự chữ/số
const HAS_ALPHANUMERIC = /[\p{L}\p{N}]/u;

function getQuickDate(preset) {
    const d = new Date();
    if (preset === "tomorrow") d.setDate(d.getDate() + 1);
    if (preset === "weekend") {
        const day = d.getDay();
        const diff = (0 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
    }
    if (preset === "nextweek") d.setDate(d.getDate() + 7);
    if (preset !== "today") d.setHours(9, 0, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const QUICK_OPTIONS = [
    { key: "today", labelKey: "todayOpt" },
    { key: "tomorrow", labelKey: "tomorrowOpt" },
    { key: "weekend", labelKey: "weekendOpt" },
    { key: "nextweek", labelKey: "nextWeekOpt" },
];

// AddTaskForm chỉ làm 1 việc: nhận input task mới (2 chế độ: thường / AI) rồi gửi qua onAdd
export default function AddTaskForm({ onAdd, onAddNatural }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
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
            outline: "none", backgroundColor: colors.inputBg,
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
                    <DeadlinePicker value={deadline} onChange={setDeadline} />

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