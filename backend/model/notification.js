// models/notificationModel.js
const db = require("../DB/connect");

const getNotificationsByOphid = async (ophid) => {
  const sql = `
    SELECT id, title, message, link, read_status, created_at
    FROM notifications
    WHERE ophid = ?
    ORDER BY read_status ASC, created_at DESC
  `;
  const [rows] = await db.execute(sql, [ophid]);
  return rows;
};

const updateNotificationReadStatus = async (id) => {
  const sql = `
    UPDATE notifications
    SET read_status = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const [result] = await db.execute(sql, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getNotificationsByOphid,
  updateNotificationReadStatus,
};
