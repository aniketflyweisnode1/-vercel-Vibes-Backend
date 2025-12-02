const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: "",
  secretAccessKey: "",
  region: ''
});

// Create S3 instance
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4'
});

// S3 bucket configuration
const BUCKET_NAME = '';
const BUCKET_REGION = '';

module.exports = {
  s3,
  BUCKET_NAME,
  BUCKET_REGION
};
