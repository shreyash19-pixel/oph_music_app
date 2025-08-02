import axios from 'axios';

const axiosApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    
    // baseURL : "http://localhost:3000/api/",
    withCredentials: true
})
export default axiosApi;