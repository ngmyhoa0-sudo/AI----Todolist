import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import TodoList from "../components/TodoList";
import AddTaskForm from "../components/AddTaskForm";
import FilterBar from "../components/FilterBar";
import Notification from "../components/Notification";
import StatsCard from "../components/StatsCard";
import { getTodos, createTodo, updateTodo, deleteTodo } from "../services/todoService";
import { parseTask } from "../services/aiService";
import * as authService from "../services/authService";

// HomePage chỉ làm 1 việc: ghép các component con thành trang chính, quản lý state task
export default function HomePage() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [naturalAddError, setNaturalAddError] = useState("");

  const isGuest = new URLSearchParams(window.location.search).get("guest") === "true";

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
      const msg = err.response?.data?.detail || err.message || "Đã có lỗi xảy ra.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (title, deadline) => {
    await createTodo(deadline ? { title, deadline } : { title });
    await loadTodos();
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
      const msg = err.response?.data?.detail || err.message || "Đã có lỗi xảy ra.";
      setNaturalAddError(msg);
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
      case "active":
        return todos.filter((t) => !t.is_completed);
      case "done":
        return todos.filter((t) => t.is_completed);
      case "deadline":
        return [...todos]
          .filter((t) => t.deadline)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
      default:
        return todos;
    }
  }, [todos, filter]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>AI Todolist</h1>
            {isGuest && <span style={styles.guestBadge}>Chế độ khách</span>}
          </div>
          <button type="button" style={styles.logoutBtn} onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>

        <StatsCard />

        {!loading && !error && <Notification todos={todos} />}

        <AddTaskForm onAdd={handleAdd} onAddNatural={handleAddNatural} />
        {naturalAddError && <p style={styles.error}>{naturalAddError}</p>}

        <FilterBar current={filter} onChange={setFilter} />

        {loading && <p style={styles.loading}>Đang tải...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && !error && (
          <TodoList
            todos={filteredTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f7f7f5",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: "32px 16px",
  },
  container: {
    maxWidth: "640px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#111",
    margin: 0,
    letterSpacing: "-0.3px",
  },
  guestBadge: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "12px",
    color: "#888",
    backgroundColor: "#eee",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  logoutBtn: {
    background: "none",
    border: "1px solid #ddd",
    borderRadius: "7px",
    padding: "8px 14px",
    fontSize: "13px",
    color: "#555",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    color: "#999",
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