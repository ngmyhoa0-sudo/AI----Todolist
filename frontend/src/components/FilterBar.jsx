import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

// FilterBar chỉ làm 1 việc: hiển thị thanh lọc + nút sắp xếp riêng, báo lựa chọn ra ngoài
const TAB_FILTERS = [
    { key: "active", labelKey: "filterActive" },
    { key: "done", labelKey: "filterDone" },
    { key: "all", labelKey: "filterAll" },
];

const SORT_OPTIONS = [
    { key: "asc", labelKey: "sortDeadlineAsc" },
    { key: "desc", labelKey: "sortDeadlineDesc" },
    { key: "newest", labelKey: "sortNewest" },
];

export default function FilterBar({ current, onChange, sortMode, onSortModeChange }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];
    const [sortOpen, setSortOpen] = useState(false);

    const isSortActive = current === "deadline";

    const handlePickSort = (key) => {
        onSortModeChange(key);
        onChange("deadline");
        setSortOpen(false);
    };

    const styles = {
        bar: {
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: "6px", marginBottom: "16px", flexWrap: "wrap",
        },
        tabGroup: { display: "flex", gap: "6px", flexWrap: "wrap" },
        btn: {
            padding: "6px 14px", fontSize: "13px", border: `1px solid ${colors.border}`,
            borderRadius: "20px", backgroundColor: colors.cardBg, color: colors.textMuted, cursor: "pointer",
        },
        btnActive: {
            backgroundColor: "#6EC3F4", borderColor: "#6EC3F4", color: "#fff",
        },
        sortWrapper: { position: "relative" },
        sortBtn: {
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", fontSize: "13px", border: `1px solid ${colors.border}`,
            borderRadius: "20px", backgroundColor: colors.cardBg, color: colors.textMuted, cursor: "pointer",
        },
        sortBtnActive: {
            backgroundColor: "#6EC3F4", borderColor: "#6EC3F4", color: "#fff",
        },
        dropdown: {
            position: "absolute", top: "calc(100% + 6px)", right: 0,
            backgroundColor: colors.cardBg, border: `1px solid ${colors.border}`,
            borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            minWidth: "180px", zIndex: 50, overflow: "hidden",
        },
        option: {
            display: "block", width: "100%", textAlign: "left",
            padding: "10px 14px", fontSize: "13px", border: "none",
            backgroundColor: "transparent", color: colors.text, cursor: "pointer",
        },
        optionActive: { color: "#2E7BC4", fontWeight: "600" },
        overlay: { position: "fixed", inset: 0, zIndex: 40 },
    };

    return (
        <div style={styles.bar}>
            <div style={styles.tabGroup}>
                {TAB_FILTERS.map((f) => (
                    <button
                        key={f.key}
                        type="button"
                        onClick={() => onChange(f.key)}
                        style={{ ...styles.btn, ...(current === f.key ? styles.btnActive : {}) }}
                    >
                        {t(f.labelKey)}
                    </button>
                ))}
            </div>

            <div style={styles.sortWrapper}>
                <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    style={{ ...styles.sortBtn, ...(isSortActive ? styles.sortBtnActive : {}) }}
                >
                    {t("filterSort")}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 20V4M8 4L4 8M8 4l4 4" />
                        <path d="M16 4v16M16 20l4-4M16 20l-4-4" />
                    </svg>
                </button>

                {sortOpen && (
                    <>
                        <div style={styles.overlay} onClick={() => setSortOpen(false)} />
                        <div style={styles.dropdown}>
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.key}
                                    type="button"
                                    style={{
                                        ...styles.option,
                                        ...(isSortActive && sortMode === opt.key ? styles.optionActive : {}),
                                    }}
                                    onClick={() => handlePickSort(opt.key)}
                                >
                                    {t(opt.labelKey)}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}