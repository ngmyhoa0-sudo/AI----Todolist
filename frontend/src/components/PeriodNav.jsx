import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../theme";
import PeriodPickerModal from "./PeriodPickerModal";

// PeriodNav chỉ làm 1 việc: hiển thị điều hướng lùi/tiến + mở modal chọn kỳ, dùng chung cho StatsChart/StatsDonut
export default function PeriodNav({ range, onRangeChange, offset, onOffsetChange, periodLabel }) {
    const { theme } = useTheme();
    const colors = THEMES[theme];
    const [pickerOpen, setPickerOpen] = useState(false);

    const handleApply = (newRange, newOffset) => {
        onRangeChange(newRange);
        onOffsetChange(newOffset);
    };

    const styles = {
        navRow: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "16px",
        },
        navBtn: {
            background: "none",
            border: "none",
            fontSize: "16px",
            color: colors.textMuted,
            cursor: "pointer",
            padding: "2px 6px",
        },
        navLabel: {
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
            fontWeight: "600",
            color: colors.text,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: "8px",
            outline: "none",
        },
    };

    return (
        <div style={styles.navRow}>
            <button type="button" style={styles.navBtn} onClick={() => onOffsetChange(offset - 1)}>
                ‹
            </button>
            <button type="button" style={styles.navLabel} onClick={() => setPickerOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {periodLabel}
            </button>
            <button
                type="button"
                style={{ ...styles.navBtn, ...(offset >= 0 ? { opacity: 0.3, cursor: "default" } : {}) }}
                onClick={() => offset < 0 && onOffsetChange(offset + 1)}
                disabled={offset >= 0}
            >
                ›
            </button>

            {pickerOpen && (
                <PeriodPickerModal
                    range={range}
                    offset={offset}
                    onApply={handleApply}
                    onClose={() => setPickerOpen(false)}
                />
            )}
        </div>
    );
}