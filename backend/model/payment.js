const db = require("../DB/connect"); // MySQL connectionAdd commentMore actions

const insertPayment = async (
  OPH_ID,
  Transaction_ID,
  Review,
  Status,
  From,
  song_id,
  event_id,
  release_date
) => {
  const [result] = await db.execute(
    "INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      From,
      song_id,
      event_id,
      release_date,
    ]
  );
  return result;
};

const insertSongID = async (ophid, song_id) => {
  const [rows] = await db.execute(
    "UPDATE sign_up_payment SET song_id = ? WHERE OPH_ID = ?",
    [song_id, ophid]
  );
  return rows;
};

const songRepayment = async (
  OPH_ID,
  Transaction_ID,
  Review,
  Status,
  From,
  song_id,
  event_id,
  release_date
) => {
  let rows = [];

  console.log(
    OPH_ID,
    Transaction_ID,
    Review,
    Status,
    From,
    song_id,
    release_date
  );

  rows.push(
    await db.execute(
      "UPDATE sign_up_payment SET reject_for = ?, song_id = ? WHERE song_id = ?",
      [song_id, null, song_id]
    )
  );
  console.log("hehehe");

  rows.push(
    await db.execute(
      "INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [OPH_ID, Transaction_ID, Review, Status, From, song_id,event_id, release_date]
    )
  );

  return rows;
};

module.exports = {
  insertPayment,
  insertSongID,
  songRepayment,
};
