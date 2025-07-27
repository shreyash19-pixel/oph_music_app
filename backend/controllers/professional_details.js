  const professional = require("../model/professional_details");
  const { uploadToS3 } = require("../utils");
  const user_details = require("../model/professional_details.js");
  const { setCurrentStep } = require("../model/common/set_step.js");

  const insertProfessionalDetails = async (req, res) => {
    try {
      const {
        OPH_ID,
        Profession,
        Bio,
        SpotifyLink,
        InstagramLink,
        FacebookLink,
        AppleMusicLink,
        ExperienceYearly = 0,
        ExperienceMonthly,
        SongsPlanningCount,
        SongsPlanningType,
        step,
        VideoURL,
        photoURLs = [],
      } = req.body;

      const user = await user_details.getProfessionalDetails(OPH_ID);

      if (user.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const videoFile = req.files?.video?.[0];
      const photoFiles = req.files?.photos || [];
    
      let videoFinalURL = null;
      let allPhotoURLs = [];

      // Video logic
      if (videoFile) {
        videoFinalURL = await uploadToS3(videoFile, `allUsers/${OPH_ID}/videos`);
      } else if (VideoURL) {
        videoFinalURL = VideoURL;
      }

      // Photos logic
      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          const url = await uploadToS3(file, `allUsers/${OPH_ID}/images`);
          allPhotoURLs.push(url);
        }
      }

      if (photoURLs && Array.isArray(photoURLs)) {
        allPhotoURLs.push(...photoURLs); // append old URLs
      }

      const dbResponse = await professional.insertProfessionalDetails(
        OPH_ID,
        Profession,
        Bio,
        videoFinalURL,
        JSON.stringify(allPhotoURLs),
        SpotifyLink,
        InstagramLink,
        FacebookLink,
        AppleMusicLink,
        parseInt(ExperienceYearly),
        parseInt(ExperienceMonthly),
        parseInt(SongsPlanningCount),
        SongsPlanningType
      );

      if (dbResponse) {
        await setCurrentStep(step, OPH_ID);
        
        return res.status(200).json({
          success: true,
          message: "Professional details inserted successfully",
          step: step,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to insert professional details",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  };

  const getProfessionalByOphId = async (req, res) => {
    try {
      const { ophid } = req.query;
      const data = await user_details.getProfessionalByOphId(ophid);

      if (!data) {
        return res.status(404).json({
          success: false,
          message: "Data not found for the given OPH_ID",
        });
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  module.exports = {
    insertProfessionalDetails,
    getProfessionalByOphId,
  };
