const user_details = require("../model/personal_details.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bucket = require("../utils.js");
const { setCurrentStep } = require("../model/common/set_step.js");
const ApplicationStatusService = require("../services/application/ApplicationStatusService");
const db = require("../DB/connect");

/**
 * Determine next step based on application status after personal details submission
 */
const determineNextStepAfterPersonal = (applicationStatus) => {
  if (!applicationStatus) {
    return "/auth/create-profile/professional-details";
  }

  const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;

  // If completed, go to dashboard (shouldn't happen after personal submission, but handle it)
  if (overall_status === "completed") {
    return "/dashboard";
  }

  // PRIORITY 1: Check for rejected steps (user just resubmitted personal, so check others)
  if (professional_status === "rejected") {
    return "/auth/create-profile/professional-details";
  }
  if (documentation_status === "rejected") {
    return "/auth/create-profile/documentation-details";
  }
  if (payment_status === "rejected") {
    return "/auth/payment";
  }

  // PRIORITY 2: Continue to next step in sequence
  if (!professional_status || professional_status === "pending") {
    return "/auth/create-profile/professional-details";
  }
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

const insertPersonalDetails = async (req, res) => {
  try {
    const {
      ophid,
      legal_name,
      stage_name,
      contact_num,
      location,
      email,
      step,
    } = req.body;
    const profile_image = req.file;

    if (
      !ophid ||
      !legal_name ||
      !stage_name ||
      !contact_num ||
      !location ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await user_details.getPersonalDetails(ophid);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = user[0];

    let storageLocation = existingUser.personal_photo;

    // 🟢 Upload new image if provided
    if (profile_image) {
      const storeImgIntoBucket = await bucket.uploadToS3(
        profile_image,
        `allUsers/${ophid}/profile_image`
      );
      if (storeImgIntoBucket) {
        storageLocation = storeImgIntoBucket;
      }
    } else if (req.body.existing_image_url) {
      // If no new image is provided but existing image URL is sent, use the existing one
      storageLocation = req.body.existing_image_url;
    }
    // If neither new image nor existing image URL is provided, keep the current storageLocation (existingUser.personal_photo)

    // 🟢 Update in DB using transaction to ensure both user_details and application_status are updated atomically
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update user_details table (sets step_status to "under review")
      console.log("[insertPersonalDetails] Updating user_details table for OPH_ID:", ophid);
      const updatedData = await user_details.setPersonalDetails(
        ophid,
        legal_name,
        stage_name,
        contact_num,
        storageLocation,
        location,
        email,
        connection // Pass connection for transaction
      );

      console.log("[insertPersonalDetails] user_details update - affectedRows:", updatedData?.affectedRows);
      
      if (!updatedData || updatedData.affectedRows === 0) {
        console.error("[insertPersonalDetails] No rows affected in user_details update");
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: "Failed to update data",
        });
      }

      // Verify the update by checking the current step_status
      const [verifyRows] = await connection.execute(
        "SELECT step_status FROM user_details WHERE oph_id = ?",
        [ophid]
      );
      console.log("[insertPersonalDetails] Verified step_status in user_details:", verifyRows[0]?.step_status);

      // Update application_status table (sets user_status to "under review")
      console.log("[insertPersonalDetails] Updating application_status table");
      await ApplicationStatusService.updateStepStatus(connection, ophid, "user", "under review");
      
      // Verify the update in application_status
      const appStatus = await ApplicationStatusService.getApplicationStatus(connection, ophid);
      console.log("[insertPersonalDetails] Verified user_status in application_status:", appStatus?.user_status);
      
      // Determine next step based on application status
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, ophid);
      const nextStep = determineNextStepAfterPersonal(applicationStatus);
      
      // Commit transaction
      await connection.commit();
      
      // Update current_step (outside transaction as it's not critical)
      await setCurrentStep(nextStep, ophid);
      
      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
        step: nextStep,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error updating personal details:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error updating personal details:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


const mapPersonalDetails = async (req, res) => {
  try {
    const { ophid } = req.query;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing 'ophid' in request query",
      });
    }

    const user = await user_details.getPersonalDetails(ophid);
    const userDetails = user[0];

    if (user.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Successfully fetched data",
        data: {
          full_name: userDetails.full_name,
          stage_name: userDetails.stage_name,
          contact_num: userDetails.contact_number || userDetails.contact_num, // Support both for backward compatibility
          contact_number: userDetails.contact_number || userDetails.contact_num,
          email: userDetails.email,
          profile_pic : userDetails.personal_photo,
          location: userDetails.location,
          step_status:userDetails.step_status,
          reject_reason:userDetails.reject_reason,
          current_step: userDetails.current_step || null,
          artist_type: userDetails.artist_type
        },
      });
    }

    return res.status(404).json({
      success: false,
      message: "User not found with provided ophid",
    });
  } catch (err) {
    console.error("Error fetching personal details:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getAllPersonal = async (req, res) => {
  try {
    const bookings = await user_details.getFullPersonal()
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const profile_image = req.file;
    const ophid = req.user?.userData?.artist?.id;

    if (!ophid) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token",
      });
    }

    if (!profile_image) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const imageUrl = await bucket.uploadToS3(
      profile_image,
      `allUsers/${ophid}/profile_image`
    );

    const [result] = await db.execute(
      "UPDATE user_details SET personal_photo = ? WHERE oph_id = ?",
      [imageUrl, ophid]
    );

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: {
        personal_photo: imageUrl,
      },
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { mapPersonalDetails, insertPersonalDetails, getAllPersonal, updateProfileImage };
