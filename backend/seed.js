const bcrypt = require('bcrypt');
const db = require('./config/db');

const seedAdmin = async () => {
    try {
        const existingAdmin = await db.user.findFirst({
            where: { roles: { has: 'Admin' } },
        });

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('password', 10);

        // Create admin user
        await db.user.create({
            data: {
                employeeId: 'EMP001',
                fullName: 'Super Admin',
                department: 'IT',
                email: 'admin@admin.com',
                education: 'M.Tech',
                profession: 'System Administrator',
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