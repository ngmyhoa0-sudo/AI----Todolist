import TodoItem from "./TodoItem";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

// TodoList chỉ làm 1 việc: hiển thị danh sách task, không tự gọi API
export default function TodoList({ todos, onToggle, onDelete }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];

    if (todos.length === 0) {
        return <p style={{ ...styles.empty, color: colors.textMuted }}>{t("emptyTasksMsg")}</p>;
    }
    return (
        <ul style={styles.list}>
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </ul>
    );
}

const styles = {
    list: { listStyle: "none", padding: 0, margin: 0 },
    empty: {
        textAlign: "center",
        fontSize: "14px", padding: "32px 0",
    },
};