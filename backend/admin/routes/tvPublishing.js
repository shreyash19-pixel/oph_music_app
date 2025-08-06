const express = require("express");
const router = express.Router();
const { getTv, getAllTv } = require("../controllers/tvPublishing");

router.get("/getTv", getTv);
router.get("/getAllTv", getAllTv);

module.exports = router;
