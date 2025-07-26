// model/video_details.js
const db = require("../DB/connect");

/**
 * Insert a new video‑details row
 */
const insertVideoDetails = async (
  song_id,
  credits,
  image_url,
  video_url
) => {
  const [result] = await db.execute(
    `INSERT INTO video_details (
       song_id,
       credits,
       image_url,
       video_url
     )
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       credits = VALUES(credits),
       image_url = VALUES(image_url),
       video_url = VALUES(video_url)`,
    [
      song_id,
      credits,
      image_url,
      video_url
    ]
  );

  return result;
};

const setJourneyStatus = async (ophid, song_id) => {
  const [rows] = await db.execute("UPDATE songs_register SET status = 'Pending', current_page = NULL WHERE OPH_ID = ? AND song_id = ?", [ophid, song_id]);

  return rows
}

/**
 * Fetch a single video‑details row by composite key (OPH_ID + Song_name)
 */
const getVideoDetails = async (song_id) => {
  const [rows] = await db.execute(
    `SELECT *
       FROM video_details
      WHERE song_id = ?`,
    [song_id]
  );

  return rows; // array; 0 or 1 row expected
};

module.exports = {
  insertVideoDetails,
  getVideoDetails,
  setJourneyStatus
};
