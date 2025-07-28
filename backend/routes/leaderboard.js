const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authenticate")
const {getLeaderboardDetailsController} = require("../controllers/leaderboard")

router.get("/leaderboard", authMiddleware, getLeaderboardDetailsController)

module.exports = router