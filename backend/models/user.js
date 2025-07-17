const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: [true, 'Employee ID is required'],
            unique: true,
        },
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            match: [/.+\@.+\..+/, 'Please enter a valid email'],
        },
        education: {
            type: String,
            required: [true, 'Education is required'],
        },
        profession: {
            type: String,
            required: [true, 'Professional details are required'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 6,
            select: false,
        },
        employeeIdPhoto: {
            type: String,
        },
        photo: {
            type: String,
        },
        roles: {
            type: [String],
            enum: ['Admin', 'ScannerClerk', 'Approver', 'Uploader'],
            default: ['ScannerClerk'],
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isSelfRegistered: {
            type: Boolean,
            default: false,
        },
        registrationStatus: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Approved',
        },
        rejectionReason: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);