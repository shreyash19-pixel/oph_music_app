import axios from "axios";

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  // baseURL : "http://localhost:3000/api/",
});

// Add request interceptor to include auth token
axiosApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.code;
    if (error.response?.status === 401 && code === "SESSION_STALE") {
      localStorage.removeItem("token");
      window.location.assign("/");
    }
    return Promise.reject(error);
  }
);

export default axiosApi;