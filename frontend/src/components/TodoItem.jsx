import { useState } from "react";
import { isOverdue } from "../utils/deadline";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";
import EditTaskModal from "./EditTaskModal";

// TodoItem chỉ làm 1 việc: hiển thị 1 task đơn lẻ
export default function TodoItem({ todo, onToggle, onDelete, onEdit }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const [deleteHover, setDeleteHover] = useState(false);
    const [editHover, setEditHover] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const overdue = isOverdue(todo);

    const handleConfirmDelete = () => {
        setConfirmOpen(false);
        onDelete(todo.id);
    };

    const styles = {
        item: {
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 14px", backgroundColor: colors.cardBg,
            border: `1px solid ${colors.border}`, borderRadius: "8px", marginBottom: "8px",
        },
        checkbox: { width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 },
        title: { flex: 1, fontSize: "14px", color: colors.text },
        titleDone: { color: colors.textMuted, opacity: 0.55 },
        titleOverdue: { color: "#d0453a" },
        deadline: { fontSize: "12px", whiteSpace: "nowrap" },
        deadlineRepeat: { color: "#7c4dff", fontWeight: "600" },
        iconBtn: {
            backgroundColor: colors.cardBg, border: "none", color: colors.heading,
            fontSize: "13px", cursor: "pointer",
            width: "44px", height: "44px", padding: "4px",
            borderRadius: "9px", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
            transition: "background-color 0.15s ease",
        },
        iconBtnHover: { backgroundColor: colors.inputBg },
        overlay: {
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
        },
        confirmBox: {
            backgroundColor: colors.cardBg,
            borderRadius: "14px",
            padding: "24px",
            width: "90%",
            maxWidth: "360px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            textAlign: "center",
        },
        confirmText: {
            fontSize: "14px",
            color: colors.heading,
            margin: "0 0 20px 0",
            lineHeight: "1.5",
        },
        confirmActions: {
            display: "flex",
            gap: "10px",
            justifyContent: "center",
        },
        cancelBtn: {
            flex: 1,
            padding: "10px",
            backgroundColor: colors.inputBg,
            color: colors.heading,
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
        },
        confirmDeleteBtn: {
            flex: 1,
            padding: "10px",
            backgroundColor: "#d7ecfb",
            color: "#1a2b4c",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
        },
    };

    const textColorStyle = {
        ...(todo.is_completed ? styles.titleDone : {}),
        ...(overdue ? styles.titleOverdue : {}),
    };

    return (
        <li style={styles.item}>
            <input
                type="checkbox"
                className="custom-checkbox"
                checked={todo.is_completed}
                onChange={() => onToggle(todo.id, todo.is_completed)}
                style={styles.checkbox}
            />
            <span style={{ ...styles.title, ...textColorStyle }}>
                {todo.title}
            </span>
            {todo.deadline && (
                <span style={{ ...styles.deadline, ...textColorStyle, ...(todo.repeat_rule ? styles.deadlineRepeat : {}) }}>
                    {todo.repeat_rule && "🔄 "}
                    {new Date(todo.deadline).toLocaleString(t("dateLocale"), {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </span>
            )}
            <button
                type="button"
                onClick={() => setEditOpen(true)}
                onMouseEnter={() => setEditHover(true)}
                onMouseLeave={() => setEditHover(false)}
                style={{ ...styles.iconBtn, ...(editHover ? styles.iconBtnHover : {}) }}
                aria-label={t("editBtn")}
            >
                {t("editBtn")}
            </button>
            <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                onMouseEnter={() => setDeleteHover(true)}
                onMouseLeave={() => setDeleteHover(false)}
                style={{ ...styles.iconBtn, ...(deleteHover ? styles.iconBtnHover : {}) }}
                aria-label={t("deleteBtn")}
            >
                {t("deleteBtn")}
            </button>

            {confirmOpen && (
                <div style={styles.overlay} onClick={() => setConfirmOpen(false)}>
                    <div style={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
                        <p style={styles.confirmText}>{t("deleteConfirmText")}</p>
                        <div style={styles.confirmActions}>
                            <button type="button" style={styles.cancelBtn} onClick={() => setConfirmOpen(false)}>
                                {t("cancelBtn")}
                            </button>
                            <button type="button" style={styles.confirmDeleteBtn} onClick={handleConfirmDelete}>
                                {t("deleteBtn")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editOpen && (
                <EditTaskModal
                    todo={todo}
                    onSave={onEdit}
                    onClose={() => setEditOpen(false)}
                />
            )}
        </li>
    );
}