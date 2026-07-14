import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import StatsPage from "./pages/StatsPage";
import AccountPage from "./pages/AccountPage";
import AppLayout from "./layouts/AppLayout";
import { TaskRefreshProvider } from "./context/TaskRefreshContext";

// App.jsx chỉ làm 1 việc: điều hướng giữa các trang
function App() {
    return (
        <BrowserRouter>
            <TaskRefreshProvider>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route element={<AppLayout />}>
                        <Route path="/home" element={<TasksPage />} />
                        <Route path="/calendar" element={<CalendarPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                        <Route path="/account" element={<AccountPage />} />
                    </Route>
                </Routes>
            </TaskRefreshProvider>
        </BrowserRouter>
    );
}

export default App;