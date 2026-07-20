import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

// FilterBar chỉ làm 1 việc: hiển thị thanh lọc và báo lựa chọn ra ngoài qua onChange
const FILTERS = [
    { key: "active", labelKey: "filterActive" },
    { key: "done", labelKey: "filterDone" },
    { key: "all", labelKey: "filterAll" },
    { key: "deadline", labelKey: "filterSort" },
];

export default function FilterBar({ current, onChange }) {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const colors = THEMES[theme];

    const styles = {
        bar: {
            display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap",
        },
        btn: {
            padding: "6px 14px", fontSize: "13px", border: `1px solid ${colors.border}`,
            borderRadius: "20px", backgroundColor: colors.cardBg, color: colors.textMuted, cursor: "pointer",
        },
        btnActive: {
            backgroundColor: "#6EC3F4", borderColor: "#6EC3F4", color: "#fff",
        },
    };

    return (
        <div style={styles.bar}>
            {FILTERS.map((f) => (
                <button
                    key={f.key}
                    type="button"
                    onClick={() => onChange(f.key)}
                    style={{
                        ...styles.btn,
                        ...(current === f.key ? styles.btnActive : {}),
                    }}
                >
                    {t(f.labelKey)}
                </button>
            ))}
        </div>
    );
}