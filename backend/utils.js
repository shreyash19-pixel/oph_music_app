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
// Supports cancellation if client disconnects
// progressCallback(progress) is optional: called with { percent, loadedMB, totalMB, speed, time } (e.g. for Socket.IO)
const uploadToS3 = async (file, folder, abortSignal = null, progressCallback = null) => {
  const fileSize = file.size || file.buffer?.length || 0;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const isVideo = file.mimetype?.startsWith('video/');
  const fileType = isVideo ? 'VIDEO' : file.mimetype?.startsWith('audio/') ? 'AUDIO' : 'FILE';
  
  console.log(`[S3 Upload] Starting ${fileType} upload:`, {
    filename: file.originalname,
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

  let upload = null;
  let s3Key = null;
  let uploadCancelled = false;

  try {
    const startTime = Date.now();
    
    // For files larger than 10MB, use managed upload with multipart
    // This automatically handles multipart uploads for better performance
    const uploadOptions = {
      partSize: 10 * 1024 * 1024, // 10MB per part (optimal for large files)
      queueSize: 4, // Upload 4 parts concurrently
    };
    
    upload = s3.upload(params, uploadOptions);
    s3Key = params.Key; // Store key for cleanup if needed
    
    // Track upload progress for large files (especially videos)
    if (fileSize > 10 * 1024 * 1024 || isVideo) {
      let lastLoggedPercent = 0;
      upload.on('httpUploadProgress', (progress) => {
        // Check if cancelled during progress
        if (abortSignal && abortSignal.aborted) {
          if (!uploadCancelled) {
            uploadCancelled = true;
            const currentPercent = Math.round((progress.loaded / progress.total) * 100);
            console.log(`[S3 Upload] ⚠️ ${fileType} upload cancelled during progress (${currentPercent}%) - aborting...`);
            try {
              upload.abort();
            } catch (abortError) {
              console.warn(`[S3 Upload] Error aborting upload:`, abortError.message);
            }
          }
          return;
        }
        
        const percent = Math.round((progress.loaded / progress.total) * 100);
        const loadedMB = (progress.loaded / (1024 * 1024)).toFixed(2);
        const totalMB = (progress.total / (1024 * 1024)).toFixed(2);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const speed = (progress.loaded / (1024 * 1024) / (elapsed || 1)).toFixed(2);
        
        // Log every 10% progress to avoid spam, or every 5% for videos
        const logInterval = isVideo ? 5 : 10;
        if (percent >= lastLoggedPercent + logInterval || percent === 100) {
          console.log(`[S3 Upload] ${fileType} Progress: ${percent}% | ${loadedMB}MB / ${totalMB}MB | Speed: ${speed}MB/s | Time: ${elapsed}s`);
          lastLoggedPercent = percent;
          if (progressCallback && typeof progressCallback === 'function') {
            try {
              progressCallback({
                percent,
                loadedMB: parseFloat(loadedMB),
                totalMB: parseFloat(totalMB),
                speed: parseFloat(speed),
                time: parseFloat(elapsed),
              });
            } catch (e) {
              // ignore
            }
          }
        }
      });
    }
    
    // Check for cancellation before starting upload
    if (abortSignal && abortSignal.aborted) {
      console.log(`[S3 Upload] ⚠️ ${fileType} upload cancelled before starting`);
      throw new Error('Upload cancelled by client disconnect');
    }
    
    // Start upload and check for cancellation
    const uploadPromise = upload.promise();
    
    // Monitor for cancellation (check every 1 second for large files)
    let cancellationMonitor = null;
    if (abortSignal && (fileSize > 10 * 1024 * 1024 || isVideo)) {
      cancellationMonitor = setInterval(() => {
        if (abortSignal.aborted && !uploadCancelled) {
          uploadCancelled = true;
          clearInterval(cancellationMonitor);
          console.log(`[S3 Upload] ⚠️ ${fileType} upload cancelled - aborting S3 upload`);
          try {
            upload.abort();
          } catch (abortError) {
            console.warn(`[S3 Upload] Error aborting upload:`, abortError.message);
          }
        }
      }, 1000);
      
      // Clear monitor when upload completes
      uploadPromise.finally(() => {
        if (cancellationMonitor) {
          clearInterval(cancellationMonitor);
        }
      });
    }
    
    const result = await uploadPromise;
    
    // Check if cancelled after promise resolves
    if (abortSignal && abortSignal.aborted) {
      console.log(`[S3 Upload] ⚠️ ${fileType} upload was cancelled, cleaning up...`);
      // Try to delete the uploaded file
      try {
        await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();
        console.log(`[S3 Upload] ✅ Cleaned up cancelled upload: ${s3Key}`);
      } catch (deleteError) {
        console.warn(`[S3 Upload] Could not clean up cancelled upload:`, deleteError.message);
      }
      throw new Error('Upload cancelled by client disconnect');
    }
    
    const uploadTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const speed = (fileSizeMB / uploadTime).toFixed(2);
    
    console.log(`[S3 Upload] ✅ ${fileType} upload completed successfully in ${uploadTime}s (${speed}MB/s):`, result.Location);
    return result.Location;
  } catch (error) {
    // Check if error is due to cancellation
    if (abortSignal && abortSignal.aborted) {
      console.log(`[S3 Upload] ⚠️ ${fileType} upload cancelled: ${file.originalname}`);
      // Try to clean up partial upload
      if (s3Key) {
        try {
          await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();
          console.log(`[S3 Upload] ✅ Cleaned up cancelled upload: ${s3Key}`);
        } catch (deleteError) {
          console.warn(`[S3 Upload] Could not clean up cancelled upload:`, deleteError.message);
        }
      }
      throw new Error('Upload cancelled by client disconnect');
    }
    
    // If upload was aborted, try to clean up
    if (error.code === 'RequestAbortedError' || error.message?.includes('abort')) {
      console.log(`[S3 Upload] ⚠️ ${fileType} upload aborted: ${file.originalname}`);
      if (s3Key) {
        try {
          await s3.deleteObject({ Bucket: process.env.S3_BUCKET, Key: s3Key }).promise();
          console.log(`[S3 Upload] ✅ Cleaned up aborted upload: ${s3Key}`);
        } catch (deleteError) {
          console.warn(`[S3 Upload] Could not clean up aborted upload:`, deleteError.message);
        }
      }
      throw new Error('Upload cancelled');
    }
    
    console.error(`[S3 Upload] ❌ ${fileType} upload failed:`, error.message);
    console.error(`[S3 Upload] Error details:`, {
      filename: file.originalname,
      size: `${fileSizeMB}MB`,
      folder: folder,
      error: error.message,
      stack: error.stack
    });
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