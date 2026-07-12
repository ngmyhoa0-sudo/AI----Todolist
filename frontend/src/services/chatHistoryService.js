import api from "./api";

export const getChatHistory = () => api.get("/chat/history");