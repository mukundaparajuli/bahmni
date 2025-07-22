import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api/v1` || 'http://localhost:5000/api/v1',
});

// Set Content-Type only for non-file requests
axiosInstance.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    } else {
        // Let the browser set Content-Type (with boundary) for FormData
        delete config.headers['Content-Type'];
    }
    return config;
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;