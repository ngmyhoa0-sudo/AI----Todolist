import api from "./api";

export const login = async (data) => {
  const response = await api.post("/auth/login", data);
  if (response.data?.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response;
};

export const register = (data) => api.post("/auth/register", data);

export const forgotPassword = (email) => 
  api.post("/auth/forgot-password", { email });

export const resetPassword = (data) => 
  api.post("/auth/reset-password", data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
export const guestLogin = async () => {
    const response = await api.post("/auth/guest");
    if (response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
    }
    return response;
};