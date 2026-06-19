const tvModel = require("../model/tvPublishing");
const { uploadToS3 } = require("../utils");

const TvUser = async (req, res) => {
  const { OPH_ID } = req.query;
  if (!OPH_ID) {
    return res
      .status(400)
      .json({ success: false, message: "Missing OPH ID in query" });
  } else {
    try {
      const Tv = await tvModel.TvUser(OPH_ID);
      res.status(200).json({ success: true, data: Tv });
      // console.log("req.query:", Tv);
      // console.log("Controller - ophID:", OPH_ID);
    } catch (error) {
      console.error("Error fetching Tv:", error);
      console.log("Controller - ophID:", OPH_ID);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const createContentFiles = async (req, res) => {
  try {
    const { song_id } = req.body;

    if (!song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: song_id",
      });
    }

    const audio_file = req.files.audio?.[0];
    const videoFromBody =
      req.body.video_url && String(req.body.video_url).trim();

    if (!audio_file || !videoFromBody) {
      return res.status(400).json({
        success: false,
        message: "Both audio file and video_url (presigned upload) are required",
      });
    }

    const audio = await uploadToS3(audio_file, `contents/${song_id}/audio`);
    if (!audio) {
      return res.status(500).json({
        success: false,
        message: "Audio upload failed",
      });
    }

    const video = videoFromBody;

    // Insert into DB
    const response = await tvModel.updateContentFiles(
      song_id,
      audio,
      video
    );

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Content files uploaded successfully",
      });
    }

    res.status(500).json({
      success: false,
      message: "Database insert failed",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};




module.exports = { TvUser, createContentFiles };
