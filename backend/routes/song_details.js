const express = require("express");
const router = express.Router();

const { getSongDetailsController } = require("../controllers/song_details");

router.get("/get-artist-song-details", getSongDetailsController);

module.exports = router;
