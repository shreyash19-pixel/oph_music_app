// model/video_details.js
const db = require("../DB/connect");

/**
 * Insert a new video‑details row
 */
const insertVideoDetails = async (song_id, credits, image_url, video_url) => {
  const [result] = await db.execute(
    `INSERT INTO video_details (
       song_id,
       credits,
       image_url,
       video_url,
       reject_reason,
       status
     )
     VALUES (?, ?, ?, ?,?,?)
     ON DUPLICATE KEY UPDATE
       credits = VALUES(credits),
       image_url = VALUES(image_url),
       video_url = VALUES(video_url),
       reject_reason = null,
       status = 'under review'
       `,
    [song_id, credits, image_url, video_url, null, "under review"]
  );

  return result;
};

const setJourneyStatus = async (ophid, song_id) => {

  const [rows] = await db.execute(
    "UPDATE songs_register SET status = 'Pending' WHERE OPH_ID = ? AND song_id = ?",
    [ophid, song_id]
  );

  return rows;
};

const checkPaymentStatus = async (song_id) => {
  const [rows] = await db.execute(
    "SELECT sp.status FROM songs_register sr LEFT JOIN sign_up_payment sp ON sr.song_id = sp.song_id WHERE sr.song_id = ?",
    [song_id]
  );
  let nextPagePath = "";

  if (rows[0].status === null) {
    nextPagePath = "payment";
  }
  else if(rows[0].status === "rejected") 
  {
    nextPagePath = "repayment"
  }
  else if (rows[0].status === 'approved' || rows[0].status === "under review") {
    nextPagePath = "pending";
  }
  
  return nextPagePath;
};

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
  setJourneyStatus,
  checkPaymentStatus,
};
