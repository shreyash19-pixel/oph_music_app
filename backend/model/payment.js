const db = require("../DB/connect"); // MySQL connectionAdd commentMore actions

const insertPayment = async (
  OPH_ID,
  Transaction_ID,
  Review,
  Status,
  From,
  song_id,
  event_id,
  release_date,
  old_release_date,
  amount
) => {
  if (From === "Release date change") {
    await db.execute(
      "UPDATE sign_up_payment SET reject_for = ?, release_date = ? WHERE release_date = ? AND (`From` = ? OR `From` = ?)",
      [
        old_release_date,
        null,
        old_release_date,
        "Date booking",
        "Release date change",
      ]
    );
  }

  const [result] = await db.execute(
    "INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id, release_date, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      From,
      song_id,
      event_id,
      release_date,
      amount || null,
    ]
  );
  return result;
};

const insertSongID = async (ophid, song_id) => {
  const [rows] = await db.execute(
    "UPDATE sign_up_payment SET song_id = ? WHERE OPH_ID = ? AND `From` = 'Song Registration' AND song_id IS NULL",
    [song_id, ophid]
  );
  return rows;
};

const songRepayment = async (
  OPH_ID,
  Transaction_ID,
  Review,
  Status,
  song_id,
  event_id,
  release_date,
  amount
) => {
  let rows = [];

  console.log(OPH_ID, Transaction_ID, Review, Status, song_id, release_date);

  rows.push(
    await db.execute(
      "UPDATE sign_up_payment SET reject_for = ?, song_id = ? WHERE song_id = ? AND OPH_ID = ?",
      [song_id, null, song_id, OPH_ID]
    )
  );

  rows.push(
    await db.execute(
      "INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id, release_date, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        OPH_ID,
        Transaction_ID,
        Review,
        Status,
        "Song Registration",
        song_id,
        event_id,
        release_date,
        amount || null,
      ]
    )
  );

  return rows;
};

module.exports = {
  insertPayment,
  insertSongID,
  songRepayment,
};
