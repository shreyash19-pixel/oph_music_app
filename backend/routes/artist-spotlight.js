const express = require("express")

const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {getArtistInfoController, getSongRankingsController} = require("../controllers/artist-spotlight")

router.get("/artist-info", authMiddleware, getArtistInfoController)
router.get("/songs-rankings", authMiddleware, getSongRankingsController)

module.exports = router