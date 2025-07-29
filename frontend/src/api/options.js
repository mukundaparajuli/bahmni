import axiosInstance from './axios-instance';

// =============== EDUCATION API ===============

export const getEducations = async () => {
    try {
        const response = await axiosInstance.get('/options/educations');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching educations:', error);
        throw error;
    }
};

export const getAllEducations = async () => {
    try {
        const response = await axiosInstance.get('/options/educations/all');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all educations:', error);
        throw error;
    }
};

export const createEducation = async (data) => {
    try {
        const response = await axiosInstance.post('/options/educations', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating education:', error);
        throw error;
    }
};

export const updateEducation = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/options/educations/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating education:', error);
        throw error;
    }
};

export const deleteEducation = async (id) => {
    try {
        const response = await axiosInstance.delete(`/options/educations/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting education:', error);
        throw error;
    }
};

// =============== PROFESSION API ===============

export const getProfessions = async () => {
    try {
        const response = await axiosInstance.get('/options/professions');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching professions:', error);
        throw error;
    }
};

export const getAllProfessions = async () => {
    try {
        const response = await axiosInstance.get('/options/professions/all');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all professions:', error);
        throw error;
    }
};

export const createProfession = async (data) => {
    try {
        const response = await axiosInstance.post('/options/professions', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating profession:', error);
        throw error;
    }
};

export const updateProfession = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/options/professions/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating profession:', error);
        throw error;
    }
};

export const deleteProfession = async (id) => {
    try {
        const response = await axiosInstance.delete(`/options/professions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting profession:', error);
        throw error;
    }
};

// =============== DEPARTMENT API ===============

export const getDepartments = async () => {
    try {
        const response = await axiosInstance.get('/options/departments');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching departments:', error);
        throw error;
    }
};

export const getAllDepartments = async () => {
    try {
        const response = await axiosInstance.get('/options/departments/all');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching all departments:', error);
        throw error;
    }
};

export const createDepartment = async (data) => {
    try {
        const response = await axiosInstance.post('/options/departments', data);
        return response.data.data;
    } catch (error) {
        console.error('Error creating department:', error);
        throw error;
    }
};

export const updateDepartment = async (id, data) => {
    try {
        const response = await axiosInstance.put(`/options/departments/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error('Error updating department:', error);
        throw error;
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await axiosInstance.delete(`/options/departments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting department:', error);
        throw error;
    }
};