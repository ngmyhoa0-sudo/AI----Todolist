import { createContext, useContext, useState } from "react";

const translations = {
    vi: {
        // Nav / tiêu đề trang
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

        // Đăng nhập / Đăng ký
        loginTagline: "Quản lý công việc thông minh hơn",
        loginTab: "Đăng nhập",
        registerTab: "Đăng ký",
        emailLabel: "Email",
        passwordLabel: "Mật khẩu",
        confirmPasswordLabel: "Xác nhận mật khẩu",
        forgotPasswordLink: "Quên mật khẩu?",
        passwordMismatch: "Mật khẩu xác nhận không khớp.",
        registerSuccess: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.",
        processing: "Đang xử lý...",
        createAccountBtn: "Tạo tài khoản",
        loginSubmitBtn: "Đăng nhập",
        noAccountPrompt: "Không muốn đăng ký? ",
        guestLoginBtn: "Dùng thử với tư cách khách",

        // Quên mật khẩu
        fpTaglineEmail: "Nhập email để nhận mã OTP",
        fpTaglineOtp: "Nhập mã OTP và mật khẩu mới",
        fpStep1Label: "Nhập email",
        fpStep2Label: "Đặt lại mật khẩu",
        otpSentMsg: "Mã OTP đã được gửi đến email của bạn.",
        sendingOtp: "Đang gửi...",
        sendOtpBtn: "Gửi mã OTP",
        otpLabel: "Mã OTP",
        otpPlaceholder: "Nhập mã OTP từ email",
        newPasswordLabel: "Mật khẩu mới",
        confirmNewPasswordLabel: "Xác nhận mật khẩu mới",
        resetPasswordBtn: "Đặt lại mật khẩu",
        resetSuccessMsg: "Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...",
        resendPrompt: "Không nhận được mã? ",
        resendBtn: "Gửi lại",
        backToLogin: "← Quay lại đăng nhập",

        // Chung
        loadingText: "Đang tải...",

        // Việc cần làm
        guestModeBadge: "Chế độ khách",
        normalTab: "Thường",
        aiTab: "AI",
        taskNamePlaceholder: "Nhập tên task...",
        aiTaskPlaceholder: "Ví dụ: Họp nhóm lúc 3 giờ chiều mai",
        adding: "Đang thêm...",
        addBtn: "Thêm",
        taskNameRequired: "Vui lòng nhập tên task",
        todayOpt: "Hôm nay",
        tomorrowOpt: "Ngày mai",
        weekendOpt: "Cuối tuần này",
        nextWeekOpt: "Tuần sau",
        specificDateLabel: "Ngày & giờ cụ thể (tuỳ chọn)",
        timeCaption: "Giờ",
        repeatLabel: "Lặp lại",
        repeatNone: "Không lặp lại",
        repeatDaily: "Mỗi ngày",
        repeatWeekday: "Mỗi ngày trong tuần (Thứ 2 - Thứ 6)",
        repeatWeekly: "Hàng tuần (cùng thứ)",
        repeatMonthly: "Hàng tháng (cùng ngày)",
        repeatYearly: "Hàng năm (cùng ngày)",
        filterActive: "Đang làm",
        filterDone: "Đã xong",
        filterAll: "Tất cả",
        filterSort: "Sắp xếp",
        sortDeadlineAsc: "Hạn gần nhất",
        sortDeadlineDesc: "Hạn xa nhất",
        sortNewest: "Mới thêm",
        deleteBtn: "Xóa",
        editBtn: "Sửa",
        saveBtn: "Lưu",
        editTaskTitle: "Sửa công việc",
        deleteConfirmText: "Bạn có chắc chắn muốn xoá task này không?",
        cancelBtn: "Huỷ",
        confirmBtn: "Xác nhận",
        emptyTasksMsg: "Chưa có task nào. Thêm task mới ở trên nhé!",
        overduePrefix: "Đã quá hạn: ",
        dueSoonPrefix: "Sắp đến hạn: ",

        // Lịch
        noTaskThisDay: "Không có task nào vào ngày này.",
        weekdaysShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        dateLocale: "vi-VN",

        // Thống kê
        distributionTab: "Phân bổ",
        trendTab: "Xu hướng",
        totalTasks: "Tổng task",
        completedTasks: "Hoàn thành",
        activeTasks: "Đang làm",
        overdueTasks: "Quá hạn",
        loadingStats: "Đang tải thống kê...",
        completedTasksChartTitle: "Task hoàn thành",
        weekRange: "Tuần",
        monthRange: "Tháng",
        thisWeek: "Tuần này",
        thisMonth: "Tháng này",
        thisYear: "Năm nay",
        yearLabel: "Năm",
        chooseTimeRangeTitle: "Chọn thời gian hiển thị",
        clearFilterBtn: "Xoá bộ lọc",
        applyBtn: "Áp dụng",
        statusRatioTitle: "Tỉ lệ trạng thái task",
        noDataMsg: "Chưa có dữ liệu để hiển thị",
        monthsShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],

        // Tài khoản
        customizeLabel: "Tuỳ chỉnh",
        themeLabel: "Giao diện",
        themeLight: "Sáng",
        themeDark: "Tối",
        languageVi: "Tiếng Việt",
        languageEn: "English",

        // Chat AI
        aiAssistant: "Trợ lý AI",
        askAiPlaceholder: "Hỏi AI về task của bạn...",
        aiThinking: "Đang trả lời...",
        chatInputPlaceholder: "Nhập câu hỏi...",
        sendBtn: "Gửi",
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

        loginTagline: "Manage your tasks smarter",
        loginTab: "Log In",
        registerTab: "Register",
        emailLabel: "Email",
        passwordLabel: "Password",
        confirmPasswordLabel: "Confirm Password",
        forgotPasswordLink: "Forgot password?",
        passwordMismatch: "Confirm password does not match.",
        registerSuccess: "Registration successful! Please check your email to confirm.",
        processing: "Processing...",
        createAccountBtn: "Create Account",
        loginSubmitBtn: "Log In",
        noAccountPrompt: "Don't want to register? ",
        guestLoginBtn: "Try as a guest",

        fpTaglineEmail: "Enter your email to receive an OTP",
        fpTaglineOtp: "Enter the OTP and new password",
        fpStep1Label: "Enter email",
        fpStep2Label: "Reset password",
        otpSentMsg: "An OTP code has been sent to your email.",
        sendingOtp: "Sending...",
        sendOtpBtn: "Send OTP",
        otpLabel: "OTP Code",
        otpPlaceholder: "Enter the OTP from your email",
        newPasswordLabel: "New Password",
        confirmNewPasswordLabel: "Confirm New Password",
        resetPasswordBtn: "Reset Password",
        resetSuccessMsg: "Password reset successful! Redirecting to login...",
        resendPrompt: "Didn't receive the code? ",
        resendBtn: "Resend",
        backToLogin: "← Back to login",

        loadingText: "Loading...",

        guestModeBadge: "Guest mode",
        normalTab: "Normal",
        aiTab: "AI",
        taskNamePlaceholder: "Enter task name...",
        aiTaskPlaceholder: "e.g: Team meeting at 3pm tomorrow",
        adding: "Adding...",
        addBtn: "Add",
        taskNameRequired: "Please enter a task name",
        todayOpt: "Today",
        tomorrowOpt: "Tomorrow",
        weekendOpt: "This weekend",
        nextWeekOpt: "Next week",
        specificDateLabel: "Specific date & time (optional)",
        timeCaption: "Time",
        repeatLabel: "Repeat",
        repeatNone: "Do not repeat",
        repeatDaily: "Daily",
        repeatWeekday: "Weekdays (Mon - Fri)",
        repeatWeekly: "Weekly (same day)",
        repeatMonthly: "Monthly (same date)",
        repeatYearly: "Yearly (same date)",
        filterActive: "In progress",
        filterDone: "Done",
        filterAll: "All",
        filterSort: "Sort",
        sortDeadlineAsc: "Deadline: soonest",
        sortDeadlineDesc: "Deadline: latest",
        sortNewest: "Recently added",
        deleteBtn: "Delete",
        editBtn: "Edit",
        saveBtn: "Save",
        editTaskTitle: "Edit task",
        deleteConfirmText: "Are you sure you want to delete this task?",
        cancelBtn: "Cancel",
        confirmBtn: "Confirm",
        emptyTasksMsg: "No tasks yet. Add a new task above!",
        overduePrefix: "Overdue: ",
        dueSoonPrefix: "Due soon: ",

        noTaskThisDay: "No tasks on this day.",
        weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dateLocale: "en-US",

        distributionTab: "Distribution",
        trendTab: "Trend",
        totalTasks: "Total tasks",
        completedTasks: "Completed",
        activeTasks: "In progress",
        overdueTasks: "Overdue",
        loadingStats: "Loading stats...",
        completedTasksChartTitle: "Completed tasks",
        weekRange: "Week",
        monthRange: "Month",
        thisWeek: "This week",
        thisMonth: "This month",
        thisYear: "This year",
        yearLabel: "Year",
        chooseTimeRangeTitle: "Select time range",
        clearFilterBtn: "Clear filter",
        applyBtn: "Apply",
        statusRatioTitle: "Task status ratio",
        noDataMsg: "No data to display",
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],

        customizeLabel: "Customize",
        themeLabel: "Theme",
        themeLight: "Light",
        themeDark: "Dark",
        languageVi: "Tiếng Việt",
        languageEn: "English",

        aiAssistant: "AI Assistant",
        askAiPlaceholder: "Ask AI about your tasks...",
        aiThinking: "Answering...",
        chatInputPlaceholder: "Type a question...",
        sendBtn: "Send",
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