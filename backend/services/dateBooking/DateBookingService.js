const db = require('../../DB/connect');

function normalizeBookingDate(bookingDate) {
  if (bookingDate == null || bookingDate === "") return "";
  const s = String(bookingDate).trim();
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/** reason_history may be a JSON string or already parsed by mysql2 */
function parseReasonHistory(val) {
  if (val == null) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

class DateBookingService {
  /**
   * Same rules as createBooking but uses caller's connection (no begin/commit).
   * Blocks if another oph_id holds current_booking_date; same user gets UPDATE or INSERT.
   * Call inside an existing transaction (e.g. PaymentService).
   */
  async upsertCalendarBookingInConnection(connection, ophId, bookingDate, songName = null, projectType = null, songId = null, song_id = null) {
    const resolvedSongId = songId ?? song_id ?? null;
    const ophNorm = String(ophId).trim();
    const dateStr = normalizeBookingDate(bookingDate);
    if (!dateStr || dateStr === "0000-00-00") {
      return;
    }

    const [existingBookings] = await connection.query(
      `SELECT * FROM calender WHERE current_booking_date = ? AND oph_id != ?`,
      [dateStr, ophNorm]
    );

    if (existingBookings.length > 0) {
      throw new Error("Date is already booked by another user");
    }

    const [userBookings] = await connection.query(
      `SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
      [ophNorm, dateStr]
    );

    if (userBookings.length > 0) {
      await connection.query(
        `UPDATE calender 
         SET song_id = ?, song_name = ?, project_type = ?, updated_at = NOW()
         WHERE oph_id = ? AND current_booking_date = ?`,
        [resolvedSongId, songName, projectType, ophNorm, dateStr]
      );
    } else {
      await connection.query(
        `INSERT INTO calender 
         (oph_id, current_booking_date, previous_booking_date, original_booking_date, song_id, song_name, project_type, created_at, updated_at)
         VALUES (?, ?, NULL, ?, ?, ?, ?, NOW(), NOW())`,
        [ophNorm, dateStr, dateStr, resolvedSongId, songName, projectType]
      );
    }

    if (resolvedSongId) {
      await connection.query(
        `UPDATE songs_register sr
         JOIN calender c ON c.song_id = sr.song_id
         SET sr.release_date = c.current_booking_date,
             sr.updated_at = NOW()
         WHERE sr.song_id = ?
         AND c.oph_id = ?`,
        [resolvedSongId, ophNorm]
      );
    }
  }

  /**
   * True if no other artist holds this date on the calendar (same semantics as checkReleaseDateAvailable).
   */
  async isReleaseDateFreeForOph(connection, ophId, releaseDate) {
    const dateStr = normalizeBookingDate(releaseDate);
    if (!dateStr || dateStr === "0000-00-00") return true;
    const ophNorm = String(ophId).trim();
    const [rows] = await connection.query(
      "SELECT 1 FROM calender WHERE current_booking_date = ? AND (oph_id IS NULL OR oph_id != ?) LIMIT 1",
      [dateStr, ophNorm]
    );
    return rows.length === 0;
  }

  /**
   * Create a calendar booking entry
   * Handles application logic for date booking
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} bookingDate - Booking date (YYYY-MM-DD)
   * @param {string|null} songName - Song name (if linking to song)
   * @param {string|null} projectType - Project type (if linking to song)
   * @param {number|null} songId - Song ID (if linking to song)
   */
  async createBooking(ophId, bookingDate, songName = null, projectType = null, songId = null, song_id = null) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      await this.upsertCalendarBookingInConnection(
        connection,
        ophId,
        bookingDate,
        songName,
        projectType,
        songId,
        song_id
      );
      await connection.commit();

      return {
        success: true,
        message: "Release date has been booked successfully"
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Link song to existing booked date
   * Updates calendar entry with song name, project type, and song_id
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} songName - Song name
   * @param {string} projectType - Project type
   * @param {string} releaseDate - Release date (YYYY-MM-DD)
   * @param {number|null} songId - Song ID (if available)
   */
  async linkSongToBooking(ophId, songName, projectType, releaseDate, songId = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if booking exists
      const [bookings] = await connection.query(
        `SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
        [ophId, releaseDate]
      );

      if (bookings.length === 0) {
        throw new Error('No booking found for this date');
      }

      // If songId not provided, try to find it from songs_register
      if (!songId && songName) {
        const [songs] = await connection.query(
          `SELECT song_id FROM songs_register 
           WHERE oph_id = ? AND Song_name = ? 
           ORDER BY song_id DESC LIMIT 1`,
          [ophId, songName]
        );
        if (songs.length > 0) {
          songId = songs[0].song_id;
        }
      }

      // Update booking with song details
      const [result] = await connection.query(
        `UPDATE calender 
         SET song_id = ?, song_name = ?, project_type = ?, updated_at = NOW()
         WHERE oph_id = ? AND current_booking_date = ?`,
        [songId, songName, projectType, ophId, releaseDate]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update booking');
      }

      // Sync songs_register.release_date from calender if song_id exists
      if (songId) {
        await connection.query(
          `UPDATE songs_register sr
           JOIN calender c ON c.song_id = sr.song_id
           SET sr.release_date = c.current_booking_date,
               sr.updated_at = NOW()
           WHERE sr.song_id = ?
           AND c.oph_id = ?`,
          [songId, ophId]
        );
      }

      await connection.commit();

      return {
        success: true,
        message: "Data updated successfully"
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update booking date (for date changes)
   * Handles application logic for release date changes.
   * Updates calender only; songs_register.release_date is updated only when admin
   * approves the "Release date change" payment (see admin/model/payments.js setPaymentVerification).
   *
   * @param {string} ophId - User's OPH ID
   * @param {string} oldDate - Old booking date
   * @param {string} newDate - New booking date
   * @param {string|null} reason - Reason for change (stored in reason_history)
   */
  async updateBookingDate(ophId, oldDate, newDate, reason = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if old booking exists and get song_id, existing reason_history
      const [oldBookings] = await connection.query(
        `SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
        [ophId, oldDate]
      );

      if (oldBookings.length === 0) {
        throw new Error('No booking found for the old date');
      }

      const songId = oldBookings[0].song_id;
      const existingHistory = parseReasonHistory(oldBookings[0].reason_history);

      // Check if new date is already booked by another user
      const [existingBookings] = await connection.query(
        `SELECT * FROM calender WHERE current_booking_date = ? AND oph_id != ?`,
        [newDate, ophId]
      );

      if (existingBookings.length > 0) {
        throw new Error('New date is already booked by another user');
      }

      // Prepare reason history - add current reason to history if provided
      let updatedHistory = [...existingHistory];
      if (reason && reason.trim()) {
        updatedHistory.push({
          reason: reason.trim(),
          timestamp: new Date().toISOString(),
          old_date: oldDate,
          new_date: newDate,
          status: 'pending'
        });
      }

      // Update calender (master) - single source of truth
      // Store reason and update reason_history
      const [result] = await connection.query(
        `UPDATE calender 
         SET previous_booking_date = ?, 
             current_booking_date = ?, 
             reason = ?,
             reason_history = ?,
             updated_at = NOW()
         WHERE oph_id = ? AND current_booking_date = ?`,
        [
          oldDate, 
          newDate, 
          reason && reason.trim() ? reason.trim() : null,
          JSON.stringify(updatedHistory),
          ophId, 
          oldDate
        ]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update booking');
      }

      // Do NOT update songs_register here. Release date in songs_register is updated
      // only when admin approves the "Release date change" payment (setPaymentVerification
      // in admin/model/payments.js). Until then, songs_register keeps the old date.

      await connection.commit();

      return {
        success: true,
        message: "Date Updated successfully"
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Handle date booking payment rejection
   * Removes calendar entry if payment is rejected
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} releaseDate - Release date
   */
  async handleBookingPaymentRejection(ophId, releaseDate) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete calendar entry if payment is rejected
      const [result] = await connection.query(
        `DELETE FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
        [ophId, releaseDate]
      );

      await connection.commit();

      return {
        success: true,
        deletedRows: result.affectedRows
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new DateBookingService();




