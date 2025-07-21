import axiosInstance from "./axios-instance";

export const getAllMyScannedDocs = () => axiosInstance.get('/clerk/clerkDocs');