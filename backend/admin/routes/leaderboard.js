const express = require('express');
const router = express.Router();
const leaderboard = require('../controllers/leaderboard');

/** Independent artists use OPH IDs like OPH-CAN-IA-01 (segment `-IA-`). */
const isIndependentArtistOphId = (ophId) => {
  if (ophId == null || ophId === "") return false;
  return String(ophId).toUpperCase().includes("-IA-");
};

const wrapLeaderboardListIndependentOnly = (handler) => async (req, res, next) => {
  const origJson = res.json.bind(res);
  res.json = (body) => {
    if (!body || typeof body !== "object" || !Array.isArray(body.data)) {
      return origJson(body);
    }
    return origJson({
      ...body,
      data: body.data.filter((row) =>
        isIndependentArtistOphId(row.oph_id ?? row.OPH_ID),
      ),
    });
  };
  await handler(req, res, next);
};

// POST /api/leaderboard -> insert or update
router.post('/update_leaderboard', leaderboard.saveLeaderBoardScore);

// GET /api/leaderboard -> all scores
router.get(
  '/leaderboard',
  wrapLeaderboardListIndependentOnly(leaderboard.fetchAllScores),
);

// GET /api/leaderboard/:ophid -> single score
// router.get('/:ophid', fetchScoreByOphId);

module.exports = router;
