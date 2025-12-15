const { S3Client, DeleteObjectCommand, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configure AWS SDK v3
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAQT46LI6Y37VKWJ5I",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "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"
  }
});

// S3 bucket configuration
const BUCKET_NAME = 'triaxxss';
const BUCKET_REGION = 'ap-south-1';

// For backward compatibility with multer-s3, create a wrapper that mimics AWS SDK v2 interface
// multer-s3 v3.0.1 expects an S3-like object with certain methods
const s3 = {
  deleteObject: (params) => ({
    promise: async () => {
      const command = new DeleteObjectCommand({
        Bucket: params.Bucket,
        Key: params.Key
      });
      return await s3Client.send(command);
    }
  }),
  headObject: (params) => ({
    promise: async () => {
      const command = new HeadObjectCommand({
        Bucket: params.Bucket,
        Key: params.Key
      });
      return await s3Client.send(command);
    }
  }),
  putObject: async (params) => {
    const command = new PutObjectCommand({
      Bucket: params.Bucket,
      Key: params.Key,
      Body: params.Body,
      ContentType: params.ContentType,
      ACL: params.ACL,
      Metadata: params.Metadata
    });
    return await s3Client.send(command);
  },
  getSignedUrl: async (operation, params) => {
    if (operation === 'putObject') {
      const command = new PutObjectCommand({
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType,
        ACL: params.ACL
      });
      return await getSignedUrl(s3Client, command, { expiresIn: params.Expires || 3600 });
    }
    throw new Error(`Unsupported operation: ${operation}`);
  }
};

module.exports = {
  s3,
  s3Client,
  BUCKET_NAME,
  BUCKET_REGION
};
