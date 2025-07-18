import axiosInstance from './axios-instance';

export const login = (data) => axiosInstance.post('/auth/login', data);
export const logout = () => axiosInstance.post('/auth/logout');
export const requestPasswordReset = (data) => axiosInstance.post('/auth/password-reset', data);
export const resetPassword = (token, data) => axiosInstance.post(`/auth/password-reset/${token}`, data);