const multer = require('multer');
const multerS3 = require('multer-s3');
const { s3, BUCKET_NAME } = require('../../config/aws');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const path = require('path');

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
      
      // Create folder structure based on file type
      let folder = 'general';
      if (file.mimetype.startsWith('image/')) {
        folder = 'images';
      } else if (file.mimetype.startsWith('video/')) {
        folder = 'videos';
      } else if (file.mimetype.startsWith('audio/')) {
        folder = 'audio';
      } else if (file.mimetype.includes('pdf')) {
        folder = 'documents';
      }
      
      cb(null, `${folder}/${fileName}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.userId || 'anonymous'
      });
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Define allowed file types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/avi',
      'video/mov',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'), false);
    }
  }
});

/**
 * Upload single file to S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadSingleFile = asyncHandler(async (req, res) => {
  try {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return sendError(res, 'File size too large. Maximum size is 10MB.', 400);
          }
          return sendError(res, `Upload error: ${err.message}`, 400);
        }
        return sendError(res, err.message, 400);
      }

      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const fileData = {
        file_id: Date.now() + Math.random().toString(36).substr(2, 9),
        original_name: req.file.originalname,
        file_name: req.file.key,
        file_url: req.file.location,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        bucket: req.file.bucket,
        key: req.file.key,
        etag: req.file.etag,
        uploaded_by: null,
        uploaded_at: new Date()
      };

      sendSuccess(res, fileData, 'File uploaded successfully');
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Upload multiple files to S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  try {
    const uploadMultiple = upload.array('files', 5); // Maximum 5 files
    
    uploadMultiple(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return sendError(res, 'File size too large. Maximum size is 10MB per file.', 400);
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return sendError(res, 'Too many files. Maximum 5 files allowed.', 400);
          }
          return sendError(res, `Upload error: ${err.message}`, 400);
        }
        return sendError(res, err.message, 400);
      }

      if (!req.files || req.files.length === 0) {
        return sendError(res, 'No files uploaded', 400);
      }

      const filesData = req.files.map((file, index) => ({
        file_id: Date.now() + index + Math.random().toString(36).substr(2, 9),
        original_name: file.originalname,
        file_name: file.key,
        file_url: file.location,
        file_size: file.size,
        file_type: file.mimetype,
        bucket: file.bucket,
        key: file.key,
        etag: file.etag,
        uploaded_by: req.userId || null,
        uploaded_at: new Date()
      }));

      sendSuccess(res, {
        files: filesData,
        total_files: filesData.length,
        total_size: filesData.reduce((sum, file) => sum + file.file_size, 0)
      }, 'Files uploaded successfully');
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Delete file from S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteFile = asyncHandler(async (req, res) => {
  try {
    const { file_key } = req.params;

    if (!file_key) {
      return sendError(res, 'File key is required', 400);
    }

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: file_key
    };

    await s3.deleteObject(deleteParams).promise();

    sendSuccess(res, {
      file_key: file_key,
      deleted_at: new Date()
    }, 'File deleted successfully');
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return sendError(res, 'File not found', 404);
    }
    throw error;
  }
});

/**
 * Get file info from S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFileInfo = asyncHandler(async (req, res) => {
  try {
    const { file_key } = req.params;

    if (!file_key) {
      return sendError(res, 'File key is required', 400);
    }

    const headParams = {
      Bucket: BUCKET_NAME,
      Key: file_key
    };

    const fileInfo = await s3.headObject(headParams).promise();

    sendSuccess(res, {
      file_key: file_key,
      file_size: fileInfo.ContentLength,
      file_type: fileInfo.ContentType,
      last_modified: fileInfo.LastModified,
      etag: fileInfo.ETag,
      metadata: fileInfo.Metadata
    }, 'File information retrieved successfully');
  } catch (error) {
    if (error.code === 'NotFound') {
      return sendError(res, 'File not found', 404);
    }
    throw error;
  }
});

/**
 * Generate presigned URL for file upload
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generatePresignedUrl = asyncHandler(async (req, res) => {
  try {
    const { file_name, file_type, expires_in = 3600 } = req.body;

    if (!file_name || !file_type) {
      return sendError(res, 'file_name and file_type are required', 400);
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file_name);
    const fileName = path.basename(file_name, fileExtension) + '-' + uniqueSuffix + fileExtension;
    
    // Create folder structure based on file type
    let folder = 'general';
    if (file_type.startsWith('image/')) {
      folder = 'images';
    } else if (file_type.startsWith('video/')) {
      folder = 'videos';
    } else if (file_type.startsWith('audio/')) {
      folder = 'audio';
    } else if (file_type.includes('pdf')) {
      folder = 'documents';
    }

    const key = `${folder}/${fileName}`;

    const presignedUrl = s3.getSignedUrl('putObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: file_type,
      Expires: expires_in,
      ACL: 'public-read'
    });

    sendSuccess(res, {
      presigned_url: presignedUrl,
      file_key: key,
      file_name: fileName,
      expires_in: expires_in,
      upload_url: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    }, 'Presigned URL generated successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo,
  generatePresignedUrl,
  upload // Export multer instance for use in routes
};
