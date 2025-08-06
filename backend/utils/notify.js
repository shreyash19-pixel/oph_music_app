const db = require("../DB/connect");

const saveNotification = async ({
  ophid,
  message,
  title = null,
  link = null,
}) => {
  const sql = `
    INSERT INTO notifications (ophid, message, title, link)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(sql, [ophid, message, title, link]);

  return {
    id: result.insertId,
    ophid,
    message,
    title,
    link,
    read_status: false,
    created_at: new Date(),
  };
};

module.exports = { saveNotification };
