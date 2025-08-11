import axiosInstance from "./axios-instance";

export const getAllDocuments = ({
    page = 1,
    limit = 10,
    status = "",
    patientMRN = "",
    employeeId = "",
    startDate = "",
    endDate = ""
} = {}) => {
    return axiosInstance.get("/admin/documents", {
        params: {
            page,
            limit,
            ...(status && { status }),
            ...(patientMRN && { patientMRN }),
            ...(employeeId && { employeeId }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
        },
    });
};

export const getAllScanners = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/admin/scanners', { params: { page, limit } });

export const getAllApprovers = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/admin/approvers', { params: { page, limit } });

export const getAllUploaders = ({ page = 1, limit = 10 } = {}) =>
    axiosInstance.get('/admin/uploaders', { params: { page, limit } });
