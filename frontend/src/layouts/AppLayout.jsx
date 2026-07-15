import { Outlet, NavLink } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import { useLanguage } from "../context/LanguageContext";

export default function AppLayout() {
    const { t } = useLanguage();

    const NAV_ITEMS = [
        { to: "/home", label: t("navTasks") },
        { to: "/calendar", label: t("navCalendar") },
        { to: "/stats", label: t("navStats") },
        { to: "/account", label: t("navAccount") },
    ];

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
        backgroundColor: "#E3F2FD",
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
    brand: { fontSize: "18px", fontWeight: "700", color: "#111" },
    links: { display: "flex", gap: "6px", flexWrap: "wrap" },
    link: {
        padding: "8px 14px", borderRadius: "7px", fontSize: "14px",
        color: "#888", textDecoration: "none", fontWeight: "500",
    },
    linkActive: { backgroundColor: "#111", color: "#fff" },
    content: { maxWidth: "640px", margin: "0 auto", padding: "24px 16px" },
};