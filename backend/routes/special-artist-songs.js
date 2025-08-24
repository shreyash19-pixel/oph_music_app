const express = require("express");
const router = express.Router();

const multer = require("multer");
const authMiddleware = require("../middleware/authenticate");
const {
  insertSpecialArtistSongsController,getSpeicalArtistSongStatusController
} = require("../controllers/special-artist-songs");

const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/insert-special-artist-song",
  authMiddleware,
  upload.single("audioFile"),
  insertSpecialArtistSongsController
);

router.get("/get-special-artist-song-status", authMiddleware, getSpeicalArtistSongStatusController)

module.exports = router
