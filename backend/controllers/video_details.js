const videoDetails = require("../model/video_details");
const { uploadToS3 } = require("../utils");

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
      await videoDetails.setJourneyStatus(ophid,song_id)
      res.status(201).json({ success: true, message: "Video details saved" });
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

