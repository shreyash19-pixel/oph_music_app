const express = require("express");
const router = express.Router();

const {
  getSupportingNumbersController,
  updateSupportingNumbersController,
} = require("../controllers/supporting_number");

// 🟢 GET: Fetch supporting numbers
router.get("/getsupport", getSupportingNumbersController);

// 🟠 POST: Update supporting numbers (for admin panel)
router.post("/updatesupport", updateSupportingNumbersController);

module.exports = router;
