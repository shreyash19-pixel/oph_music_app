const videoDetails = require("../model/video_details");
const { uploadToS3 } = require("../utils");
const SongApplicationStatusService = require("../services/song/SongApplicationStatusService");

exports.createVideoDetails = async (req, res) => {
  try {
    const { ophid, song_id, credits } = req.body;

    if (!ophid || !song_id || !credits) {
      return res.status(400).json({
        success: false,
        message: "Missing require fields"
      })
    }


    const video_url = req.files.video_file?.[0];
    const image_url = req.files?.thumbnails || [];

    let photoURLSArr = []
    let videoURL = ''

    if (image_url) {

      for (const img of image_url) {
        const url = await uploadToS3(img, `video-meta/${ophid}/image-url`)
        if (url) {
          photoURLSArr.push(url)
        }
      }
    }

    if (video_url) {
      const url = await uploadToS3(video_url, `video-meta/${ophid}/video-url`)

      if (url) {
        videoURL = url
      }

    }

    // 3️⃣  Insert into the child table
    const response = await videoDetails.insertVideoDetails(
      song_id,
      credits,
      JSON.stringify(photoURLSArr),
      videoURL
    );

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
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
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

