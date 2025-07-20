const Router = require('express');
const router = Router();
const { getClerkDocuments } = require('../controllers/clerk.document');
router.post('/clerkDocs', getClerkDocuments);
module.exports = router;