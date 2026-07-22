import api from "./api";

export const getTimezone = () => api.get("/settings/timezone");
export const updateTimezone = (timezone) => api.put("/settings/timezone", { timezone });