const db = require("../DB/connect");
const moment = require("moment-timezone");

const insertBooking = async (oph_id, booking_date, song_name, project_type) => {
  const [result] = await db.execute(
    `INSERT INTO calender (oph_id, current_booking_date, previous_booking_date, original_booking_date,
    song_name, project_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [oph_id, booking_date, null, booking_date, song_name, project_type]
  );
  return result;
};

const insertSongAndProject = async (oph_id, song_name, project_type, release_date) => {
  const [rows] = await db.execute(
    "UPDATE calender SET song_name = ?, project_type = ? WHERE oph_id = ? AND current_booking_date = ?",
    [song_name, project_type ,oph_id, release_date]
  );

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
  const [result] = await db.execute(
    `UPDATE calender
     SET previous_booking_date = ?, current_booking_date = ?, reason = ?
     WHERE oph_id = ? AND current_booking_date = ?`,
    [old_booking_date, new_booking_date, reason, oph_id, old_booking_date]
  );
  return result;
};

const getAllBookings = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT 
        c.id,
        c.oph_id,
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
