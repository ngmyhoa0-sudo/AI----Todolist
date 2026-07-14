import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 30000,
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

// Các endpoint xác thực công khai (chưa cần đăng nhập) — 401 từ những endpoint này
// (vd sai email/mật khẩu) không phải dấu hiệu "phiên hết hạn", nên KHÔNG được kích hoạt
// luồng tự refresh token (nếu không, token cũ/hỏng còn sót trong localStorage sẽ khiến
// interceptor âm thầm thử refresh, làm lộ nhầm lỗi "phiên hết hạn" thay vì lỗi thật)
const PUBLIC_AUTH_PATHS = [
    "/auth/login",
    "/auth/register",
    "/auth/guest",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
];

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.code === "ECONNABORTED" && error.message?.includes("timeout")) {
            error.message = "Yêu cầu quá thời gian chờ, vui lòng thử lại.";
            return Promise.reject(error);
        }

        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            PUBLIC_AUTH_PATHS.some((path) => originalRequest.url?.includes(path))
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