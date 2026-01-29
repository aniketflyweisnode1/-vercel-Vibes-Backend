const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const { auth } = require('../../../middleware/auth');
const uploadEmployeeController = require('../../controllers/uploadEmployee');
router.use(fileUpload({ limits: { fileSize: 5 * 1024 * 1024 }, abortOnLimit: true, safeFileNames: true, preserveExtension: true }));

router.post('/importEmployeeFromExcel', auth, uploadEmployeeController.importEmployeeFromExcel);

module.exports = router;