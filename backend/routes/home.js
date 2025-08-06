const express = require("express")

const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {newReleasesController, getArtistDetailController, getReleatedArtistsController} = require("../controllers/home")

router.get("/home/new-releases",authMiddleware, newReleasesController)
router.get("/get-artist-detail", getArtistDetailController)
router.get("/get-releated-artists", getReleatedArtistsController)

module.exports = router
