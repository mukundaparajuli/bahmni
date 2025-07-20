import axiosInstance from './axios-instance';
export const upload = async (data) => await axiosInstance.post('/doc/uploadDocument', data);