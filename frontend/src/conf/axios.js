import axios from "axios";

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL : "http://localhost:3000/api/",
  // baseURL: import.meta.env.VITE_API_URL+'/api',
});

// Attach Bearer token when missing — avoids 401 when React context `headers` is null
// (e.g. FormData posts that only set Content-Type and spread null headers).
axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (
    token &&
    token !== "undefined" &&
    token !== "null"
  ) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosApi;