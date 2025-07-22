const User = require('./models/user'); // no need for mongoose or dotenv here

const seedAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ roles: 'Admin' });
        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const adminUser = new User({
            employeeId: "EMP001",
            fullName: "Super Admin",
            department: "IT",
            email: "admin@example.com",
            education: "M.Tech",
            profession: "System Administrator",
            password: "AdminPass123",
            roles: ["Admin", "ScannerClerk", "Approver", "Uploader"],
            isActive: true,
            isSelfRegistered: false,
            registrationStatus: "Approved"
        });

        await adminUser.save();
        console.log("Admin user created successfully");

    } catch (err) {
        console.error("Seeding failed:", err);
    }
};

module.exports = seedAdmin;
