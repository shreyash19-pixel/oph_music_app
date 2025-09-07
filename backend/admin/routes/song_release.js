const express = require("express");

const router = express.Router();
const {
  getSongReleaseListController,
  getIndividualSongReleaseListController,
  setSongReleaseDetailsController,
} = require("../controllers/song_release");

router.get("/get-song-release-list", getSongReleaseListController);
router.get(
  "/get-individual-song-release-list",
  getIndividualSongReleaseListController
);
router.post("/set-song-release-data", setSongReleaseDetailsController);

module.exports = router;
