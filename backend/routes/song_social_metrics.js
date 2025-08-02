const express = require("express")
const router = express.Router()

const authMiddleware = require("../middleware/authenticate")
const {songSocialMetricController} = require("../controllers/song_social_metrics")

router.post("/increment-traffic", authMiddleware , songSocialMetricController)


module.exports = router