const Router = require("express");
const { upload, uploadDocument } = require('../controllers/document.controller');
const router = Router();
router.post('/uploadDocument', upload.single('file'), uploadDocument);
module.exports = router;