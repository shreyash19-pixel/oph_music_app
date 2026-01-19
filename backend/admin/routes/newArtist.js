const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/newArtist");

// GET /user-details/under-review/:ophid
router.get("/under-review/:ophid", userDetailsController.getAllDetailsUnderReview);
router.get("/any-under-review", userDetailsController.getAllUserDetailsIfAnyStepUnderReview);
router.post("/update-status", userDetailsController.updateStatus);
router.get("/getAllSales", userDetailsController.getAllSales);
router.get("/user-details-step-status/:ophid", userDetailsController.getUserDetailsStepStatus);
router.get("/professional-details-step-status/:ophid", userDetailsController.getProfessionalDetailsStepStatus);
router.get("/documentation-details-step-status/:ophid", userDetailsController.getDocumentationDetailsStepStatus);
router.get("/application-status/:ophid", userDetailsController.getApplicationStatus);   

module.exports = router;
