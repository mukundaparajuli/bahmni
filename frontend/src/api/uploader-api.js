import axiosInstance from "./axios-instance";

export const getAllApprovedDocuments = ({ page = 1, limit = 10 } = {}) => axiosInstance.get('/uploader/approved-docs', { params: { page, limit } });
export const uploadToBahmni = (data) => axiosInstance.post('/uploader/upload-to-bahmni', data);
