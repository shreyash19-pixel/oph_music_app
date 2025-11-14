const express = require("express");
const router = express.Router();
const { generateHashController } = require("../controllers/artist_hash");

// Generate hash for an OPH ID (utility endpoint)
router.get("/generate-artist-hash", generateHashController);

module.exports = router;

