const db = require("../DB/connect");



const getSpecialArtistStatus = async (ophid) => {

  const [rows] = await db.execute("SELECT * FROM special_artist_details WHERE ophid = ? ORDER BY date DESC", [ophid])

  return rows;

}

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
          "INSERT INTO special_artist_details (ophid, field, content) VALUES (?,?,?)",
          [updates[i].ophid, updates[i].field, updates[i].content]
        )
      );
    } else if (existRows[0].status === "under review") {
      rows.push(
        await db.execute(
          "UPDATE special_artist_details SET content = ? WHERE ophid = ? AND field = ?",
          [updates[i].content, updates[i].ophid, updates[i].field]
        )
      );
    }
  }

  return rows;
};

module.exports = { editSpecialArtistDetails, getSpecialArtistStatus };
