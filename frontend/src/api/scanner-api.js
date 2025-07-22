import axiosInstance from "./axios-instance";

export const getAllMyScannedDocs = () => axiosInstance.get('/clerk/clerkDocs');
export const deleteScannedDoc = (docId) => axiosInstance.get('/clerk/deleteDoc/' + docId); 
