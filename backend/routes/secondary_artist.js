const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("../controllers/secondary_artist");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});
const authMiddleware = require("../middleware/authenticate")

// POST - Create secondary artist
router.post(
  "/secondary-artist",
  authMiddleware,
  upload.single("profile_image"),
  controller.insertSecondaryArtist
);

router.post(
  "/remove-secondary-artist",
  authMiddleware,
  controller.removeSecondaryArtist
);

// GET - Fetch all secondary artists by OPH_ID
router.get("/secondary-artists", controller.getSecondaryArtistsByOphId);

// GET - Fetch all secondary artists by song_id
router.get("/secondary-artists-by-song/:songId", controller.getSecondaryArtistsBySongId);

module.exports = router;
