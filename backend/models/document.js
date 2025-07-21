const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    scannerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    approverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    uploaderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    employeeId: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    patientMRN: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected', 'uploaded'],
        default: 'draft',
    },
    comment: {
        type: String,
        default: '',
    },
    scannedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedAt: {
        type: String,
        default: null,
    },
    uploadedAt: {
        type: Date,
        default: null,
    }
});

module.exports = mongoose.model('Document', DocumentSchema);