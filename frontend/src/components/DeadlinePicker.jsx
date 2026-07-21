import { useState, useRef, useEffect, forwardRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale/vi";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { THEMES } from "../theme";

registerLocale("vi", vi);

function stringToDate(str) {
    if (!str) return null;
    return new Date(str);
}

function dateToString(date) {
    if (!date) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Nút hiển thị ngày giờ đã chọn, dùng để thay input datetime-local gốc
const DateInput = forwardRef(({ value, onClick, placeholder, style }, ref) => (
    <button
        type="button"
        ref={ref}
        onClick={onClick}
        style={{
            ...style,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            fontFamily: "inherit",
            textAlign: "left",
            width: "100%",
            display: "block",
        }}
    >
        {value || placeholder}
    </button>
));

// 2 cột giờ/phút cuộn riêng, xếp bên cạnh lịch giống kiểu native
function CustomTimeInput({ value, onChange, colors }) {
    const [h, m] = (value || "00:00").split(":");
    const hour = parseInt(h, 10) || 0;
    const minute = parseInt(m, 10) || 0;
    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    useEffect(() => {
        hourRef.current?.scrollIntoView({ block: "center" });
        minuteRef.current?.scrollIntoView({ block: "center" });
    }, []);

    const pad = (n) => String(n).padStart(2, "0");
    const emitHour = (newHour) => onChange(`${pad(newHour)}:${pad(minute)}`);
    const emitMinute = (newMinute) => onChange(`${pad(hour)}:${pad(newMinute)}`);

    const columnStyle = {
        maxHeight: "200px",
        overflowY: "auto",
        width: "50px",
    };
    const itemStyle = (active) => ({
        padding: "6px 0",
        textAlign: "center",
        fontSize: "13px",
        cursor: "pointer",
        borderRadius: "4px",
        backgroundColor: active ? "#6EC3F4" : "transparent",
        color: active ? "#fff" : colors.text,
    });

    return (
        <div style={{ display: "flex", gap: "4px", padding: "10px", borderLeft: `1px solid ${colors.border}`, height: "100%" }}>
            <div className="time-scroll-col" style={columnStyle}>
                {Array.from({ length: 24 }, (_, i) => (
                    <div
                        key={i}
                        ref={i === hour ? hourRef : null}
                        style={itemStyle(i === hour)}
                        onClick={() => emitHour(i)}
                    >
                        {pad(i)}
                    </div>
                ))}
            </div>
            <div className="time-scroll-col" style={columnStyle}>
                {Array.from({ length: 60 }, (_, i) => (
                    <div
                        key={i}
                        ref={i === minute ? minuteRef : null}
                        style={itemStyle(i === minute)}
                        onClick={() => emitMinute(i)}
                    >
                        {pad(i)}
                    </div>
                ))}
            </div>
        </div>
    );
}

// DeadlinePicker chỉ làm 1 việc: chọn ngày giờ deadline, chỉ áp dụng khi bấm Xác nhận
export default function DeadlinePicker({ value, onChange, placeholder }) {
    const { theme } = useTheme();
    const { t, language } = useLanguage();
    const colors = THEMES[theme];
    const [draft, setDraft] = useState(value);
    const pickerRef = useRef(null);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    const handleConfirm = () => {
        onChange(draft);
        pickerRef.current?.setOpen(false);
    };

    const handleCancel = () => {
        setDraft(value);
        pickerRef.current?.setOpen(false);
    };

    const styles = {
        deadlineInput: {
            padding: "8px 12px", border: `1px solid ${colors.border}`,
            borderRadius: "7px", fontSize: "13px", color: colors.text,
            outline: "none", backgroundColor: colors.inputBg, textAlign: "left",
            alignSelf: "flex-start", cursor: "pointer", minWidth: "180px",
        },
        pickerFooter: {
            display: "flex",
            gap: "8px",
            padding: "10px",
            borderTop: `1px solid ${colors.border}`,
        },
        pickerCancelBtn: {
            flex: 1,
            padding: "8px",
            borderRadius: "7px",
            border: "none",
            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            color: colors.text,
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
        },
        pickerConfirmBtn: {
            flex: 1,
            padding: "8px",
            borderRadius: "7px",
            border: "none",
            backgroundColor: "#d7ecfb",
            color: "#1a2b4c",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
        },
    };

    return (
        <DatePicker
            ref={pickerRef}
            selected={stringToDate(draft)}
            onChange={(date) => setDraft(dateToString(date))}
            onCalendarOpen={() => setDraft(value)}
            shouldCloseOnSelect={false}
            showTimeInput
            timeCaption={t("timeCaption")}
            customTimeInput={<CustomTimeInput colors={colors} />}
            dateFormat="dd/MM/yyyy HH:mm"
            placeholderText={placeholder ?? t("specificDateLabel")}
            locale={language === "vi" ? "vi" : "en-US"}
            calendarClassName={theme === "dark" ? "app-datepicker-dark" : ""}
            customInput={<DateInput style={styles.deadlineInput} />}
        >
            <div style={styles.pickerFooter}>
                <button type="button" style={styles.pickerCancelBtn} onClick={handleCancel}>
                    {t("cancelBtn")}
                </button>
                <button type="button" style={styles.pickerConfirmBtn} onClick={handleConfirm}>
                    {t("confirmBtn")}
                </button>
            </div>
        </DatePicker>
    );
}