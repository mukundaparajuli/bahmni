import axiosInstance from "./axios-instance";

export const getAllMyScannedDocs = ({ page, limit }) => axiosInstance.get(`/clerk/clerkDocs?page=${page}&limit=${limit}`);
export const deleteScannedDoc = (docId) => axiosInstance.get('/clerk/deleteDoc/' + docId);
export const searchClerkDocuments = ({ searchTerm, page, limit }) => axiosInstance.get(`/clerk/search?query=${searchTerm}&page=${page}&limit=${limit}`);
export const updateStatus = (id) => axiosInstance.post('/clerk/updateStatus', { id });