const {
  insertDocumentationDetails,
  getDocumentationDetails,
  getDocumentationDetailsByOphId,
} = require("../model/documentation_details");
const { uploadToS3 } = require("../utils");
const { setCurrentStep } = require("../model/common/set_step.js");

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


    // Save to DB
    const result = await insertDocumentationDetails(
      OPH_ID,
      AadharFrontURL,
      AadharBackURL,
      PanFrontURL,
      SignatureImageURL,
      BankName,
      AccountHolderName,
      AccountNumber,
      IFSCCode,
      AgreementAccepted
    );

    if (result) {
      await setCurrentStep(step, OPH_ID);
      return res.status(200).json({
        success: true,
        message: "Documentation details inserted/updated successfully",
        step: step,
      });
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
    

    const data = await getDocumentationDetailsByOphId(ophid);
    

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
  insertDocumentationController,
  getDocumentByOphIdController,
};
