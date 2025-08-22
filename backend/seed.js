const bcrypt = require('bcrypt');
const db = require('./config/db');
const seedOptions = require('./utils/seed-options');


const seedAdmin = async () => {
    try {
        // First seed the options data
        await seedOptions();

        const existingAdmin = await db.user.findFirst({
            where: { roles: { has: 'Admin' } },
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Get default options for admin user
        const itDepartment = await db.department.findFirst({ where: { name: 'IT Department' } });
        const mastersDegree = await db.education.findFirst({ where: { name: 'Master\'s Degree' } });
        const itSpecialist = await db.profession.findFirst({ where: { name: 'IT Specialist' } });

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create admin user
        await db.user.create({
            data: {
                employeeId: 'EMP001',
                fullName: 'Super Admin',
                departmentId: itDepartment?.id,
                email: 'admin@admin.com',
                educationId: mastersDegree?.id,
                professionId: itSpecialist?.id,
                password: hashedPassword,
                roles: ['Admin', 'ScannerClerk', 'Approver', 'Uploader'],
                isActive: true,
                isSelfRegistered: false,
                registrationStatus: 'Approved',
            },
        });
        console.log('Admin user created successfully');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        await db.$disconnect();
    }
};

module.exports = seedAdmin;