const {
  insertDocumentationDetails,
  getDocumentationDetails,
  getDocumentationDetailsByOphId,
} = require("../model/documentation_details");
const { uploadToS3 } = require("../utils");
const { setCurrentStep } = require("../model/common/set_step.js");
const ApplicationStatusService = require("../services/application/ApplicationStatusService");
const db = require("../DB/connect");

/**
 * Determine next step based on application status after documentation details submission
 */
const determineNextStepAfterDocumentation = (applicationStatus) => {
  if (!applicationStatus) {
    return "/auth/membership-form";
  }

  const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;

  // If completed, go to dashboard
  if (overall_status === "completed") {
    return "/dashboard";
  }

  // PRIORITY 1: Check for rejected steps (user just resubmitted documentation, so check payment)
  if (payment_status === "rejected") {
    return "/auth/payment";
  }

  // PRIORITY 2: Continue to next step in sequence
  if (!payment_status || payment_status === "pending") {
    return "/auth/payment";
  }

  // PRIORITY 3: If all steps are approved or under review, go to membership form
  // After filling a form, user should see membership form instead of status page
  return "/auth/membership-form";
};

const insertDocumentationController = async (req, res) => {
  try {
    const {
      OPH_ID,
      BankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      AgreementAccepted,
      step
    } = req.body;

    // Validate user exists
    const userRows = await getDocumentationDetailsByOphId(OPH_ID);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    
    const user = userRows[0];
    const files = req.files;

    // Preserve existing values if no new file is uploaded
    const AadharFrontURL = files?.AadharFrontURL
      ? await uploadToS3(files.AadharFrontURL[0], `allUsers/${OPH_ID}/kyc/aadhar`)
      : user.AadharFrontURL || null;

    const AadharBackURL = files?.AadharBackURL
      ? await uploadToS3(files.AadharBackURL[0], `allUsers/${OPH_ID}/kyc/aadhar`)
      : user.AadharBackURL || null;

    // PAN card is optional - preserve existing value if no new file is uploaded
    const PanFrontURL = files?.PanFrontURL
      ? await uploadToS3(files.PanFrontURL[0], `allUsers/${OPH_ID}/kyc/pan`)
      : user.PanFrontURL || null;

    const SignatureImageURL = files?.SignatureImageURL
      ? await uploadToS3(files.SignatureImageURL[0], "kyc/signature")
      : null;


    // 🟢 Update using transaction to ensure both documentation_details and application_status are updated atomically
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Save to DB - Map PascalCase from frontend to snake_case for database
      const result = await insertDocumentationDetails(
        OPH_ID, // ophId
        AadharFrontURL || null, // aadharFrontUrl
        AadharBackURL || null, // aadharBackUrl
        PanFrontURL || null, // panFrontUrl
        SignatureImageURL || null, // signatureImageUrl
        BankName || null, // bankName
        AccountHolderName || null, // accountHolderName
        AccountNumber || null, // accountNumber
        IFSCCode || null, // ifscCode
        AgreementAccepted || 0, // agreementAccepted
        connection // Pass connection for transaction
      );

      if (!result) {
        await connection.rollback();
        return res.status(500).json({
          success: false,
          message: "Failed to insert documentation details",
        });
      }

      // Update application_status table (sets documentation_status to "under review")
      await ApplicationStatusService.updateStepStatus(connection, OPH_ID, "documentation", "under review");
      
      // Determine next step based on application status
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, OPH_ID);
      const nextStep = determineNextStepAfterDocumentation(applicationStatus);
      
      // Commit transaction
      await connection.commit();
      
      // Update current_step (outside transaction as it's not critical)
      await setCurrentStep(nextStep, OPH_ID);
      
      return res.status(200).json({
        success: true,
        message: "Documentation details inserted/updated successfully",
        step: nextStep,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    
  } catch (err) {
    console.error("Insert documentation error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};


const getDocumentByOphIdController = async (req, res) => {
  try {
    const { ophid } = req.query;
    
    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing ophid parameter",
      });
    }

    const data = await getDocumentationDetailsByOphId(ophid);
    
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found for the given OPH_ID",
      });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching documentation details:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

module.exports = {
  insertDocumentationController,
  getDocumentByOphIdController,
};
