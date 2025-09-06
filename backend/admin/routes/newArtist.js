const express = require("express");
const router = express.Router();
const userDetailsController = require("../controllers/newArtist");

// GET /user-details/under-review/:ophid
router.get("/under-review/:ophid", userDetailsController.getAllDetailsUnderReview);
router.get("/any-under-review", userDetailsController.getAllUserDetailsIfAnyStepUnderReview);
router.post("/update-status", userDetailsController.updateStatus);
router.get("/getAllSales", userDetailsController.getAllSales);

module.exports = router;
