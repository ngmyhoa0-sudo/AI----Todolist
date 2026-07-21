import { useState, useEffect, useMemo } from "react";
import TodoList from "../components/TodoList";
import AddTaskForm from "../components/AddTaskForm";
import FilterBar from "../components/FilterBar";
import Notification from "../components/Notification";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../services/todoService";
import { parseTask } from "../services/aiService";
import { getErrorMessage } from "../utils/errorMessage";
import { isOverdue } from "../utils/deadline";
import { useTaskRefresh } from "../context/TaskRefreshContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

// TasksPage chỉ làm 1 việc: quản lý và hiển thị danh sách task
export default function TasksPage() {
    const { version } = useTaskRefresh();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const colors = THEMES[theme];
    const [todos, setTodos] = useState([]);
    const [filter, setFilter] = useState("all");
    const [sortMode, setSortMode] = useState("asc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [naturalAddError, setNaturalAddError] = useState("");

    const isGuest = new URLSearchParams(window.location.search).get("guest") === "true";

    useEffect(() => {
        loadTodos();
    }, [version]);

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

    const handleAdd = async (title, deadline, repeatRule) => {
        try {
            const payload = { title };
            if (deadline) payload.deadline = deadline;
            if (repeatRule) payload.repeat_rule = repeatRule;
            await createTodo(payload);
            await loadTodos();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleAddNatural = async (text) => {
        setNaturalAddError("");
        try {
            const res = await parseTask(text);
            const raw = res.data.result;

            let title = raw;
            let deadline;
            try {
                const parsed = JSON.parse(raw);
                if (parsed.title && parsed.title.trim()) {
                    title = parsed.title;
                    const deadlineRaw = typeof parsed.deadline === "string" ? parsed.deadline.trim() : "";
                    if (deadlineRaw && deadlineRaw.toLowerCase() !== "null") {
                        deadline = deadlineRaw;
                    }
                }
            } catch {
                // AI trả về text không phải JSON hợp lệ — giữ nguyên fallback: dùng cả chuỗi làm title
            }

            await createTodo(deadline ? { title, deadline } : { title });
            await loadTodos();
        } catch (err) {
            setNaturalAddError(getErrorMessage(err));
        }
    };

    const handleToggle = async (id, isCompleted) => {
        try {
            await updateTodo(id, { is_completed: !isCompleted });
            await loadTodos();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTodo(id);
            await loadTodos();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleEdit = async (id, updates) => {
        try {
            await updateTodo(id, updates);
            await loadTodos();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const filteredTodos = useMemo(() => {
        switch (filter) {
            case "active":
                return todos.filter((t) => !t.is_completed && !isOverdue(t));
            case "done":
                return todos.filter((t) => t.is_completed);
            case "deadline": {
                if (sortMode === "newest") {
                    return [...todos].sort((a, b) => b.id - a.id);
                }
                return [...todos]
                    .filter((t) => t.deadline)
                    .sort((a, b) =>
                        sortMode === "desc"
                            ? new Date(b.deadline) - new Date(a.deadline)
                            : new Date(a.deadline) - new Date(b.deadline)
                    );
            }
            case "all":
                return [...todos].sort((a, b) => {
                    // Đã xong luôn bị đẩy xuống cuối cùng
                    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
                    if (!a.is_completed) {
                        // Trong nhóm chưa xong: có deadline lên trước, không có deadline xuống sau
                        if (!!a.deadline !== !!b.deadline) return a.deadline ? -1 : 1;
                        if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
                    }
                    return 0;
                });
            default:
                return todos;
        }
    }, [todos, filter, sortMode]);

    const styles = {
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
        },
        title: {
            fontSize: "22px",
            fontWeight: "700",
            color: colors.heading,
            margin: 0,
            letterSpacing: "-0.3px",
        },
        guestBadge: {
            display: "inline-block",
            fontSize: "12px",
            color: colors.textMuted,
            backgroundColor: colors.cardBg,
            padding: "2px 8px",
            borderRadius: "10px",
        },
        loading: {
            textAlign: "center",
            color: colors.textMuted,
            fontSize: "14px",
            padding: "20px 0",
        },
        error: {
            fontSize: "13px",
            color: "#d0453a",
            padding: "10px 12px",
            backgroundColor: "#fff5f5",
            borderRadius: "6px",
            border: "1px solid #fcc",
        },
    };

    return (
        <div>
            <div style={styles.header}>
                <h1 style={styles.title}>{t("taskPageTitle")}</h1>
                {isGuest && <span style={styles.guestBadge}>{t("guestModeBadge")}</span>}
            </div>

            {!loading && <Notification todos={todos} />}

            <AddTaskForm onAdd={handleAdd} onAddNatural={handleAddNatural} />
            {naturalAddError && <p style={styles.error}>{naturalAddError}</p>}

            <FilterBar
                current={filter}
                onChange={setFilter}
                sortMode={sortMode}
                onSortModeChange={setSortMode}
            />

            {loading && <p style={styles.loading}>{t("loadingText")}</p>}
            {error && <p style={styles.error}>{error}</p>}
            {!loading && (
                <TodoList
                    todos={filteredTodos}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            )}
        </div>
    );
}