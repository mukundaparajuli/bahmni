import axiosInstance from "./axios-instance";

export const getScannedDocuments = () => axiosInstance.get('/approver/scannedDocs');
export const getAllMyApprovedDocuments = () => axiosInstance.get('/approver/approvedDocs');
export const getAllMyRejectedDocuments = () => axiosInstance.get('/approver/rejectedDocs');
export const approveDocument = (id) => axiosInstance.post(`/approver/approve/${id}`);
export const rejectDocument = (id, data) => axiosInstance.post(`/approver/reject/${id}`, data); 
