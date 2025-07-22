import axiosInstance from './axios-instance';

export const registerUser = (data) => axiosInstance.post('/user/register', data);
export const selfRegister = (data) => {
    console.log('Self-registering with data:', data);
    axiosInstance.post('/user/self-register', data)

};
export const reviewSelfRegistration = (data) => axiosInstance.post('/user/review-registration', data);
export const toggleUserStatus = (userId, data) => axiosInstance.put(`/user/status/${userId}`, data);
export const updateUserRoles = (userId, data) => axiosInstance.put(`/user/roles/${userId}`, data);
export const getUsers = () => axiosInstance.get('/user');
export const updateUser = (userId, data) => axiosInstance.put(`/user/${userId}`, data);