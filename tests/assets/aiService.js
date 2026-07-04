import api from "./api";

export const askAI = (message) => 
  api.post("/ai/chat", { message });

export const parseTask = (text) => 
  api.post("/ai/parse-task", { text });
