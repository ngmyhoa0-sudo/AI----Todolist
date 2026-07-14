import { createContext, useContext, useState } from "react";

// TaskRefreshContext: cho phép ChatBox (nằm ở AppLayout) báo cho TasksPage/StatsPage
// (nằm ở trang khác) biết cần tải lại dữ liệu, dù chúng không còn là cha-con trực tiếp nữa.
const TaskRefreshContext = createContext(null);

export function TaskRefreshProvider({ children }) {
    const [version, setVersion] = useState(0);
    const bump = () => setVersion((v) => v + 1);
    return (
        <TaskRefreshContext.Provider value={{ version, bump }}>
            {children}
        </TaskRefreshContext.Provider>
    );
}

export function useTaskRefresh() {
    const ctx = useContext(TaskRefreshContext);
    if (!ctx) throw new Error("useTaskRefresh phải dùng bên trong TaskRefreshProvider");
    return ctx;
}