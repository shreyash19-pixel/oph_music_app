const db = require('../../DB/connect');

class DateBookingService {
  /**
   * Create a calendar booking entry
   * Handles application logic for date booking
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} bookingDate - Booking date (YYYY-MM-DD)
   * @param {string|null} songName - Song name (if linking to song)
   * @param {string|null} projectType - Project type (if linking to song)
   */
  async createBooking(ophId, bookingDate, songName = null, projectType = null) {
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
           SET song_name = ?, project_type = ?, updated_at = NOW()
           WHERE oph_id = ? AND current_booking_date = ?`,
          [songName, projectType, ophId, bookingDate]
        );
      } else {
        // Create new booking
        await connection.query(
          `INSERT INTO calender 
           (oph_id, current_booking_date, previous_booking_date, original_booking_date, song_name, project_type, created_at, updated_at)
           VALUES (?, ?, NULL, ?, ?, ?, NOW(), NOW())`,
          [ophId, bookingDate, bookingDate, songName, projectType]
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
   * Updates calendar entry with song name and project type
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} songName - Song name
   * @param {string} projectType - Project type
   * @param {string} releaseDate - Release date (YYYY-MM-DD)
   */
  async linkSongToBooking(ophId, songName, projectType, releaseDate) {
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

      // Update booking with song details
      const [result] = await connection.query(
        `UPDATE calender 
         SET song_name = ?, project_type = ?, updated_at = NOW()
         WHERE oph_id = ? AND current_booking_date = ?`,
        [songName, projectType, ophId, releaseDate]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update booking');
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
   * Handles application logic for release date changes
   * 
   * @param {string} ophId - User's OPH ID
   * @param {string} oldDate - Old booking date
   * @param {string} newDate - New booking date
   * @param {string|null} reason - Reason for change
   */
  async updateBookingDate(ophId, oldDate, newDate, reason = null) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if old booking exists
      const [oldBookings] = await connection.query(
        `SELECT * FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
        [ophId, oldDate]
      );

      if (oldBookings.length === 0) {
        throw new Error('No booking found for the old date');
      }

      // Check if new date is already booked by another user
      const [existingBookings] = await connection.query(
        `SELECT * FROM calender WHERE current_booking_date = ? AND oph_id != ?`,
        [newDate, ophId]
      );

      if (existingBookings.length > 0) {
        throw new Error('New date is already booked by another user');
      }

      // Update booking (calender table doesn't have a reason column)
      const [result] = await connection.query(
        `UPDATE calender 
         SET previous_booking_date = ?, current_booking_date = ?, updated_at = NOW()
         WHERE oph_id = ? AND current_booking_date = ?`,
        [oldDate, newDate, ophId, oldDate]
      );

      if (result.affectedRows === 0) {
        throw new Error('Failed to update booking');
      }

      await connection.commit();

      return {
        success: true,
        message: "Booking date updated successfully"
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




