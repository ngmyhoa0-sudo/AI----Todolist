import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";
import DeadlinePicker from "./DeadlinePicker";

const HAS_ALPHANUMERIC = /[\p{L}\p{N}]/u;

// EditTaskModal chỉ làm 1 việc: sửa tên/deadline/lặp lại của 1 task đã có
export default function EditTaskModal({ todo, onSave, onClose }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const [title, setTitle] = useState(todo.title);
    const [deadline, setDeadline] = useState(todo.deadline ? todo.deadline.slice(0, 16) : "");
    const [repeatRule, setRepeatRule] = useState(todo.repeat_rule || "");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        const trimmed = title.trim();
        if (!trimmed || !HAS_ALPHANUMERIC.test(trimmed)) {
            setError(t("taskNameRequired"));
            return;
        }
        setError("");
        setSaving(true);
        try {
            const updates = { title: trimmed, repeat_rule: repeatRule || "none" };
            if (deadline) updates.deadline = deadline;
            await onSave(todo.id, updates);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const styles = {
        overlay: {
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
        },
        box: {
            backgroundColor: colors.cardBg,
            borderRadius: "14px",
            padding: "24px",
            width: "90%",
            maxWidth: "380px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        },
        heading: {
            fontSize: "16px", fontWeight: "700", color: colors.heading,
            margin: "0 0 16px 0",
        },
        input: {
            width: "100%", padding: "10px 12px", border: `1px solid ${colors.border}`,
            borderRadius: "7px", fontSize: "14px", outline: "none",
            backgroundColor: colors.inputBg, color: colors.text,
            boxSizing: "border-box", marginBottom: "12px",
        },
        inputError: { borderColor: "#d0453a" },
        errorText: { fontSize: "12px", color: "#d0453a", margin: "-8px 0 12px" },
        label: { fontSize: "12px", color: colors.textMuted, marginBottom: "6px", display: "block" },
        select: {
            width: "100%", padding: "8px 12px", border: `1px solid ${colors.border}`,
            borderRadius: "7px", fontSize: "13px", color: colors.text,
            outline: "none", backgroundColor: colors.inputBg,
            boxSizing: "border-box", marginBottom: "16px",
        },
        actions: { display: "flex", gap: "10px", justifyContent: "center" },
        cancelBtn: {
            flex: 1, padding: "10px", backgroundColor: colors.inputBg, color: colors.heading,
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
        },
        saveBtn: {
            flex: 1, padding: "10px", backgroundColor: "#d7ecfb", color: "#1a2b4c",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
        },
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.box} onClick={(e) => e.stopPropagation()}>
                <p style={styles.heading}>{t("editTaskTitle")}</p>

                <input
                    style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
                    type="text"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder={t("taskNamePlaceholder")}
                />
                {error && <p style={styles.errorText}>{error}</p>}

                <label style={styles.label}>{t("specificDateLabel")}</label>
                <div style={{ marginBottom: "16px" }}>
                    <DeadlinePicker value={deadline} onChange={setDeadline} />
                </div>

                <label style={styles.label}>{t("repeatLabel")}</label>
                <select
                    style={styles.select}
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

                <div style={styles.actions}>
                    <button type="button" style={styles.cancelBtn} onClick={onClose}>
                        {t("cancelBtn")}
                    </button>
                    <button type="button" style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? t("adding") : t("saveBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
}