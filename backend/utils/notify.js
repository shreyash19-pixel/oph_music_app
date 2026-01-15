const db = require("../DB/connect");

const saveNotification = async ({
  ophid,
  message,
  title = null,
  link = null,
}) => {
  // Note: Parameter is 'ophid' but database column is 'oph_id'
  const sql = `
    INSERT INTO notifications (oph_id, message, title, link)
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
