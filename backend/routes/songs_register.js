const express = require("express");
const router = express.Router();

const {
  insertNewSongRegDetails,
  insertHybridSongRegDetails,
  getPendingSongsList,
  updateSongStatusToDraft,
  updateSongNavigation,
  checkReleaseDateAvailable,
  updateSongReleaseDate,
} = require("../controllers/songs_register");
const authMiddleware = require("../middleware/authenticate");

// POST route to add new song
router.post("/register-new-song", authMiddleware, insertNewSongRegDetails);
router.post(
  "/register-hybrid-song",
  authMiddleware,
  insertHybridSongRegDetails,
);
router.get("/pending-song-registeration", authMiddleware, getPendingSongsList);
router.post("/update-song-status-to-draft", authMiddleware, updateSongStatusToDraft);
router.post("/update-song-navigation", authMiddleware, updateSongNavigation);
router.get("/check-release-date-available", authMiddleware, checkReleaseDateAvailable);
router.post("/update-song-release-date", authMiddleware, updateSongReleaseDate);

module.exports = router;
