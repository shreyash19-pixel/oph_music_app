const express = require("express");
const router = express.Router();
const {
  getTv,
  getAllTv,
  updateLockStatus,
  updateTvStatus,
} = require("../controllers/tvPublishing");

router.get("/getTv", getTv);
router.get("/getAllTv", getAllTv);
router.post("/updateLockStatus", updateLockStatus);
router.post("/updateTvStatus", updateTvStatus);

module.exports = router;
