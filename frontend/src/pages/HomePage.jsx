import { useState, useEffect, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TodoList    from "../components/TodoList";
import AddTaskForm from "../components/AddTaskForm";
import FilterBar   from "../components/FilterBar";
import Notification from "../components/Notification";
import StatsCard   from "../components/StatsCard";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../services/todoService";
import { parseTask } from "../services/aiService";
import authService from "../services/authService";
import { ThemeContext } from "../context/ThemeContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const dark = theme === "dark";

  const [todos, setTodos]     = useState([]);
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const isGuest = new URLSearchParams(window.location.search).get("guest") === "true";

  const c = colors(dark);

  useEffect(() => { loadTodos(); }, []);

  const loadTodos = async () => {
    setLoading(true); setError("");
    try {
      const data = await getTodos();
      setTodos(data.data);
    } catch (err) {
      setError(err.message || "Không tải được danh sách task.");
    } finally { setLoading(false); }
  };

  const handleAdd = async (title) => {
    await createTodo({ title });
    await loadTodos();
  };

  // Sửa FE-5: parse kết quả AI rồi mới gọi createTodo
  const handleAddNatural = async (text) => {
    try {
      const res = await parseTask(text);
      const raw = res.data?.result ?? "";
      const jsonStr = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed?.title) {
        await createTodo({ title: parsed.title, deadline: parsed.deadline ?? null });
      }
      await loadTodos();
    } catch {
      await loadTodos();
    }
  };

  const handleToggle = async (id, isCompleted) => {
    await updateTodo(id, { is_completed: !isCompleted });
    await loadTodos();
  };

  const handleDelete = async (id) => {
    await deleteTodo(id);
    await loadTodos();
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":   return todos.filter((t) => !t.is_completed);
      case "done":     return todos.filter((t) => t.is_completed);
      case "deadline": return [...todos].filter((t) => t.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      default:         return todos;
    }
  }, [todos, filter]);

  return (
    <div style={{ ...s.page, backgroundColor: c.pageBg }}>
      <div style={s.container}>

        <div style={s.header}>
          <div>
            <h1 style={{ ...s.title, color: c.text }}>AI Todolist</h1>
            {isGuest && <span style={{ ...s.guestBadge, backgroundColor: c.badgeBg, color: c.textMuted }}>Chế độ khách</span>}
          </div>
          <div style={s.headerActions}>
            <button type="button" onClick={toggleTheme} style={s.themeBtn}>
              {dark ? "☀️" : "🌙"}
            </button>
            <button type="button" style={{ ...s.logoutBtn, borderColor: c.border, color: c.textSub }} onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        </div>

        <StatsCard />

        {!loading && !error && <Notification todos={todos} />}

        <AddTaskForm onAdd={handleAdd} onAddNatural={handleAddNatural} />

        <FilterBar current={filter} onChange={setFilter} />

        {loading && <p style={{ ...s.loading, color: c.textMuted }}>Đang tải...</p>}
        {error   && <p style={s.error}>{error}</p>}
        {!loading && !error && (
          <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} />
        )}

      </div>
    </div>
  );
}

const colors = (dark) => ({
  pageBg:   dark ? "#111111" : "#f7f7f5",
  text:     dark ? "#f0f0f0" : "#111111",
  textSub:  dark ? "#cccccc" : "#555555",
  textMuted:dark ? "#999999" : "#888888",
  border:   dark ? "#333333" : "#dddddd",
  badgeBg:  dark ? "#2a2a2a" : "#eeeeee",
});

const s = {
  page:          { minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif", padding: "32px 16px" },
  container:     { maxWidth: "640px", margin: "0 auto" },
  header:        { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  title:         { fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" },
  guestBadge:    { display: "inline-block", marginTop: "4px", fontSize: "12px", padding: "2px 8px", borderRadius: "10px" },
  headerActions: { display: "flex", alignItems: "center", gap: "8px" },
  themeBtn:      { background: "none", border: "none", fontSize: "18px", cursor: "pointer", padding: "4px" },
  logoutBtn:     { background: "none", border: "1px solid", borderRadius: "7px", padding: "8px 14px", fontSize: "13px", cursor: "pointer" },
  loading:       { textAlign: "center", fontSize: "14px", padding: "20px 0" },
  error:         { fontSize: "13px", color: "#d0453a", padding: "10px 12px", backgroundColor: "#fff5f5", borderRadius: "6px", border: "1px solid #fcc" },
};
