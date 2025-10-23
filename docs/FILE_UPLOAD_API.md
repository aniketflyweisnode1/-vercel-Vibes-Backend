# File Upload API with AWS S3

This API provides file upload functionality using AWS S3 for storage.

## Setup

### 1. Install Dependencies
```bash
npm install aws-sdk multer multer-s3
```

### 2. Environment Variables
Add the following environment variables to your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

### 3. AWS S3 Bucket Setup
1. Create an S3 bucket in your AWS account
2. Configure bucket permissions for public read access
3. Set up CORS configuration for web uploads

## API Endpoints

### 1. Upload Single File
**POST** `/api/file-upload/upload-single`

Upload a single file to S3.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body:**
- `file`: File to upload (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "file_id": "1640995200000-abc123def",
    "original_name": "image.jpg",
    "file_name": "images/file-1640995200000-123456789.jpg",
    "file_url": "https://your-bucket.s3.amazonaws.com/images/file-1640995200000-123456789.jpg",
    "file_size": 1024000,
    "file_type": "image/jpeg",
    "bucket": "your-bucket",
    "key": "images/file-1640995200000-123456789.jpg",
    "etag": "\"abc123def456\"",
    "uploaded_by": 1,
    "uploaded_at": "2023-12-31T12:00:00.000Z"
  },
  "message": "File uploaded successfully"
}
```

### 2. Upload Multiple Files
**POST** `/api/file-upload/upload-multiple`

Upload multiple files to S3 (max 5 files).

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body:**
- `files`: Array of files to upload (multipart/form-data)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "file_id": "1640995200000-abc123def",
        "original_name": "image1.jpg",
        "file_name": "images/file-1640995200000-123456789.jpg",
        "file_url": "https://your-bucket.s3.amazonaws.com/images/file-1640995200000-123456789.jpg",
        "file_size": 1024000,
        "file_type": "image/jpeg",
        "bucket": "your-bucket",
        "key": "images/file-1640995200000-123456789.jpg",
        "etag": "\"abc123def456\"",
        "uploaded_by": 1,
        "uploaded_at": "2023-12-31T12:00:00.000Z"
      }
    ],
    "total_files": 1,
    "total_size": 1024000
  },
  "message": "Files uploaded successfully"
}
```

### 3. Delete File
**DELETE** `/api/file-upload/delete/:file_key`

Delete a file from S3.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `file_key`: S3 object key of the file to delete

**Response:**
```json
{
  "success": true,
  "data": {
    "file_key": "images/file-1640995200000-123456789.jpg",
    "deleted_at": "2023-12-31T12:00:00.000Z"
  },
  "message": "File deleted successfully"
}
```

### 4. Get File Information
**GET** `/api/file-upload/info/:file_key`

Get information about a file in S3.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `file_key`: S3 object key of the file

**Response:**
```json
{
  "success": true,
  "data": {
    "file_key": "images/file-1640995200000-123456789.jpg",
    "file_size": 1024000,
    "file_type": "image/jpeg",
    "last_modified": "2023-12-31T12:00:00.000Z",
    "etag": "\"abc123def456\"",
    "metadata": {
      "fieldName": "file",
      "originalName": "image.jpg",
      "uploadedBy": "1"
    }
  },
  "message": "File information retrieved successfully"
}
```

### 5. Generate Presigned URL
**POST** `/api/file-upload/presigned-url`

Generate a presigned URL for direct client-side uploads.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "file_name": "image.jpg",
  "file_type": "image/jpeg",
  "expires_in": 3600
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "presigned_url": "https://your-bucket.s3.amazonaws.com/images/file-1640995200000-123456789.jpg?X-Amz-Algorithm=...",
    "file_key": "images/file-1640995200000-123456789.jpg",
    "file_name": "file-1640995200000-123456789.jpg",
    "expires_in": 3600,
    "upload_url": "https://your-bucket.s3.amazonaws.com/images/file-1640995200000-123456789.jpg"
  },
  "message": "Presigned URL generated successfully"
}
```

## File Organization

Files are automatically organized into folders based on their type:

- **Images**: `images/` folder
- **Videos**: `videos/` folder
- **Audio**: `audio/` folder
- **Documents**: `documents/` folder
- **Other**: `general/` folder

## Supported File Types

- **Images**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV
- **Documents**: PDF, DOC, DOCX, XLS, XLSX

## File Size Limits

- Maximum file size: 10MB per file
- Maximum files per request: 5 files (for multiple upload)

## Error Handling

The API handles various error scenarios:

- Invalid file types
- File size exceeded
- Too many files
- AWS S3 errors
- Authentication errors

## Security

- All endpoints require authentication
- Files are stored with public read access
- Unique filenames prevent conflicts
- File type validation prevents malicious uploads
