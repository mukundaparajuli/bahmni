import axiosInstance from "./axios-instance";

export const getScannedDocuments = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/approver/scannedDocs', { params: { page, limit } });

export const getAllMyApprovedDocuments = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/approver/approvedDocs', { params: { page, limit } });

export const getAllMyRejectedDocuments = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/approver/rejectedDocs', { params: { page, limit } });

export const approveDocument = (id) =>
    axiosInstance.post(`/approver/approve/${id}`);

export const rejectDocument = (id, data) =>
    axiosInstance.post(`/approver/reject/${id}`, data);

export const searchDocuments = ({ query, page = 1, limit = 10 }) =>
    axiosInstance.get(`/approver/search`, { params: { query, page, limit } });
