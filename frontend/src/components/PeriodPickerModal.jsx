import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";
import { getActivitySummary } from "../services/statsService";

function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function formatShort(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function getWeeksInMonth(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    let cursor = getWeekStart(firstOfMonth);
    const weeks = [];
    while (cursor <= lastOfMonth) {
        const start = new Date(cursor);
        weeks.push({ start, end: addDays(start, 6) });
        cursor = addDays(cursor, 7);
    }
    return weeks;
}

function weekOffsetFromNow(weekStart) {
    const nowWeekStart = getWeekStart(new Date());
    const diffDays = Math.round((weekStart - nowWeekStart) / 86400000);
    return Math.round(diffDays / 7);
}

function monthOffsetFromNow(year, month) {
    const now = new Date();
    return (year - now.getFullYear()) * 12 + (month - now.getMonth());
}

function monthKey(year, month) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${year}-${pad(month + 1)}`;
}

function hasDataInRange(days, start, end) {
    return days.some((d) => {
        const day = new Date(`${d}T00:00:00`);
        return day >= start && day <= end;
    });
}

// PeriodPickerModal chỉ làm 1 việc: cho chọn nhanh 1 tuần/tháng/năm bất kỳ có dữ liệu để xem thống kê
export default function PeriodPickerModal({ range, offset, onApply, onClose }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const [activeTab, setActiveTab] = useState(range === "year" || range === "month" ? range : "week");
    const [browseDate, setBrowseDate] = useState(new Date());
    const [pendingRange, setPendingRange] = useState(range);
    const [pendingOffset, setPendingOffset] = useState(offset);
    const [activity, setActivity] = useState({ days: [], months: [], earliestYear: new Date().getFullYear() });

    useEffect(() => {
        getActivitySummary()
            .then((res) => setActivity(res.data))
            .catch(() => { });
    }, []);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setBrowseDate(new Date());
    };

    const thisYear = new Date().getFullYear();

    const styles = {
        overlay: {
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
        },
        box: {
            backgroundColor: colors.cardBg,
            borderRadius: "14px",
            width: "90%",
            maxWidth: "380px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            overflow: "hidden",
        },
        header: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${colors.border}`,
        },
        title: { fontSize: "15px", fontWeight: "700", color: colors.heading, margin: 0 },
        closeBtn: {
            background: "none", border: "none", fontSize: "20px", color: colors.textMuted, cursor: "pointer", lineHeight: 1,
        },
        tabsRow: {
            display: "flex", gap: "4px", padding: "12px 20px 0",
        },
        tabBtn: {
            flex: 1, padding: "8px", fontSize: "13px", fontWeight: "600",
            border: `1px solid ${colors.border}`, borderRadius: "8px",
            backgroundColor: "transparent", color: colors.textMuted, cursor: "pointer",
            outline: "none",
        },
        tabBtnActive: {
            border: "1px solid #6EC3F4", color: "#2E7BC4", backgroundColor: "#eaf6ff",
        },
        subNav: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", borderBottom: `1px solid ${colors.border}`,
        },
        subNavBtn: {
            background: "none", border: "none", fontSize: "16px", color: colors.textMuted, cursor: "pointer",
        },
        subNavLabel: { fontSize: "14px", fontWeight: "600", color: colors.text },
        list: {
            maxHeight: "260px", overflowY: "auto", padding: "8px 12px",
        },
        listRow: {
            display: "flex", justifyContent: "space-between", alignItems: "center",
            width: "100%", padding: "10px 12px", marginBottom: "4px",
            border: "none", borderRadius: "8px",
            backgroundColor: "transparent", color: colors.text,
            fontSize: "13px", cursor: "pointer", textAlign: "left",
            outline: "none",
        },
        listRowSelected: {
            backgroundColor: "#eaf6ff", color: "#2E7BC4", fontWeight: "700",
            border: "1px solid #6EC3F4",
        },
        listRowDisabled: { color: colors.textMuted, opacity: 0.4, cursor: "default" },
        grid3: {
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "16px 20px",
        },
        gridCell: {
            padding: "10px 4px", fontSize: "13px", fontWeight: "400",
            border: `1px solid ${colors.border}`, borderRadius: "8px",
            backgroundColor: "transparent", color: colors.text, cursor: "pointer",
            outline: "none",
        },
        gridCellSelected: {
            border: "1px solid #6EC3F4", backgroundColor: "#6EC3F4", color: "#fff",
        },
        gridCellDisabled: { color: colors.textMuted, opacity: 0.4, cursor: "default" },
        footer: {
            display: "flex", gap: "10px", padding: "16px 20px", borderTop: `1px solid ${colors.border}`,
        },
        clearBtn: {
            flex: 1, padding: "10px", backgroundColor: colors.inputBg, color: colors.heading,
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
        },
        applyBtn: {
            flex: 1, padding: "10px", backgroundColor: "#6EC3F4", color: "#fff",
            border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
        },
    };

    const renderWeekTab = () => {
        const weeks = getWeeksInMonth(browseDate.getFullYear(), browseDate.getMonth());
        return (
            <>
                <div style={styles.subNav}>
                    <button
                        type="button"
                        style={styles.subNavBtn}
                        onClick={() => setBrowseDate(new Date(browseDate.getFullYear(), browseDate.getMonth() - 1, 1))}
                    >
                        ‹
                    </button>
                    <span style={styles.subNavLabel}>{t("monthRange")} {browseDate.getMonth() + 1}/{browseDate.getFullYear()}</span>
                    <button
                        type="button"
                        style={styles.subNavBtn}
                        onClick={() => setBrowseDate(new Date(browseDate.getFullYear(), browseDate.getMonth() + 1, 1))}
                    >
                        ›
                    </button>
                </div>
                <div style={styles.list}>
                    {weeks.map((w, i) => {
                        const wOffset = weekOffsetFromNow(w.start);
                        const isCurrent = wOffset === 0;
                        const isFuture = wOffset > 0;
                        const isEmpty = !isCurrent && !hasDataInRange(activity.days, w.start, w.end);
                        const isDisabled = isFuture || isEmpty;
                        const isSelected = pendingRange === "week" && pendingOffset === wOffset;
                        return (
                            <button
                                key={i}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => { setPendingRange("week"); setPendingOffset(wOffset); }}
                                style={{
                                    ...styles.listRow,
                                    ...(isSelected ? styles.listRowSelected : {}),
                                    ...(isDisabled ? styles.listRowDisabled : {}),
                                }}
                            >
                                <span>{isCurrent ? t("thisWeek") : `${t("weekRange")} ${i + 1}`}</span>
                                <span>{formatShort(w.start)} - {formatShort(w.end)}</span>
                            </button>
                        );
                    })}
                </div>
            </>
        );
    };

    const renderMonthTab = () => (
        <>
            <div style={styles.subNav}>
                <button
                    type="button"
                    style={styles.subNavBtn}
                    onClick={() => setBrowseDate(new Date(browseDate.getFullYear() - 1, browseDate.getMonth(), 1))}
                >
                    ‹
                </button>
                <span style={styles.subNavLabel}>{t("yearLabel")} {browseDate.getFullYear()}</span>
                <button
                    type="button"
                    style={styles.subNavBtn}
                    onClick={() => setBrowseDate(new Date(browseDate.getFullYear() + 1, browseDate.getMonth(), 1))}
                >
                    ›
                </button>
            </div>
            <div style={styles.grid3}>
                {Array.from({ length: 12 }, (_, m) => {
                    const mOffset = monthOffsetFromNow(browseDate.getFullYear(), m);
                    const isCurrent = mOffset === 0;
                    const isFuture = mOffset > 0;
                    const isEmpty = !isCurrent && !activity.months.includes(monthKey(browseDate.getFullYear(), m));
                    const isDisabled = isFuture || isEmpty;
                    const isSelected = pendingRange === "month" && pendingOffset === mOffset;
                    return (
                        <button
                            key={m}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => { setPendingRange("month"); setPendingOffset(mOffset); }}
                            style={{
                                ...styles.gridCell,
                                ...(isSelected ? styles.gridCellSelected : {}),
                                ...(isDisabled ? styles.gridCellDisabled : {}),
                            }}
                        >
                            {t("monthRange")} {m + 1}
                        </button>
                    );
                })}
            </div>
        </>
    );

    const renderYearTab = () => {
        const yearOptions = [];
        for (let y = activity.earliestYear; y <= thisYear; y++) yearOptions.push(y);
        return (
            <div style={styles.grid3}>
                {yearOptions.map((y) => {
                    const yOffset = y - thisYear;
                    const isSelected = pendingRange === "year" && pendingOffset === yOffset;
                    return (
                        <button
                            key={y}
                            type="button"
                            onClick={() => { setPendingRange("year"); setPendingOffset(yOffset); }}
                            style={{ ...styles.gridCell, ...(isSelected ? styles.gridCellSelected : {}) }}
                        >
                            {t("yearLabel")} {y}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.box} onClick={(e) => e.stopPropagation()}>
                <div style={styles.header}>
                    <p style={styles.title}>{t("chooseTimeRangeTitle")}</p>
                    <button type="button" style={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <div style={styles.tabsRow}>
                    <button
                        type="button"
                        style={{ ...styles.tabBtn, ...(activeTab === "week" ? styles.tabBtnActive : {}) }}
                        onClick={() => switchTab("week")}
                    >
                        {t("weekRange")}
                    </button>
                    <button
                        type="button"
                        style={{ ...styles.tabBtn, ...(activeTab === "month" ? styles.tabBtnActive : {}) }}
                        onClick={() => switchTab("month")}
                    >
                        {t("monthRange")}
                    </button>
                    <button
                        type="button"
                        style={{ ...styles.tabBtn, ...(activeTab === "year" ? styles.tabBtnActive : {}) }}
                        onClick={() => switchTab("year")}
                    >
                        {t("yearLabel")}
                    </button>
                </div>

                {activeTab === "week" && renderWeekTab()}
                {activeTab === "month" && renderMonthTab()}
                {activeTab === "year" && renderYearTab()}

                <div style={styles.footer}>
                    <button
                        type="button"
                        style={styles.clearBtn}
                        onClick={() => { onApply("week", 0); onClose(); }}
                    >
                        {t("clearFilterBtn")}
                    </button>
                    <button
                        type="button"
                        style={styles.applyBtn}
                        onClick={() => { onApply(pendingRange, pendingOffset); onClose(); }}
                    >
                        {t("applyBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
}