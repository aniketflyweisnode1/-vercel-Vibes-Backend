const {createPackage,getAllPackage, getPackageById, updatePackage, deletePackage} = require('../../controllers/package');
const { auth } = require('../../../middleware/auth');
const express = require("express");
const router = express();
var multer = require("multer");
const upload = multer({
        storage: multer.memoryStorage(), // Store the file in memory buffer
        limits: { fileSize: 1024 * 1024 * 10 }, // Limit file size to 10MB (adjust as needed)
});


router.post('/create', auth, createPackage);
router.get('/getAll', auth, getAllPackage);
router.get('/getById/:id', auth, getPackageById);
router.put('/updateById', auth, updatePackage);
router.delete('/deleteById/:id', auth, deletePackage);

module.exports = router;
