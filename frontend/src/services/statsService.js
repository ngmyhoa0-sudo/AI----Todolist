import api from "./api";

export const getStats = () => api.get("/stats");
export const getPeriodStatus = (range, offset = 0) => api.get(`/stats/period-status?range=${range}&offset=${offset}`);
export const getCompletedByDay = (offset = 0) => api.get(`/stats/completed-by-day?offset=${offset}`);
export const getCompletedByMonthDays = (offset = 0) => api.get(`/stats/completed-by-month-days?offset=${offset}`);
export const getCompletedByMonth = (offset = 0) => api.get(`/stats/completed-by-month?offset=${offset}`);
export const getActivitySummary = () => api.get("/stats/activity-summary");