const express = require("express");

const router = express.Router();

const { getLeaderBoardData } = require("../controllers/leaderboard");

router.get("/leaderboard/history", getLeaderBoardData);

module.exports = router;
