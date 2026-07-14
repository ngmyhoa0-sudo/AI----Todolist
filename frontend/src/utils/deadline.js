// Task được coi là quá hạn khi có deadline, deadline đã qua, và chưa hoàn thành
export function isOverdue(todo) {
  if (todo.is_completed || !todo.deadline) return false;
  return new Date(todo.deadline) < new Date();
}
