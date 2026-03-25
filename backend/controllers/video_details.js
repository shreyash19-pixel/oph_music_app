const videoDetails = require("../model/video_details");
const { uploadToS3 } = require("../utils");
const SongApplicationStatusService = require("../services/song/SongApplicationStatusService");

exports.createVideoDetails = async (req, res) => {
  // Create abort signal to detect client disconnection
  // Only trigger on actual disconnection, not on normal request lifecycle events
  const abortSignal = {
    aborted: false,
    on: function(event, callback) {
      if (event === 'abort') {
        this._abortCallback = callback;
      }
    },
    _abortCallback: null
  };

  // REMOVED socket.destroyed check - it's unreliable because server timeout
  // can mark socket as destroyed even when client is still connected
  // We ONLY rely on the 'aborted' event which is truly reliable
  
  // Only listen for 'aborted' event - this is the ONLY reliable indicator
  // 'aborted' only fires when client actually aborts the request
  // Socket.destroyed can be false positive due to server timeout
  req.once('aborted', () => {
    if (!abortSignal.aborted) {
      abortSignal.aborted = true;
      console.log(`[Video Upload] ⚠️ Request aborted by client, cancelling uploads...`);
      if (abortSignal._abortCallback) {
        abortSignal._abortCallback();
      }
    }
  });

  // Listen to socket 'error' - only fires on actual connection errors
  if (req.socket) {
    req.socket.once('error', (error) => {
      if (!abortSignal.aborted) {
        abortSignal.aborted = true;
        console.log(`[Video Upload] ⚠️ Socket error detected: ${error.message}, cancelling uploads...`);
        if (abortSignal._abortCallback) {
          abortSignal._abortCallback();
        }
      }
    });
  }

  // We don't check socket.destroyed anymore - it's unreliable
  // Only the 'aborted' event and socket 'error' event will trigger cancellation
  // We check abortSignal.aborted directly where needed

  try {
    const { ophid, song_id, credits } = req.body;

    if (!ophid || !song_id || !credits) {
      return res.status(400).json({
        success: false,
        message: "Missing require fields"
      })
    }

    // Don't check connection at start - only check during/after upload
    // Initial check can give false positives

    const video_url = req.files.video_file?.[0];
    const image_url = req.files?.thumbnails || [];
    
    // Get existing thumbnails from request body (if any)
    // Frontend should send existing_thumbnails as JSON array to preserve existing images
    let existingThumbnails = [];
    try {
      if (req.body.existing_thumbnails) {
        existingThumbnails = typeof req.body.existing_thumbnails === 'string' 
          ? JSON.parse(req.body.existing_thumbnails) 
          : req.body.existing_thumbnails;
      }
    } catch (e) {
      console.warn('[Video Upload] Failed to parse existing_thumbnails:', e.message);
    }

    let photoURLSArr = []
    let videoURL = ''

    // Upload only NEW thumbnails (not existing ones that are already on S3)
    if (image_url && image_url.length > 0) {
      console.log(`[Video Upload] Uploading ${image_url.length} new thumbnail(s)...`);
      const thumbnailUploads = image_url.map((img, index) => {
        console.log(`[Video Upload] Uploading thumbnail ${index + 1}/${image_url.length}: ${img.originalname}`);
        return uploadToS3(img, `video-meta/${ophid}/image-url`, abortSignal);
      });
      
      try {
        const thumbnailUrls = await Promise.all(thumbnailUploads);
        // Check if upload was cancelled (only if abortSignal was set by actual abort/error event)
        if (abortSignal.aborted) {
          console.log(`[Video Upload] ⚠️ Thumbnail upload was cancelled, aborting...`);
          return;
        }
        const newThumbnailUrls = thumbnailUrls.filter(url => url); // Filter out any null/undefined URLs
        photoURLSArr = [...existingThumbnails, ...newThumbnailUrls]; // Merge existing + new
        console.log(`[Video Upload] Total thumbnails: ${existingThumbnails.length} existing + ${newThumbnailUrls.length} new = ${photoURLSArr.length} total`);
      } catch (error) {
        if (error.message?.includes('cancelled') || error.message?.includes('disconnect')) {
          console.log(`[Video Upload] ⚠️ Thumbnail upload cancelled due to client disconnect`);
          return; // Client disconnected, stop processing
        }
        throw error;
      }
    } else if (existingThumbnails.length > 0) {
      // No new thumbnails, but keep existing ones
      photoURLSArr = existingThumbnails;
      console.log(`[Video Upload] No new thumbnails to upload, keeping ${existingThumbnails.length} existing thumbnail(s)`);
    }

    if (video_url) {
      const fileSizeMB = (video_url.size / (1024 * 1024)).toFixed(2);
      console.log(`[Video Upload] Starting video upload: ${video_url.originalname} (${fileSizeMB}MB)`);
      console.log(`[Video Upload] File received from client, uploading to S3...`);
      
      const io = req.app.get('io');
      const onlineUsers = req.app.get('onlineUsers');
      const socketId = ophid && onlineUsers ? onlineUsers.get(String(ophid).trim()) : null;
      const progressCallback = socketId && io
        ? (progress) => {
            try {
              io.to(socketId).emit('video-upload-progress', progress);
            } catch (e) {
              // ignore
            }
          }
        : null;

      try {
        const url = await uploadToS3(video_url, `video-meta/${ophid}/video-url`, abortSignal, progressCallback);

        // Check if upload was cancelled (only if abortSignal was set by actual abort/error event)
        if (abortSignal.aborted) {
          console.log(`[Video Upload] ⚠️ Video upload was cancelled, not saving to database`);
          return;
        }

        if (url) {
          videoURL = url
          console.log(`[Video Upload] ✅ Video upload completed successfully: ${url}`);
        } else {
          console.error(`[Video Upload] ❌ Video upload failed - no URL returned`);
        }
      } catch (error) {
        if (error.message?.includes('cancelled') || error.message?.includes('disconnect')) {
          console.log(`[Video Upload] ⚠️ Video upload cancelled due to client disconnect`);
          return; // Client disconnected, stop processing
        }
        throw error;
      }
    } else {
      // No new video file: keep existing URL in DB (do not overwrite with empty string)
      const bodyExisting = req.body.existing_video_url;
      if (bodyExisting && String(bodyExisting).trim() !== "") {
        videoURL = String(bodyExisting).trim();
        console.log(`[Video Upload] No new video file; using existing_video_url from request`);
      } else {
        try {
          const existingRows = await videoDetails.getVideoDetails(song_id);
          const existingUrl = existingRows?.[0]?.video_url;
          if (existingUrl && String(existingUrl).trim() !== "") {
            videoURL = existingUrl;
            console.log(`[Video Upload] No new video file; preserving existing video_url from DB`);
          }
        } catch (e) {
          console.warn("[Video Upload] Could not load existing video_url:", e.message);
        }
      }
    }

    // Check if request was aborted before database operations
    // Only abortSignal.aborted is reliable (set by actual abort/error events)
    if (abortSignal.aborted) {
      console.log(`[Video Upload] ⚠️ Request was aborted, not saving to database`);
      return;
    }

    // 3️⃣  Insert into the child table
    const response = await videoDetails.insertVideoDetails(
      song_id,
      credits,
      JSON.stringify(photoURLSArr),
      videoURL
    );

    // Final check before sending response
    if (abortSignal.aborted) {
      console.log(`[Video Upload] ⚠️ Request was aborted after database insert, not sending response`);
      return;
    }

    if (response) {
      await videoDetails.setJourneyStatus(ophid,song_id);
      
      // Check if this was a resubmission of a rejected video BEFORE we clear the reject_reason
      const db = require("../DB/connect");
      const connection = await db.getConnection();
      let redirectPath = null;
      let nextRejectedSection = null;
      let songName = null;
      let songId = null;
      let releaseDate = null;
      let projectType = null;
      let lyricalServices = null;
      let wasRejected = false;
      
      try {
        // Check if video was previously rejected (before we update it)
        const [videoDetailsCheck] = await connection.execute(
          `SELECT reject_reason, status FROM video_details WHERE song_id = ?`,
          [song_id]
        );
        
        wasRejected = videoDetailsCheck.length > 0 && 
                     (videoDetailsCheck[0].reject_reason !== null || videoDetailsCheck[0].status === 'rejected');
        
        // Update status_video to 'under review' in both:
        // 1. video_details table (already set in insertVideoDetails model)
        // 2. song_application_status table (for centralized status management)
        await connection.beginTransaction();
        
        // Ensure video_details.status is set to 'under review' (should already be set by model, but ensure it)
        await connection.execute(
          `UPDATE video_details 
           SET status = 'under review', reject_reason = NULL, updated_at = NOW()
           WHERE song_id = ?`,
          [song_id]
        );
        
        // Update song_application_status
        await SongApplicationStatusService.updateStepStatus(
          connection,
          song_id,
          'video',
          'under review'
        );
        
        await connection.commit();
        
        // Only check for next rejected section if this was a resubmission
        if (wasRejected) {
          const SongRegistrationService = require("../services/song/SongRegistrationService");
          const nextSection = await SongRegistrationService.getNextRejectedSection(song_id, ophid, 'video');
          redirectPath = nextSection.redirectPath;
          nextRejectedSection = nextSection.nextRejectedSection;
          songName = nextSection.songName;
          songId = nextSection.songId;
          releaseDate = nextSection.releaseDate;
          projectType = nextSection.projectType;
          lyricalServices = nextSection.lyricalServices;
        }
        // For new submissions, redirectPath will be null, so frontend uses default navigation
      } catch (error) {
        await connection.rollback();
        console.error("Error updating video status:", error);
        // Don't fail the request if status update fails
      } finally {
        connection.release();
      }
      
      // Final check before sending response
      if (abortSignal.aborted) {
        console.log(`[Video Upload] ⚠️ Request was aborted, not sending response`);
        return; // Don't send response if request was aborted
      }

      // Check if response was already sent or connection is closed
      if (res.headersSent || res.destroyed || !res.writable) {
        console.log(`[Video Upload] ⚠️ Cannot send response - connection closed`);
        return;
      }

      res.status(201).json({ 
        success: true, 
        message: "Video details saved",
        nextRejectedSection: nextRejectedSection,
        redirectPath: redirectPath, // null for new submissions, will use default navigation
        songName: songName,
        songId: songId,
        releaseDate: releaseDate,
        projectType: projectType,
        lyricalServices: lyricalServices
      });
    }

  } catch (err) {
    // Check if error is due to client disconnect
    if (err.message?.includes('cancelled') || err.message?.includes('disconnect') || 
        err.code === 'ECONNRESET' || err.code === 'EPIPE') {
      console.log(`[Video Upload] ⚠️ Request cancelled or client disconnected:`, err.message);
      return; // Don't send error response if client disconnected
    }

    console.error('[Video Upload] Error:', err);
    
    // Only send error response if client is still connected
    if (!res.headersSent && !res.destroyed && res.writable) {
      res.status(500).json({ 
        success: false, 
        message: "Server error", 
        error: err.message 
      });
    }
  }
};


