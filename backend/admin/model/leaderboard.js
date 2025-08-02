const db = require('../../DB/connect');

const insertOrUpdateScore = async ({ OPH_ID, song_count, total_views, score }) => {
  const query = `
    INSERT INTO leaderBoard_scores (OPH_ID, song_count, total_views, score)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      song_count = VALUES(song_count),
      total_views = VALUES(total_views),
      score = VALUES(score),
      updatedAt = CURRENT_TIMESTAMP
  `;

  await db.execute(query, [OPH_ID, song_count, total_views, score]);
};

const getAllScores = async () => {
  const [rows] = await db.execute(`SELECT * FROM leaderBoard_scores ORDER BY score DESC`);
  return rows;
};

// Get single score by OPH_ID
const getScoreByOphId = async (OPH_ID) => {
  const [rows] = await db.execute(`SELECT * FROM leaderBoard_scores WHERE OPH_ID = ?`, [OPH_ID]);
  return rows[0]; // Return single object
};

module.exports = {
  insertOrUpdateScore,
  getAllScores,
  getScoreByOphId,
};

