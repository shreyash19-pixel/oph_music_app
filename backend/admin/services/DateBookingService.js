const db = require('../../DB/connect');
const CoreDateBookingService = require('../../services/dateBooking/DateBookingService');

class DateBookingService {
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
  async createBooking(ophId, bookingDate, songName = null, projectType = null, songId = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if date is already booked by another user
      const [existingBookings] = await connection.query(
        `SELECT * FROM calender WHERE current_booking_date = ? AND oph_id != ?`,
        [bookingDate, ophId]
      );

      if (existingBookings.length > 0) {
        throw new Error('Date is already booked by another user');
      }

      // Check if user already has a booking for this date
      const [userBookings] = await connection.query(
        `SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
        [ophId, bookingDate]
      );

      if (userBookings.length > 0) {
        // Update existing booking
        await connection.query(
          `UPDATE calender 
           SET song_id = ?, song_name = ?, project_type = ?, updated_at = NOW()
           WHERE oph_id = ? AND current_booking_date = ?`,
          [songId, songName, projectType, ophId, bookingDate]
        );
      } else {
        // Create new booking
        await connection.query(
          `INSERT INTO calender 
           (oph_id, current_booking_date, previous_booking_date, original_booking_date, song_id, song_name, project_type, created_at, updated_at)
           VALUES (?, ?, NULL, ?, ?, ?, ?, NOW(), NOW())`,
          [ophId, bookingDate, bookingDate, songId, songName, projectType]
        );
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
        message: "Booking created successfully"
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
        message: "Song linked to booking successfully"
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
   * Updates calender only; songs_register is updated when admin approves the release date change payment.
   *
   * @param {string} ophId - User's OPH ID
   * @param {string} oldDate - Old booking date
   * @param {string} newDate - New booking date
   * @param {string|null} reason - Reason for change
   */
  async updateBookingDate(ophId, oldDate, newDate, reason = null) {
    return CoreDateBookingService.updateBookingDate(
      ophId,
      oldDate,
      newDate,
      reason,
    );
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




