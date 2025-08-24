
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {getArtistTypeController} = require("../controllers/sidebar")

router.get("/get-artist-type", authMiddleware, getArtistTypeController)

module.exports = router

