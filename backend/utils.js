// src/utils/s3.js
const fs = require("fs");
const AWS = require('aws-sdk');
require("dotenv").config();

// Optimized S3 configuration for production performance
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  // Performance optimizations
  httpOptions: {
    // Per-request socket timeout for each S3 multipart part (not whole 1GB upload)
    timeout: 20 * 60 * 1000, // 20 minutes — slow uplink to S3 for large parts
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
// logContext optional: { song_id, oph_id, phase } — adds tags to progress lines for grepping
const uploadToS3 = async (
  file,
  folder,
  abortSignal = null,
  progressCallback = null,
  logContext = null
) => {
  let fileSize = file.size || file.buffer?.length || 0;
  const diskPath =
    file.path && typeof file.path === "string" && fs.existsSync(file.path)
      ? file.path
      : null;
  if (diskPath) {
    try {
      const st = fs.statSync(diskPath);
      fileSize = st.size;
    } catch (e) {
      console.error(`[S3 Upload] stat failed for temp file:`, diskPath, e.message);
      throw e;
    }
  } else if (!file.buffer && !diskPath) {
    throw new Error("uploadToS3: file has no buffer and no path (use multer memoryStorage or diskStorage)");
  }

  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  const isVideo = file.mimetype?.startsWith('video/');
  const fileType = isVideo ? 'VIDEO' : file.mimetype?.startsWith('audio/') ? 'AUDIO' : 'FILE';
  const ctx =
    logContext && (logContext.song_id != null || logContext.oph_id != null)
      ? ` [song_id=${logContext.song_id ?? "?"} oph_id=${logContext.oph_id ?? "?"}]`
      : "";

  console.log(`[S3 Upload]${ctx} Starting ${fileType}:`, {
    filename: file.originalname,
    mimetype: file.mimetype,
    size: `${fileSizeMB}MB`,
    folder: folder,
    source: diskPath ? `disk:${diskPath}` : "memory",
  });
  
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${folder}/${Date.now()}-${file.originalname}`,
    ContentType: file.mimetype,
  };
  if (diskPath) {
    params.Body = fs.createReadStream(diskPath);
    params.ContentLength = fileSize;
  } else {
    params.Body = file.buffer;
  }

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
      let lastLoggedPercent = -1;
      let firstByteLogged = false;
      // Tighter logging for large videos so backend logs show steady progress
      const logInterval =
        isVideo && fileSize > 500 * 1024 * 1024
          ? 2
          : isVideo && fileSize > 100 * 1024 * 1024
            ? 3
            : isVideo
              ? 5
              : 10;

      upload.on('httpUploadProgress', (progress) => {
        // Check if cancelled during progress
        if (abortSignal && abortSignal.aborted) {
          if (!uploadCancelled) {
            uploadCancelled = true;
            const currentPercent = Math.round((progress.loaded / progress.total) * 100);
            console.log(
              `[S3 Upload]${ctx} ⚠️ ${fileType} cancelled at ${currentPercent}% — aborting…`
            );
            try {
              upload.abort();
            } catch (abortError) {
              console.warn(`[S3 Upload] Error aborting upload:`, abortError.message);
            }
          }
          return;
        }

        const percent =
          progress.total > 0
            ? Math.min(100, Math.round((progress.loaded / progress.total) * 100))
            : 0;
        const loadedMB = (progress.loaded / (1024 * 1024)).toFixed(2);
        const totalMB = (progress.total / (1024 * 1024)).toFixed(2);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const speed = (progress.loaded / (1024 * 1024) / (elapsed || 1)).toFixed(2);

        if (!firstByteLogged && progress.loaded > 0) {
          firstByteLogged = true;
          console.log(
            `[S3 Upload]${ctx} ${fileType} → S3: first part acknowledged | ${loadedMB} / ${totalMB} MB | ${elapsed}s elapsed`
          );
        }

        const shouldLog =
          percent === 100 ||
          lastLoggedPercent < 0 ||
          percent >= lastLoggedPercent + logInterval;
        if (shouldLog) {
          console.log(
            `[S3 Upload]${ctx} ${fileType} progress: ${percent}% | ${loadedMB} / ${totalMB} MB | ${speed} MB/s | ${elapsed}s`
          );
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
        } else if (progressCallback && typeof progressCallback === 'function') {
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
      });
    }
    
    // Check for cancellation before starting upload
    if (abortSignal && abortSignal.aborted) {
      console.log(`[S3 Upload]${ctx} ⚠️ ${fileType} cancelled before starting`);
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
          console.log(`[S3 Upload]${ctx} ⚠️ ${fileType} cancelled — aborting S3 upload`);
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
      console.log(`[S3 Upload]${ctx} ⚠️ ${fileType} was cancelled, cleaning up…`);
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
    
    console.log(
      `[S3 Upload]${ctx} ✅ ${fileType} finished in ${uploadTime}s (avg ${speed} MB/s) → ${result.Location}`
    );
    return result.Location;
  } catch (error) {
    // Check if error is due to cancellation
    if (abortSignal && abortSignal.aborted) {
      console.log(`[S3 Upload]${ctx} ⚠️ ${fileType} cancelled: ${file.originalname}`);
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
      console.log(`[S3 Upload]${ctx} ⚠️ ${fileType} aborted: ${file.originalname}`);
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
    
    console.error(`[S3 Upload]${ctx} ❌ ${fileType} failed:`, error.message);
    console.error(`[S3 Upload]${ctx} Error details:`, {
      filename: file.originalname,
      size: `${fileSizeMB}MB`,
      folder: folder,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  } finally {
    if (diskPath && fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
        if (isVideo || fileSize > 20 * 1024 * 1024) {
          console.log(`[S3 Upload]${ctx} Temp file removed after S3 (${fileSizeMB}MB)`);
        }
      } catch (e) {
        console.warn(`[S3 Upload]${ctx} Could not remove temp file:`, diskPath, e.message);
      }
    }
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

/**
 * Generate a pre-signed URL for downloading a private S3 object.
 * Use when the bucket is private and direct URLs return 403.
 * @param {string} key - S3 object key (e.g. "pdfs/Artist_Name.pdf")
 * @param {number} expiresIn - URL validity in seconds (default 900 = 15 min)
 * @returns {string} Pre-signed URL
 */
const getPresignedDownloadUrl = (key, expiresIn = 900) => {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: expiresIn,
    ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
  };
  return s3.getSignedUrl("getObject", params);
};

const ALLOWED_PRESIGNED_VIDEO_PURPOSES = [
  "song-video",
  "professional",
  "admin-professional",
  "tv-publishing",
  "admin-tv",
  "epk-bio",
  "epk-story",
  "about-us",
  "page-media",
  "resource-podcast",
  "resource-stories",
  "resource-reels",
  "resource-learning",
  "admin-song-video",
];

/**
 * Map presigned upload purpose → S3 key prefix (no trailing slash).
 * @param {string} purpose
 * @param {{ ophid?: string, song_id?: string, page_name?: string }} ctx
 */
const resolvePresignedVideoKeyPrefix = (purpose, ctx = {}) => {
  const ophid = String(ctx.ophid || "").trim();
  const songId = String(ctx.song_id || "").trim();
  const pageName = String(ctx.page_name || "").trim();

  switch (purpose) {
    case "song-video":
      if (!ophid) throw new Error("ophid required for song-video");
      return `video-meta/${ophid}/video-url`;
    case "professional":
      if (!ophid) throw new Error("ophid required for professional");
      return `allUsers/${ophid}/videos`;
    case "admin-professional":
      if (!ophid) throw new Error("ophid required for admin-professional");
      return `allUsers/${ophid}/professional_videos`;
    case "tv-publishing":
      if (!songId) throw new Error("song_id required for tv-publishing");
      return `contents/${songId}/video`;
    case "admin-tv":
      if (!songId) throw new Error("song_id required for admin-tv");
      return `contents/${songId}/video_url`;
    case "epk-bio":
      if (!ophid) throw new Error("ophid required for epk-bio");
      return `special-artist/${ophid}/bioVideo`;
    case "epk-story":
      if (!ophid) throw new Error("ophid required for epk-story");
      return `special-artist/${ophid}/artistStoryVideo`;
    case "about-us":
      return "uploaded-videos";
    case "page-media":
      if (!pageName) throw new Error("page_name required for page-media");
      return `page-media/${pageName}/videos`;
    case "resource-podcast":
      return "Resource/Podcast";
    case "resource-stories":
      return "Resource/Stories";
    case "resource-reels":
      return "Resource/Reels";
    case "resource-learning":
      return "Resource/Learning";
    case "admin-song-video":
      return "video-files";
    default:
      throw new Error(`Unknown presigned upload purpose: ${purpose}`);
  }
};

/**
 * Presigned PUT so the browser uploads directly to S3 (bypasses Cloudflare/nginx body limits).
 */
const getPresignedPutUrlForPrefix = (keyPrefix, originalFilename, contentType) => {
  const safeName = String(originalFilename || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `${keyPrefix}/${Date.now()}-${safeName}`;
  const ct =
    (contentType && String(contentType).trim()) || "application/octet-stream";
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Expires: 60 * 60,
    ContentType: ct,
  };
  const uploadUrl = s3.getSignedUrl("putObject", params);
  const region = process.env.AWS_REGION || "ap-south-1";
  const bucket = process.env.S3_BUCKET;
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return { uploadUrl, publicUrl, key, contentType: ct };
};

/**
 * Presigned PUT for artist song video step (same key layout as historical getPresignedVideoPutUrl).
 */
const getPresignedVideoPutUrl = (ophid, originalFilename, contentType) => {
  return getPresignedPutUrlForPrefix(
    resolvePresignedVideoKeyPrefix("song-video", { ophid }),
    originalFilename,
    contentType
  );
};

/**
 * Server-side S3 get (avoids browser fetch CORS to private buckets).
 * @param {string} key - Object key
 * @returns {Promise<Buffer>}
 */
const getS3ObjectBuffer = async (key) => {
  if (!process.env.S3_BUCKET) {
    throw new Error("S3_BUCKET not set");
  }
  const result = await s3
    .getObject({ Bucket: process.env.S3_BUCKET, Key: key })
    .promise();
  return result.Body;
};

const s3ObjectExists = async (key) => {
  if (!process.env.S3_BUCKET) {
    return false;
  }
  try {
    await s3
      .headObject({ Bucket: process.env.S3_BUCKET, Key: key })
      .promise();
    return true;
  } catch (err) {
    if (
      err.code === "NotFound" ||
      err.statusCode === 404 ||
      err.code === "NoSuchKey" ||
      err.name === "NotFound"
    ) {
      return false;
    }
    throw err;
  }
};

module.exports = {
  uploadToS3,
  uploadToS3Form,
  readFromS3,
  saveToS3,
  deleteFromS3,
  getPresignedDownloadUrl,
  ALLOWED_PRESIGNED_VIDEO_PURPOSES,
  resolvePresignedVideoKeyPrefix,
  getPresignedPutUrlForPrefix,
  getPresignedVideoPutUrl,
  getS3ObjectBuffer,
  s3ObjectExists,
};