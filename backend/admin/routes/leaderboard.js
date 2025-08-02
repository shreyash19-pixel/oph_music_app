const express = require('express');
const router = express.Router();
const leaderboard= require('../controllers/leaderboard');


// POST /api/leaderboard -> insert or update
router.post('/update_leaderboard', leaderboard.saveLeaderBoardScore);


// GET /api/leaderboard -> all scores
router.get('/leaderboard', leaderboard.fetchAllScores);

// GET /api/leaderboard/:ophid -> single score
// router.get('/:ophid', fetchScoreByOphId);


module.exports = router;
