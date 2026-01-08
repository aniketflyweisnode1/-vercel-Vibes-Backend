const multer = require('multer');
const { s3Client, BUCKET_NAME } = require('../../config/aws');
const { sendSuccess, sendError } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const path = require('path');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Custom storage engine for AWS SDK v3
class S3Storage {
  constructor(options) {
    this.bucket = options.bucket;
    this.acl = options.acl || 'public-read';
    this.key = options.key;
    this.contentType = options.contentType;
    this.metadata = options.metadata;
  }

  _handleFile(req, file, cb) {
    // Generate key using callback
    let key;
    if (typeof this.key === 'function') {
      this.key(req, file, (err, keyValue) => {
        if (err) return cb(err);
        key = keyValue;
        this._processFile(req, file, key, cb);
      });
    } else {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
      let folder = 'upload';
      key = `${folder}/${fileName}`;
      this._processFile(req, file, key, cb);
    }
  }

  _processFile(req, file, key, cb) {
    // Determine content type
    let contentType = file.mimetype;
    if (this.contentType) {
      if (typeof this.contentType === 'function') {
        this.contentType(req, file, (err, ct) => {
          if (err) return cb(err);
          contentType = ct || file.mimetype;
          this._uploadFile(req, file, key, contentType, cb);
        });
        return;
      } else {
        contentType = this.contentType;
      }
    }

    this._uploadFile(req, file, key, contentType, cb);
  }

  _uploadFile(req, file, key, contentType, cb) {
    // Get metadata
    let metadata = {};
    if (this.metadata) {
      if (typeof this.metadata === 'function') {
        this.metadata(req, file, (err, meta) => {
          if (err) return cb(err);
          metadata = meta || {};
          this._readAndUpload(req, file, key, contentType, metadata, cb);
        });
        return;
      } else {
        metadata = this.metadata;
      }
    }

    this._readAndUpload(req, file, key, contentType, metadata, cb);
  }

  _readAndUpload(req, file, key, contentType, metadata, cb) {
    // Read file stream
    const chunks = [];
    file.stream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    file.stream.on('error', (err) => {
      cb(err);
    });

    file.stream.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        const command = new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ACL: this.acl,
          Metadata: {
            ...metadata,
            fieldName: file.fieldname,
            originalName: file.originalname
          }
        });

        const result = await s3Client.send(command);

        // Construct file object similar to multer-s3
        const fileObj = {
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          size: buffer.length,
          bucket: this.bucket,
          key: key,
          acl: this.acl,
          contentType: contentType,
          metadata: metadata,
          location: `https://${this.bucket}.s3.ap-south-1.amazonaws.com/${key}`,
          etag: result.ETag
        };

        cb(null, fileObj);
      } catch (error) {
        cb(error);
      }
    });
  }

  _removeFile(req, file, cb) {
    // File removal is handled separately
    cb(null);
  }
}

// Configure multer for S3 upload
const upload = multer({
  storage: new S3Storage({
    bucket: BUCKET_NAME,
    acl: 'public-read',
    key: function (req, file, cb) {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;

      // Create folder structure based on file type
      let folder = 'upload';
      cb(null, `${folder}/${fileName}`);
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype);
    },
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

    const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file_key
    });
    await s3Client.send(deleteCommand);

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

    const { HeadObjectCommand } = require('@aws-sdk/client-s3');
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file_key
    });
    const fileInfo = await s3Client.send(headCommand);

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

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: file_type,
      ACL: 'public-read'
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expires_in });

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
const uploadBase64File = async (base64, folder = 'upload') => {
  if (!base64) {
    throw new Error('Base64 string is required');
  }

  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }

  const mimeType = matches[1];      // image/png
  const base64Data = matches[2];    // actual data

  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB');
  }

  const extension = mimeType.split('/')[1] || 'bin';
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read'
  });

  const result = await s3Client.send(command);

  return {
    url: `https://${BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`,
    key,
    fileName,
    mimeType,
    size: buffer.length,
    etag: result.ETag
  };
};


module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  getFileInfo,
  generatePresignedUrl,
  upload,
  uploadBase64File// Export multer instance for use in routes
};
