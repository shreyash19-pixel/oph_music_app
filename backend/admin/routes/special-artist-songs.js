const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const {
  getSongListContollers,
  getIndividualSongDetailsController,
  setSongStatusController,
} = require("../controllers/special-artist-songs");

router.get("/get-special-artist-songs-list", getSongListContollers);
router.get("/get-special-artist-song-details", getIndividualSongDetailsController);
router.post(
  "/verify-special-artist-songs",
  authMiddleware,
  forbidSalesMemberApprovals,
  setSongStatusController
);

module.exports = router;
