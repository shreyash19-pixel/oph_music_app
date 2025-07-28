const express = require("express")

const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const { getArtistInfoController,
    getSongRankingsController,
    getSongsRankingsByIdController } = require("../controllers/artist-spotlight")

router.get("/artist-info", authMiddleware, getArtistInfoController)
// router.get("/songs-rankings", authMiddleware, getSongRankingsController)
router.get("/get-songs-rankings-by-id", authMiddleware, getSongsRankingsByIdController)

module.exports = router