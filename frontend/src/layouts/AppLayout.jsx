import { Outlet, NavLink } from "react-router-dom";
import ChatPanel from "../components/ChatPanel";
import { useLanguage } from "../context/LanguageContext";

const ICONS = {
    tasks: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    calendar: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    stats: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
    ),
    account: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
};

export default function AppLayout() {
    const { t } = useLanguage();

    const NAV_ITEMS = [
        { to: "/home", label: t("navTasks"), icon: ICONS.tasks },
        { to: "/calendar", label: t("navCalendar"), icon: ICONS.calendar },
        { to: "/stats", label: t("navStats"), icon: ICONS.stats },
        { to: "/account", label: t("navAccount"), icon: ICONS.account },
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
                            {item.icon}
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
    brand: { fontSize: "18px", fontWeight: "700", color: "#1a2b4c" },
    links: { display: "flex", gap: "6px", flexWrap: "wrap" },
    link: {
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 14px", borderRadius: "7px", fontSize: "14px",
        color: "#888", textDecoration: "none", fontWeight: "500",
    },
    linkActive: { backgroundColor: "#6EC3F4", color: "#fff" },
    content: { maxWidth: "640px", margin: "0 auto", padding: "24px 16px" },
};