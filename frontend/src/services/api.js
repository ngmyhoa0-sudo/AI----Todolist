import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let isRefreshing = false;
let pendingRequests = [];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url === "/auth/refresh"
        ) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingRequests.push({ resolve, reject, originalRequest });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) throw new Error("Không có refresh token");

            const res = await api.post("/auth/refresh", { refresh_token: refreshToken });
            const newToken = res.data.access_token;
            localStorage.setItem("token", newToken);
            if (res.data.refresh_token) {
                localStorage.setItem("refresh_token", res.data.refresh_token);
            }

            pendingRequests.forEach(({ resolve, originalRequest: req }) => {
                req.headers.Authorization = `Bearer ${newToken}`;
                resolve(api(req));
            });
            pendingRequests = [];

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            pendingRequests.forEach(({ reject }) => reject(refreshError));
            pendingRequests = [];
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;