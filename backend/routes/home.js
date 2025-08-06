const express = require("express")

const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {newReleasesController, getArtistDetailController, getReleatedArtistsController} = require("../controllers/home")

router.get("/home/new-releases",authMiddleware, newReleasesController)
router.get("/get-artist-detail",authMiddleware, getArtistDetailController)
router.get("/get-releated-artists",authMiddleware, getReleatedArtistsController)

module.exports = router
