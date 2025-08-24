
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {getSpecialArtistDetailsController} = require("../controllers/my-epk")

router.get("/get-special-artist-detail", authMiddleware, getSpecialArtistDetailsController)

module.exports = router