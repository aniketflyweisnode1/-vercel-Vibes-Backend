const express = require('express');
const router = express.Router();

// Import controllers
const { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  deleteFile, 
  getFileInfo, 
  generatePresignedUrl,
  upload 
} = require('../../controllers/file_upload.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');

// Upload single file (with auth)
router.post('/upload-single', auth, uploadSingleFile);

// Upload multiple files (with auth)
router.post('/upload-multiple', auth, uploadMultipleFiles);

// Delete file (with auth)
router.delete('/delete/:file_key', auth, deleteFile);

// Get file information (with auth)
router.get('/info/:file_key', auth, getFileInfo);

// Generate presigned URL for direct upload (with auth)
router.post('/presigned-url', auth, generatePresignedUrl);

module.exports = router;
