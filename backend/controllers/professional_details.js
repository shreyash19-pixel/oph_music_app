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

      // Map PascalCase from frontend to snake_case for database
      const dbResponse = await professional.insertProfessionalDetails(
        OPH_ID, // ophId
        Profession || null, // profession
        Bio || null, // bio
        videoFinalURL || null, // videoUrl
        JSON.stringify(allPhotoURLs) || null, // photoUrls
        SpotifyLink || null, // spotifyLink
        InstagramLink || null, // instagramLink
        FacebookLink || null, // facebookLink
        AppleMusicLink || null, // appleMusicLink
        parseInt(ExperienceYearly) || 0, // experienceYearly
        parseInt(ExperienceMonthly) || 0, // experienceMonthly
        parseInt(SongsPlanningCount) || 0, // songsPlanningCount
        SongsPlanningType || null // songsPlanningType
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
      
      if (!ophid) {
        return res.status(400).json({
          success: false,
          message: "Missing ophid parameter",
        });
      }

      const data = await user_details.getProfessionalByOphId(ophid);

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Data not found for the given OPH_ID",
        });
      }

      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error fetching professional details:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error",
        error: error.message 
      });
    }
  };

  module.exports = {
    insertProfessionalDetails,
    getProfessionalByOphId,
  };
