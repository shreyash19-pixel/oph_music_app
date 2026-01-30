// src/utils/s3.js
const AWS = require('aws-sdk');
require("dotenv").config();

// Optimized S3 configuration for production performance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // Performance optimizations
  httpOptions: {
    timeout: 300000, // 5 minutes timeout for large files
    connectTimeout: 60000, // 1 minute connection timeout
  },
  maxRetries: 3, // Retry failed requests
  retryDelayOptions: {
    customBackoff: function(retryCount) {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, retryCount), 4000);
    }
  },
  // Use multipart upload threshold (5MB default, but we'll handle larger files)
  multipartUploadThreshold: 5 * 1024 * 1024, // 5MB
  multipartUploadSize: 10 * 1024 * 1024, // 10MB per part
  // Enable acceleration if available (requires S3 Transfer Acceleration)
  // useAccelerateEndpoint: true, // Uncomment if S3 Transfer Acceleration is enabled
});

// Use multipart upload for large files (>10MB) for better performance
const uploadToS3 = async (file, folder) => {
  const fileSize = file.size || file.buffer?.length || 0;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  
  console.log("Uploading file to S3:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: `${fileSizeMB}MB`,
    folder: folder
  });
  
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const startTime = Date.now();
    
    // For files larger than 10MB, use managed upload with multipart
    // This automatically handles multipart uploads for better performance
    const uploadOptions = {
      partSize: 10 * 1024 * 1024, // 10MB per part (optimal for large files)
      queueSize: 4, // Upload 4 parts concurrently
    };
    
    const upload = s3.upload(params, uploadOptions);
    
    // Track upload progress for large files
    if (fileSize > 10 * 1024 * 1024) {
      upload.on('httpUploadProgress', (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(1);
        console.log(`Upload progress: ${percent}% (${(progress.loaded / (1024 * 1024)).toFixed(2)}MB / ${(progress.total / (1024 * 1024)).toFixed(2)}MB)`);
      });
    }
    
    const result = await upload.promise();
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const speed = (fileSizeMB / uploadTime).toFixed(2);
    
    console.log(`S3 upload successful in ${uploadTime}s (${speed}MB/s):`, result.Location);
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

const uploadToS3Form = async (file, folder) => {
  const fileSize = file.size || file.buffer?.length || 0;
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const startTime = Date.now();
    
    // Use optimized upload for large files
    const uploadOptions = fileSize > 10 * 1024 * 1024 ? {
      partSize: 10 * 1024 * 1024,
      queueSize: 4,
    } : {};
    
    const upload = s3.upload(params, uploadOptions);
    const result = await upload.promise();
    
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`S3 form upload successful in ${uploadTime}s`);
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
};

// Function to read data from S3
const readFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    try {
      const result = await s3.getObject(params).promise();
      return JSON.parse(result.Body.toString('utf8'));
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        console.log(`No existing file found in S3: ${key}`);
        return {};
      }
      throw error;
    }
  } catch (err) {
    console.error('Error reading from S3:', err.message);
    return {};
  }
};

// Function to save data to S3
const saveToS3 = async (key, data) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json'
    };

    const result = await s3.upload(params).promise();
    console.log(`✅ File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (err) {
    console.error('Error saving to S3:', err.message);
    throw err;
  }
};

// Function to delete data from S3
const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: key
    };

    const result = await s3.deleteObject(params).promise();
    console.log(`✅ File deleted from S3: ${key}`);
    return result;
  } catch (err) {
    console.error('Error deleting from S3:', err.message);
    throw err;
  }
};

module.exports = { uploadToS3, uploadToS3Form, readFromS3, saveToS3, deleteFromS3 };