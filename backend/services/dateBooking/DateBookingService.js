const db = require('../../DB/connect');
const {
  normalizeCalendarDateOnly,
  parseReasonHistory,
  isWithinFiveDaysOfToday,
} = require('../../utils/calendarDateUtils');
const {
  isNewDateBlockedForReleaseDateChange,
} = require('../../utils/releaseDateChangeQueries');

function normalizeBookingDate(bookingDate) {
  return normalizeCalendarDateOnly(bookingDate) || "";
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
    if (!dateStr) return true;
    return !(await isNewDateBlockedForReleaseDateChange(connection, ophId, dateStr));
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
   * Record a pending release date change (calendar stays on old date until admin approves).
   * Callable with an existing connection (PaymentService) or standalone transaction.
   */
  async updateBookingDateInConnection(
    connection,
    ophId,
    oldDate,
    newDate,
    reason = null,
    options = {},
  ) {
    const ophNorm = String(ophId).trim();
    const oldStr = normalizeBookingDate(oldDate);
    const newStr = normalizeBookingDate(newDate);

    if (!oldStr || !newStr) {
      throw new Error('Invalid old or new booking date');
    }
    if (oldStr === newStr) {
      throw new Error('New date must be different from the current blocked date');
    }
    if (isWithinFiveDaysOfToday(oldStr)) {
      throw new Error('You cannot change dates that are within 5 days of today');
    }

    const [oldBookings] = await connection.query(
      `SELECT * FROM calender
       WHERE oph_id = ?
         AND (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)`,
      [ophNorm, oldStr, oldStr],
    );

    if (oldBookings.length === 0) {
      throw new Error('No booking found for the old date');
    }

    const existingHistory = parseReasonHistory(oldBookings[0].reason_history);
    const lastPending = [...existingHistory].reverse().find((e) => e.status === 'pending');
    if (lastPending && normalizeCalendarDateOnly(lastPending.new_date) === newStr) {
      return { success: true, message: 'Release date change already recorded', idempotent: true };
    }

    if (await isNewDateBlockedForReleaseDateChange(connection, ophNorm, newStr, options)) {
      throw new Error('New date is already booked or reserved pending approval');
    }

    const updatedHistory = [...existingHistory];
    updatedHistory.push({
      reason: reason && reason.trim() ? reason.trim() : null,
      timestamp: new Date().toISOString(),
      old_date: oldStr,
      new_date: newStr,
      status: 'pending',
    });

    const [result] = await connection.query(
      `UPDATE calender
       SET reason = ?,
           reason_history = ?,
           updated_at = NOW()
       WHERE oph_id = ?
         AND (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)`,
      [
        reason && reason.trim() ? reason.trim() : null,
        JSON.stringify(updatedHistory),
        ophNorm,
        oldStr,
        oldStr,
      ],
    );

    if (result.affectedRows === 0) {
      throw new Error('Failed to record release date change');
    }

    return { success: true, message: 'Release date change submitted for approval' };
  }

  /**
   * Apply approved release date change: move calender to new date; songs_register updates in admin verify.
   */
  async applyApprovedReleaseDateChange(connection, ophId, oldDate, newDate) {
    const ophNorm = String(ophId).trim();
    const oldStr = normalizeBookingDate(oldDate);
    const newStr = normalizeBookingDate(newDate);
    if (!oldStr || !newStr) return { applied: false };

    if (
      await isNewDateBlockedForReleaseDateChange(connection, ophNorm, newStr, {
        excludeOphPending: true,
      })
    ) {
      throw new Error('New date is no longer available');
    }

    const [rows] = await connection.query(
      `SELECT reason_history FROM calender
       WHERE oph_id = ?
         AND (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)`,
      [ophNorm, oldStr, oldStr],
    );
    if (rows.length === 0) return { applied: false };

    const history = parseReasonHistory(rows[0].reason_history).map((item, index, arr) => {
      if (index === arr.length - 1 && item.status === 'pending') {
        return { ...item, status: 'approved', approved_at: new Date().toISOString() };
      }
      return item;
    });

    const [result] = await connection.query(
      `UPDATE calender
       SET previous_booking_date = ?,
           current_booking_date = ?,
           reason = NULL,
           reason_history = ?,
           updated_at = NOW()
       WHERE oph_id = ?
         AND (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)`,
      [oldStr, newStr, JSON.stringify(history), ophNorm, oldStr, oldStr],
    );

    return { applied: result.affectedRows > 0 };
  }

  /**
   * Clear pending release date change on reject (calendar was never moved to the new date).
   */
  async clearPendingReleaseDateChangeOnReject(connection, ophId, newDate, rejectReason) {
    const ophNorm = String(ophId).trim();
    const newStr = normalizeBookingDate(newDate);
    if (!ophNorm || !newStr) return { cleared: false };

    const [rows] = await connection.query(
      `SELECT reason_history FROM calender WHERE oph_id = ? LIMIT 1`,
      [ophNorm],
    );

    if (rows.length === 0) return { cleared: false };

    const history = parseReasonHistory(rows[0].reason_history).map((item, index, arr) => {
      if (index === arr.length - 1 && item.status === 'pending') {
        return {
          ...item,
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          admin_reject_reason: rejectReason,
        };
      }
      return item;
    });

    await connection.query(
      `UPDATE calender
       SET reason = NULL,
           reason_history = ?,
           updated_at = NOW()
       WHERE oph_id = ?`,
      [JSON.stringify(history), ophNorm],
    );

    return { cleared: true };
  }

  /**
   * Update booking date (for date changes) — records pending change; public API unchanged.
   */
  async updateBookingDate(ophId, oldDate, newDate, reason = null) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();
      const response = await this.updateBookingDateInConnection(
        connection,
        ophId,
        oldDate,
        newDate,
        reason,
      );
      await connection.commit();
      return response;
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
module.exports.parseReasonHistory = parseReasonHistory;
module.exports.normalizeBookingDate = normalizeBookingDate;




