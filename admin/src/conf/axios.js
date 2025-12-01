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

export default axiosApi;