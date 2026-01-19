const db = require("../DB/connect");
const moment = require("moment-timezone");

const insertBooking = async (oph_id, booking_date, song_name, project_type, song_id = null) => {
  const [result] = await db.execute(
    `INSERT INTO calender (oph_id, current_booking_date, previous_booking_date, original_booking_date,
    song_id, song_name, project_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [oph_id, booking_date, null, booking_date, song_id, song_name, project_type]
  );
  return result;
};

const insertSongAndProject = async (oph_id, song_name, project_type, release_date, song_id = null) => {
  // If song_id not provided, try to find it from songs_register
  let finalSongId = song_id;
  if (!finalSongId && song_name) {
    const [songs] = await db.execute(
      `SELECT song_id FROM songs_register 
       WHERE oph_id = ? AND Song_name = ? 
       ORDER BY song_id DESC LIMIT 1`,
      [oph_id, song_name]
    );
    if (songs.length > 0) {
      finalSongId = songs[0].song_id;
    }
  }

  const [rows] = await db.execute(
    "UPDATE calender SET song_id = ?, song_name = ?, project_type = ? WHERE oph_id = ? AND current_booking_date = ?",
    [finalSongId, song_name, project_type, oph_id, release_date]
  );

  // Sync songs_register.release_date from calender if song_id exists
  if (finalSongId) {
    await db.execute(
      `UPDATE songs_register sr
       JOIN calender c ON c.song_id = sr.song_id
       SET sr.release_date = c.current_booking_date,
           sr.updated_at = NOW()
       WHERE sr.song_id = ?
       AND c.oph_id = ?`,
      [finalSongId, oph_id]
    );
  }

  return rows;
};

const findBookingByDate = async (booking_date) => {
  const [rows] = await db.execute(
    "SELECT * FROM calender WHERE current_booking_date = ?",
    [booking_date]
  );
  return rows;
};

const findBookingByOphIdAndDate = async (oph_id, booking_date) => {
  const [rows] = await db.execute(
    "SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?",
    [oph_id, booking_date]
  );
  return rows;
};

const updateBooking = async (oph_id, old_booking_date, new_booking_date, reason) => {
  // Get song_id before updating
  const [oldBookings] = await db.execute(
    `SELECT song_id FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
    [oph_id, old_booking_date]
  );

  const songId = oldBookings.length > 0 ? oldBookings[0].song_id : null;

  // Update calender (calender table doesn't have a reason column)
  const [result] = await db.execute(
    `UPDATE calender
     SET previous_booking_date = ?, current_booking_date = ?, updated_at = NOW()
     WHERE oph_id = ? AND current_booking_date = ?`,
    [old_booking_date, new_booking_date, oph_id, old_booking_date]
  );

  // Sync songs_register.release_date from calender if song_id exists
  if (songId) {
    await db.execute(
      `UPDATE songs_register sr
       JOIN calender c ON c.song_id = sr.song_id
       SET sr.release_date = c.current_booking_date,
           sr.updated_at = NOW()
       WHERE sr.song_id = ?
       AND c.oph_id = ?`,
      [songId, oph_id]
    );
  }

  return result;
};

const getAllBookings = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        c.id,
        c.oph_id,
        c.song_id,
        c.current_booking_date,
        c.previous_booking_date,
        c.original_booking_date,
        c.song_name,
        c.project_type,
        c.created_at,
        c.updated_at,
        COALESCE(ud.full_name, '') as full_name
      FROM calender c 
      LEFT JOIN user_details ud ON c.oph_id = ud.oph_id`
    );

    const rowsWithIST = rows.map((row) => ({
      ...row,
      current_booking_date: row.current_booking_date
        ? moment
            .utc(row.current_booking_date)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD")
        : null,
      previous_booking_date: row.previous_booking_date
        ? moment
            .utc(row.previous_booking_date)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD")
        : null,
      original_booking_date: row.original_booking_date
        ? moment
            .utc(row.original_booking_date)
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD")
        : null,
    }));

    return rowsWithIST;
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    // If table doesn't exist or other error, return empty array instead of throwing
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
      console.log("Calendar table or column not found, returning empty array");
      return [];
    }
    throw error;
  }
};

const getAllBookingsByID = async (ophid) => {
  const [rows] = await db.execute("SELECT * FROM calender WHERE oph_id = ? AND song_name IS null AND current_booking_date >= CURDATE()", [
    ophid,
  ]);

  return rows;
};

module.exports = {
  insertBooking,
  findBookingByDate,
  findBookingByOphIdAndDate,
  updateBooking,
  getAllBookings,
  getAllBookingsByID,
  insertSongAndProject,
};
