  const professional = require("../model/professional_details");
  const { uploadToS3 } = require("../utils");
  const user_details = require("../model/professional_details.js");
  const { setCurrentStep } = require("../model/common/set_step.js");
  const ApplicationStatusService = require("../services/application/ApplicationStatusService");
  const db = require("../DB/connect");

/**
 * Determine next step based on application status after professional details submission
 */
const determineNextStepAfterProfessional = (applicationStatus) => {
  if (!applicationStatus) {
    return "/auth/create-profile/documentation-details";
  }

  const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;

  // If completed, go to dashboard
  if (overall_status === "completed") {
    return "/dashboard";
  }

  // PRIORITY 1: Check for rejected steps (user just resubmitted professional, so check others)
  if (documentation_status === "rejected") {
    return "/auth/create-profile/documentation-details";
  }
  if (payment_status === "rejected") {
    return "/auth/payment";
  }

  // PRIORITY 2: Continue to next step in sequence
  if (!documentation_status || documentation_status === "pending") {
    return "/auth/create-profile/documentation-details";
  }
  if (!payment_status || payment_status === "pending") {
    return "/auth/payment";
  }

  // PRIORITY 3: If all steps are approved or under review, go to membership form
  // After filling a form, user should see membership form instead of status page
  return "/auth/membership-form";
};

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

      // Photos logic - upload in parallel for better performance
      if (photoFiles.length > 0) {
        const photoUploads = photoFiles.map(file => 
          uploadToS3(file, `allUsers/${OPH_ID}/images`)
        );
        const uploadedUrls = await Promise.all(photoUploads);
        allPhotoURLs.push(...uploadedUrls.filter(url => url));
      }

      if (photoURLs && Array.isArray(photoURLs)) {
        allPhotoURLs.push(...photoURLs); // append old URLs
      }

      // 🟢 Update using transaction to ensure both professional_details and application_status are updated atomically
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();

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
          SongsPlanningType || null, // songsPlanningType
          connection // Pass connection for transaction
        );

        if (!dbResponse) {
          await connection.rollback();
          return res.status(500).json({
            success: false,
            message: "Failed to insert professional details",
          });
        }

        // Update application_status table (sets professional_status to "under review")
        await ApplicationStatusService.updateStepStatus(connection, OPH_ID, "professional", "under review");
        
        // Determine next step based on application status
        const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, OPH_ID);
        const nextStep = determineNextStepAfterProfessional(applicationStatus);
        
        // Commit transaction
        await connection.commit();
        
        // Update current_step (outside transaction as it's not critical)
        await setCurrentStep(nextStep, OPH_ID);
        
        return res.status(200).json({
          success: true,
          message: "Professional details inserted successfully",
          step: nextStep,
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
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
