const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authenticate");
const {
  newReleasesController,
  getArtistDetailController,
  getReleatedArtistsController,
  getUpcomingSongController,
} = require("../controllers/home");

router.get("/home/new-releases", authMiddleware, newReleasesController);

// Public: artist profile + related artists (works with or without login)
router.get("/get-artist-detail", getArtistDetailController);
router.get("/get-releated-artists", getReleatedArtistsController);

//nav pages
router.get("/get-nav-artist-detail", getArtistDetailController);
router.get(
  "/get-nav-releated-artists",
  getReleatedArtistsController
);
router.get("/get-upcoming-event", authMiddleware, getUpcomingSongController);

module.exports = router;
