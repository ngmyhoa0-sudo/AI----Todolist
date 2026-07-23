import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import * as settingsService from "../services/settingsService";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";

const TIMEZONES = [
    { value: "Asia/Ho_Chi_Minh", label: "Vietnam (GMT+7)" },
    { value: "Asia/Bangkok", label: "Thailand (GMT+7)" },
    { value: "Asia/Shanghai", label: "China (GMT+8)" },
    { value: "Asia/Tokyo", label: "Japan (GMT+9)" },
    { value: "Asia/Seoul", label: "South Korea (GMT+9)" },
    { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
    { value: "Asia/Dubai", label: "UAE (GMT+4)" },
    { value: "Europe/London", label: "United Kingdom (GMT+0/+1)" },
    { value: "Europe/Paris", label: "France (GMT+1/+2)" },
    { value: "Europe/Moscow", label: "Russia (GMT+3)" },
    { value: "America/New_York", label: "US - Eastern (GMT-5/-4)" },
    { value: "America/Chicago", label: "US - Central (GMT-6/-5)" },
    { value: "America/Los_Angeles", label: "US - Pacific (GMT-8/-7)" },
    { value: "Australia/Sydney", label: "Australia (GMT+10/+11)" },
    { value: "UTC", label: "UTC" },
];

export default function AccountPage() {
    const navigate = useNavigate();
    const { language, setLanguage, t } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const colors = THEMES[theme];
    const [timezone, setTimezone] = useState("Asia/Ho_Chi_Minh");

    useEffect(() => {
        settingsService.getTimezone()
            .then((res) => setTimezone(res.data.timezone))
            .catch(() => { });
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate("/");
    };

    const toggleLanguage = () => {
        setLanguage(language === "vi" ? "en" : "vi");
    };

    const handleTimezoneChange = async (e) => {
        const newTz = e.target.value;
        setTimezone(newTz);
        try {
            await settingsService.updateTimezone(newTz);
        } catch {
            // Không lưu được thì thôi, giữ giá trị trên UI, thử lại lần sau khi vào lại trang
        }
    };

    return (
        <div>
            <h1 style={{ ...styles.title, color: colors.heading }}>{t("accountTitle")}</h1>

            <p style={{ ...styles.sectionLabel, color: colors.textMuted }}>{t("customizeLabel")}</p>
            <div style={{ ...styles.list, backgroundColor: colors.cardBg, border: `1px solid ${colors.border}` }}>
                <button
                    type="button"
                    style={{ ...styles.row, borderBottom: `1px solid ${colors.border}` }}
                    onClick={toggleLanguage}
                >
                    <span style={styles.iconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                    </span>
                    <span style={styles.rowText}>
                        <span style={{ ...styles.rowLabel, color: colors.text }}>{t("languageLabel")}</span>
                    </span>
                    <span style={{ ...styles.rowValue, color: colors.textMuted }}>
                        {language === "vi" ? t("languageVi") : t("languageEn")}
                    </span>
                    <span style={styles.chevron}>›</span>
                </button>

                <button
                    type="button"
                    style={{ ...styles.row, borderBottom: `1px solid ${colors.border}` }}
                    onClick={toggleTheme}
                >
                    <span style={styles.iconBox}>
                        {theme === "dark" ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        )}
                    </span>
                    <span style={styles.rowText}>
                        <span style={{ ...styles.rowLabel, color: colors.text }}>{t("themeLabel")}</span>
                    </span>
                    <span style={{ ...styles.rowValue, color: colors.textMuted }}>
                        {theme === "dark" ? t("themeDark") : t("themeLight")}
                    </span>
                    <span style={styles.chevron}>›</span>
                </button>

                <div style={{ ...styles.row, borderBottom: `1px solid ${colors.border}`, cursor: "default" }}>
                    <span style={styles.iconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </span>
                    <span style={styles.rowText}>
                        <span style={{ ...styles.rowLabel, color: colors.text }}>{t("timezoneLabel")}</span>
                    </span>
                    <select
                        value={timezone}
                        onChange={handleTimezoneChange}
                        style={{ ...styles.timezoneSelect, color: colors.textMuted }}
                    >
                        {TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                    </select>
                    <span style={styles.chevron}>›</span>
                </div>

                <button
                    type="button"
                    style={{ ...styles.row, borderBottom: "none" }}
                    onClick={handleLogout}
                >
                    <span style={styles.iconBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </span>
                    <span style={styles.rowText}>
                        <span style={{ ...styles.rowLabel, color: colors.text }}>{t("logout")}</span>
                    </span>
                    <span style={styles.chevron}>›</span>
                </button>
            </div>
        </div>
    );
}

const styles = {
    title: {
        fontSize: "22px", fontWeight: "700",
        margin: "0 0 20px 0", letterSpacing: "-0.3px",
    },
    sectionLabel: {
        fontSize: "12px", fontWeight: "600",
        textTransform: "uppercase", letterSpacing: "0.5px",
        margin: "0 0 8px 4px",
    },
    list: {
        borderRadius: "12px",
        overflow: "hidden",
    },
    row: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "15px 16px",
        background: "none",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        gap: "12px",
        fontFamily: "inherit",
    },
    iconBox: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "34px",
        height: "34px",
        borderRadius: "9px",
        backgroundColor: "#E3F2FD",
        color: "#2E7BC4",
        flexShrink: 0,
    },
    rowText: {
        flex: 1,
    },
    rowLabel: {
        fontSize: "14px",
        fontWeight: "450",
    },
    rowValue: {
        fontSize: "13px",
    },
    chevron: {
        fontSize: "18px",
        color: "#ccc",
    },
    timezoneSelect: {
        fontSize: "13px",
        fontFamily: "inherit",
        fontWeight: "inherit",
        border: "none",
        background: "none",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        textAlign: "right",
        padding: 0,
    },
};