const leaderboardController = require('../model/leaderboard');

const saveLeaderBoardScore = async (req, res) => {
  try {
    const { OPH_ID, song_count, total_views, score } = req.body;
    
    

    if (!OPH_ID || song_count == null || total_views == null || score == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    await leaderboardController.insertOrUpdateScore({ OPH_ID, song_count, total_views, score });
    res.status(200).json({ message: 'Score saved successfully' });
  } catch (err) {
    console.error('Error saving leaderboard score:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
const fetchAllScores = async (req, res) => {
  try {
    const scores = await leaderboardController.getAllScores();
    res.status(200).json(scores);
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get score by OPH_ID
const fetchScoreByOphId = async (req, res) => {
  try {
    const { ophid } = req.params;
    const score = await leaderboardController.getScoreByOphId(ophid);

    if (!score) {
      return res.status(404).json({ message: 'Score not found' });
    }

    res.status(200).json(score);
  } catch (err) {
    console.error('Error fetching score:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  saveLeaderBoardScore,
  fetchAllScores,
  fetchScoreByOphId,
};


