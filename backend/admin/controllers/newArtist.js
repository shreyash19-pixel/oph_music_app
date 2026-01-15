const userDetailsModel = require("../model/newArtist");
const AdminApplicationStatusService = require("../services/AdminApplicationStatusService");

const getAllDetailsUnderReview = async (req, res) => {
  try {
    const { ophid } = req.params;
    console.log("Fetching details for OPH_ID:", ophid);

    const userDetails = await userDetailsModel.getUserDetailsByOphId(ophid);
    console.log("User details from DB:", userDetails);
    
    const professionalDetails = await userDetailsModel.getProfessionalDetailsByOphId(ophid);
    console.log("Professional details from DB:", professionalDetails);
    
    const documentationDetails = await userDetailsModel.getDocumentationDetailsByOphId(ophid);
    console.log("Documentation details from DB:", documentationDetails);

    // Check if no data found for all
    if (!userDetails && !professionalDetails && !documentationDetails) {
      return res.status(404).json({ message: "No details found with step_status 'under review' for given OPH ID." });
    }

    const response = {
      userDetails: userDetails || null,
      professionalDetails: professionalDetails || null,
      documentationDetails: documentationDetails || null,
    };
    
    console.log("Sending response:", JSON.stringify(response, null, 2));
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error("Error fetching details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUserDetailsIfAnyStepUnderReview = async (req, res) => {
  try {
    const userDetails = await userDetailsModel.getAllUserDetailsWithAnyStepUnderReview();

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({ message: "No user details found with step_status under review in any table" });
    }

    res.status(200).json({ userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSales = async (req, res) => {
  try {
    const userDetails = await userDetailsModel.getAllSales();

    if (!userDetails || userDetails.length === 0) {
      return res.status(404).json({
        message:
          "No user details found with step_status rejected in any table",
      });
    }

    res.status(200).json({ userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateStatus = async (req, res) => {
  const { ophid, Personal, Professional, Documentation } = req.body;

  try {
    console.log("Update Status Request Body:", JSON.stringify(req.body, null, 2));
    console.log("OPH ID:", ophid);
    console.log("Personal:", Personal);
    console.log("Professional:", Professional);
    console.log("Documentation:", Documentation);

    if (!ophid) {
      return res.status(400).json({ message: "OPH ID is required" });
    }

    // Use AdminApplicationStatusService to handle all application logic
    // This updates both step tables (user_details, professional_details, documentation_details)
    // and the application_status table in a transaction
    const result = await AdminApplicationStatusService.updateMultipleStepStatuses(ophid, {
      Personal,
      Professional,
      Documentation
    });

    console.log("Update Status Result:", JSON.stringify(result, null, 2));

    res.status(200).json({ 
      message: "Statuses updated successfully",
      results: result.results
    });

  } catch (error) {
    console.error("Error updating statuses:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

const getUserDetailsStepStatus = async (req, res) => {
  const { ophid } = req.params;
  const userDetails = await userDetailsModel.getUserDetailsStepStatus(ophid);
  res.status(200).json({ userDetails });
};  

const getProfessionalDetailsStepStatus = async (req, res) => {
  const { ophid } = req.params;
  const professionalDetails = await userDetailsModel.getProfessionalDetailsStepStatus(ophid);
  res.status(200).json({ professionalDetails });
};

const getDocumentationDetailsStepStatus = async (req, res) => {
  const { ophid } = req.params;
  const documentationDetails = await userDetailsModel.getDocumentationDetailsStepStatus(ophid);
  res.status(200).json({ documentationDetails });
};

const getApplicationStatus = async (req, res) => {
  try {
    const { ophid } = req.params;
    const ApplicationStatusService = require("../../services/application/ApplicationStatusService");
    const db = require("../../DB/connect");
    const connection = await db.getConnection();
    
    try {
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, ophid);
      res.status(200).json({ applicationStatus });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching application status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  getAllDetailsUnderReview,
  getAllUserDetailsIfAnyStepUnderReview,
  updateStatus,
  getAllSales,
  getUserDetailsStepStatus,
  getProfessionalDetailsStepStatus,
  getDocumentationDetailsStepStatus,
  getApplicationStatus,
};
