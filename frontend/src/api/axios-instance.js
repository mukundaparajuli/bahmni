import axios from 'axios';

// Proper fallback for baseURL
const base = import.meta.env.VITE_API_URL || 'https://192.168.56.1:5555'; // fallback IP

const axiosInstance = axios.create({
    baseURL: `${base}/api/v1`,
});

// Set Content-Type only for non-file requests
axiosInstance.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    } else {
        delete config.headers['Content-Type']; // Let browser set for FormData
    }
    return config;
});

// Attach token if present
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 unauthorized
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {

            const currentPath = window.location.pathname;
            const isLoginPage = currentPath === '/login' || currentPath === '/';


            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!isLoginPage) {
                (window.location.href = '/login');
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;