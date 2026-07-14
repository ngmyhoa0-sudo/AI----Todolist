import { Outlet, NavLink } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";

const NAV_ITEMS = [
    { to: "/home", label: "Việc cần làm" },
    { to: "/calendar", label: "Lịch" },
    { to: "/stats", label: "Thống kê" },
    { to: "/account", label: "Tài khoản" },
];

// AppLayout chỉ làm 1 việc: khung chung cho các trang sau đăng nhập (nav + chat nổi + nội dung trang)
export default function AppLayout() {
    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <span style={styles.brand}>AI Todolist</span>
                <div style={styles.links}>
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            style={({ isActive }) => ({
                                ...styles.link,
                                ...(isActive ? styles.linkActive : {}),
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div style={styles.content}>
                <Outlet />
            </div>

            <ChatPanel />
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#f7f7f5",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    nav: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        zIndex: 10,
        flexWrap: "wrap",
        gap: "12px",
    },
    brand: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#111",
    },
    links: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
    },
    link: {
        padding: "8px 14px",
        borderRadius: "7px",
        fontSize: "14px",
        color: "#888",
        textDecoration: "none",
        fontWeight: "500",
    },
    linkActive: {
        backgroundColor: "#111",
        color: "#fff",
    },
    content: {
        maxWidth: "640px",
        margin: "0 auto",
        padding: "24px 16px",
    },
};