const db = require("../../DB/connect");

const getAllPageMedia = async () => {
  const [rows] = await db.execute("SELECT * FROM page_media");
  return rows;
};

const getPageMediaByName = async (pageName) => {
  const [rows] = await db.execute(
    "SELECT * FROM page_media WHERE page_name = ?",
    [pageName],
  );
  return rows[0];
};

const updatePageMedia = async (pageName, thumbnailUrl, videoUrl) => {
  const [result] = await db.execute(
    `INSERT INTO page_media (page_name, thumbnail_url, video_url) 
     VALUES (?, ?, ?) 
     ON DUPLICATE KEY UPDATE 
     thumbnail_url = VALUES(thumbnail_url), 
     video_url = VALUES(video_url)`,
    [pageName, thumbnailUrl, videoUrl]
  );
  return result.affectedRows > 0;
};

module.exports = {
  getAllPageMedia,
  getPageMediaByName,
  updatePageMedia,
};
