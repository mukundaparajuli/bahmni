const Router = require("express");
const { uploadDocument } = require('../controllers/document.controller');
const path = require("path");
const configureMulter = require("../middleware/multer-config");

// Configure multer for profile photos
const uploadDir = path.join(__dirname, '..', 'uploads', 'documents');
const upload = configureMulter(uploadDir);


const router = Router();
router.post('/uploadDocument', upload.single('file'), uploadDocument);
module.exports = router;