exports.getVideoDetails = async (req, res) => {

  try{

    const {
      contentId
    } = req.query

    if(!contentId)
    {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      })
    }

    const response = await videoDetails.getVideoDetails(contentId)

    if(response)
    {
      return res.status(200).json({
        success: true,
        message: "Data Fetched Successfully",
        data: {
          video_metadata: response
        }
      })
    }

  }
  catch(err)
  {
    console.error('Error in getVideoDetails:', err);
    return res.status(500).json({
      success: false,
      message : err.message || "Internal server error"
    })
  }

}

exports.checkPaymentStatusController = async (req, res) => {

  try{

      const {contentId, ophid} = req.query
      // Get ophid from query param or JWT token
      // Try multiple possible paths for ophid in token
      const tokenOphid = req.user?.userData?.artist?.id 
        || req.user?.userData?.artist?.OPH_ID
        || req.user?.ophid
        || req.user?.OPH_ID;

      if(!contentId)
      {
        return res.status(400).json({
          success: false,
          message: "Missing required field: contentId"
        })
      }

      const finalOphid = ophid || tokenOphid;

      if(!finalOphid)
      {
        console.log('Token structure:', JSON.stringify(req.user, null, 2));
        return res.status(400).json({
          success: false,
          message: "Missing required field: ophid (not found in token or query)",
          debug: {
            hasUser: !!req.user,
            userKeys: req.user ? Object.keys(req.user) : [],
            userDataKeys: req.user?.userData ? Object.keys(req.user.userData) : [],
            artistKeys: req.user?.userData?.artist ? Object.keys(req.user.userData.artist) : [],
            queryOphid: ophid
          }
        })
      }
      
      const response = await videoDetails.checkPaymentStatus(contentId, finalOphid)

      if(response)
      {
        return res.status(200).json({
          success: true,
          message: "Data fetched successfully",
          data: response
        })
      }
  }

  catch(err)
  {
    console.error('Error in checkPaymentStatusController:', err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error"
    })
  }

}

