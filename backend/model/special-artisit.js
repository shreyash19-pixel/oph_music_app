const db = require("../DB/connect");

const getSpecialArtistStatus = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM (SELECT sad.*, ROW_NUMBER() OVER (PARTITION BY field ORDER BY date DESC) AS rn FROM special_artist_details sad WHERE ophid = ?) t WHERE rn = 1 ORDER BY date DESC;",
    [ophid]
  );

  return rows;
};

const getSpecialArtistPic = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT personal_photo FROM user_details WHERE oph_id = ?",
    [ophid]
  );

  return rows;
};

const editSpecialArtistDetails = async (updates, len) => {
  let rows = [];

  for (let i = 0; i < len; i++) {
    const [existRows] = await db.execute(
      "SELECT `status` FROM special_artist_details WHERE ophid = ? AND field = ?",
      [updates[i].ophid, updates[i].field]
    );

    if (existRows.length === 0 || existRows[0].status === "approved") {
      rows.push(
        await db.execute(
          "INSERT INTO special_artist_details (ophid, field, content, updated_at) VALUES (?,?,?, NOW())",
          [updates[i].ophid, updates[i].field, updates[i].content]
        )
      );
    } else if (existRows[0].status === "under review") {
      rows.push(
        await db.execute(
          "UPDATE special_artist_details SET content = ?, updated_at = NOW() WHERE ophid = ? AND field = ?",
          [updates[i].content, updates[i].ophid, updates[i].field]
        )
      );
    } else if (existRows[0].status === "rejected") {
      rows.push(
        await db.execute(
          "UPDATE special_artist_details SET content = ?, status = ?, reason = ?, updated_at = NOW() WHERE ophid = ? AND field = ?",
          [
            updates[i].content,
            "under review",
            null,
            updates[i].ophid,
            updates[i].field,
          ]
        )
      );
    }
  }

  return rows;
};

module.exports = { editSpecialArtistDetails, getSpecialArtistStatus, getSpecialArtistPic };
