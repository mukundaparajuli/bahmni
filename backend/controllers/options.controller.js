const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
const { ApiResponse } = require('../utils/api-response');
const asyncHandler = require('../middleware/async-handler');

// =============== EDUCATION CONTROLLERS ===============

// Get all education options
exports.getEducations = asyncHandler(async (req, res) => {
    const educations = await db.education.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    ApiResponse(res, 200, educations, 'Education options retrieved successfully');
});

// Get all education options (including inactive) - Admin only
exports.getAllEducations = asyncHandler(async (req, res) => {
    const educations = await db.education.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });

    ApiResponse(res, 200, educations, 'All education options retrieved successfully');
});

// Create new education option
exports.createEducation = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        const error = new Error('Education name is required');
        error.statusCode = 400;
        throw error;
    }

    const education = await db.education.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null
        }
    });

    ApiResponse(res, 201, education, 'Education option created successfully');
});

// Update education option
exports.updateEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const education = await db.education.update({
        where: { id: parseInt(id) },
        data: {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() || null }),
            ...(isActive !== undefined && { isActive })
        }
    });

    ApiResponse(res, 200, education, 'Education option updated successfully');
});

// Delete education option
exports.deleteEducation = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if education is being used by any users
    const usersCount = await db.user.count({
        where: { educationId: parseInt(id) }
    });

    if (usersCount > 0) {
        const error = new Error(`Cannot delete education option. It is being used by ${usersCount} user(s)`);
        error.statusCode = 400;
        throw error;
    }

    await db.education.delete({
        where: { id: parseInt(id) }
    });

    ApiResponse(res, 200, null, 'Education option deleted successfully');
});

// =============== PROFESSION CONTROLLERS ===============

// Get all profession options
exports.getProfessions = asyncHandler(async (req, res) => {
    const professions = await db.profession.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    ApiResponse(res, 200, professions, 'Profession options retrieved successfully');
});

// Get all profession options (including inactive) - Admin only
exports.getAllProfessions = asyncHandler(async (req, res) => {
    const professions = await db.profession.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });

    ApiResponse(res, 200, professions, 'All profession options retrieved successfully');
});

// Create new profession option
exports.createProfession = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        const error = new Error('Profession name is required');
        error.statusCode = 400;
        throw error;
    }

    const profession = await db.profession.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null
        }
    });

    ApiResponse(res, 201, profession, 'Profession option created successfully');
});

// Update profession option
exports.updateProfession = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const profession = await db.profession.update({
        where: { id: parseInt(id) },
        data: {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() || null }),
            ...(isActive !== undefined && { isActive })
        }
    });

    ApiResponse(res, 200, profession, 'Profession option updated successfully');
});

// Delete profession option
exports.deleteProfession = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if profession is being used by any users
    const usersCount = await db.user.count({
        where: { professionId: parseInt(id) }
    });

    if (usersCount > 0) {
        const error = new Error(`Cannot delete profession option. It is being used by ${usersCount} user(s)`);
        error.statusCode = 400;
        throw error;
    }

    await db.profession.delete({
        where: { id: parseInt(id) }
    });

    ApiResponse(res, 200, null, 'Profession option deleted successfully');
});

// =============== DEPARTMENT CONTROLLERS ===============

// Get all department options
exports.getDepartments = asyncHandler(async (req, res) => {
    const departments = await db.department.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    ApiResponse(res, 200, departments, 'Department options retrieved successfully');
});

// Get all department options (including inactive) - Admin only
exports.getAllDepartments = asyncHandler(async (req, res) => {
    const departments = await db.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { users: true }
            }
        }
    });

    ApiResponse(res, 200, departments, 'All department options retrieved successfully');
});

// Create new department option
exports.createDepartment = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        const error = new Error('Department name is required');
        error.statusCode = 400;
        throw error;
    }

    const department = await db.department.create({
        data: {
            name: name.trim(),
            description: description?.trim() || null
        }
    });

    ApiResponse(res, 201, department, 'Department option created successfully');
});

// Update department option
exports.updateDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const department = await db.department.update({
        where: { id: parseInt(id) },
        data: {
            ...(name && { name: name.trim() }),
            ...(description !== undefined && { description: description?.trim() || null }),
            ...(isActive !== undefined && { isActive })
        }
    });

    ApiResponse(res, 200, department, 'Department option updated successfully');
});

// Delete department option
exports.deleteDepartment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if department is being used by any users
    const usersCount = await db.user.count({
        where: { departmentId: parseInt(id) }
    });

    if (usersCount > 0) {
        const error = new Error(`Cannot delete department option. It is being used by ${usersCount} user(s)`);
        error.statusCode = 400;
        throw error;
    }

    await db.department.delete({
        where: { id: parseInt(id) }
    });

    ApiResponse(res, 200, null, 'Department option deleted successfully');
});