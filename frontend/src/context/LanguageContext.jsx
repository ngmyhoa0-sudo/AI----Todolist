import { createContext, useContext, useState } from "react";

const translations = {
    vi: {
        navTasks: "Việc cần làm",
        navCalendar: "Lịch",
        navStats: "Thống kê",
        navAccount: "Tài khoản",
        taskPageTitle: "Việc cần làm",
        calendarPageTitle: "Lịch",
        statsPageTitle: "Thống kê",
        accountTitle: "Tài khoản",
        logout: "Đăng xuất",
        languageLabel: "Ngôn ngữ",
    },
    en: {
        navTasks: "Tasks",
        navCalendar: "Calendar",
        navStats: "Statistics",
        navAccount: "Account",
        taskPageTitle: "Tasks",
        calendarPageTitle: "Calendar",
        statsPageTitle: "Statistics",
        accountTitle: "Account",
        logout: "Log out",
        languageLabel: "Language",
    },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(() => localStorage.getItem("language") || "vi");

    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key) => translations[language]?.[key] ?? translations.vi[key] ?? key;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage phải dùng bên trong LanguageProvider");
    return ctx;
}