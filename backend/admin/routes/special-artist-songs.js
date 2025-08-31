
const express = require("express")
const router = express.Router()
const {getSongListContollers, getIndividualSongDetailsController, setSongStatusController} = require("../controllers/special-artist-songs")

router.get("/get-special-artist-songs-list", getSongListContollers)
router.get("/get-special-artist-song-details", getIndividualSongDetailsController)
router.post("/verify-special-artist-songs", setSongStatusController)


module.exports = router
