import axios from "axios";

// Create Axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to manually set/remove token
export const setAuthToken = (token) => {
  console.log("Setting Auth Token in defaults:", token ? "Token present" : "Token cleared");
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Request Interceptor
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    console.log("Request interceptor - URL:", req.url, "Token in storage:", token ? "Present" : "Missing");

    // Don't overwrite if it's already set (e.g. by setAuthToken right before)
    if (token && !req.headers.Authorization) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isAuthRequest = originalRequest.url.includes("/auth/login") ||
      originalRequest.url.includes("/auth/refresh-token") ||
      originalRequest.url.includes("/auth/register");

    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      console.warn("401 error detected. Attempting token refresh...");

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          console.error("No refresh token found in storage. Redirecting to login.");
          throw new Error("No refresh token stored");
        }

        // Use relative path with Axios instance base URL to ensure it works anywhere
        const res = await axios.post(`${API.defaults.baseURL}/auth/refresh-token`, {
          refreshToken
        });

        if (res.status === 200) {
          console.log("Token refresh successful.");
          const { accessToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem("token", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          setAuthToken(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.error("Critical: Token refresh failed.", refreshError.message);

        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setAuthToken(null);

        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default API;