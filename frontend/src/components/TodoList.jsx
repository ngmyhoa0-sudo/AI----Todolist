import TodoItem from "./TodoItem";

// TodoList chỉ làm 1 việc: hiển thị danh sách task, không tự gọi API
export default function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p style={styles.empty}>Chưa có task nào. Thêm task mới ở trên nhé!</p>;
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
    textAlign: "center", color: "#999",
    fontSize: "14px", padding: "32px 0",
  },
};