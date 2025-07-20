const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    scannerClerk: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String,
        required: true
    },
    patientMRN: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
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
    reviewerId: {
        type: String,
        default: null,
    },
    reviewedAt: {
        type: Date,
        default: null,
    }
});

module.exports = mongoose.model('Document', DocumentSchema);
