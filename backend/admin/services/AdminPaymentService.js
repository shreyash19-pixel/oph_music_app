const db = require('../../DB/connect');
const ApplicationStatusService = require('../../services/application/ApplicationStatusService');
const SongApplicationStatusService = require('../../services/song/SongApplicationStatusService');

class AdminPaymentService {
  /**
   * Update payment status (Admin operation)
   * Handles application logic for updating payment status and syncing with application_status
   */
  async updatePaymentStatus(updateData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { ophId, transactionId, status, reject_reason, songId } = updateData;

      if (!ophId || !transactionId || !status) {
        throw new Error('ophId, transactionId, and status are required');
      }

      // Get payment details before updating to check if it's a Registration payment
      const paymentModel = require('../../model/payment');
      const paymentDetailsBefore = await paymentModel.getPaymentByTransactionId(connection, transactionId);
      console.log(paymentDetailsBefore + "DDSDSD");
      
      if (!paymentDetailsBefore || paymentDetailsBefore.length === 0) {
        throw new Error('Payment not found');
      }

      const place = paymentDetailsBefore[0]?.from_source || null;
      const isRegistrationPayment = place === "Registration";
      const isSongPayment = place === "Song Registration" || place === "Song Repayment" || place === "Special artist song registration";
      const isDateBookingPayment = place === "Date booking" || place === "Date Booking";
      const isReleaseDateChange = place === "Release date change";

      // Check if payment is rejected
      const isRejected = status === 'rejected' || status === 'Rejected';

      // Get song_id before potentially moving it (needed for song_application_status update)
      const songIdBeforeUpdate = paymentDetailsBefore[0]?.song_id || songId;

      // Handle song payment rejection: move song_id to reject_for and set song_id to NULL
      if (isSongPayment && isRejected && paymentDetailsBefore[0]?.song_id) {
        const songIdValue = paymentDetailsBefore[0].song_id;
        await connection.query(
          `UPDATE payments 
           SET reject_for = ?, song_id = NULL, updated_at = NOW()
           WHERE oph_id = ? AND transaction_id = ? AND song_id = ?`,
          [songIdValue, ophId, transactionId, songIdValue]
        );
        console.log(`✅ Moved song_id (${songIdValue}) to reject_for and set song_id to NULL for rejected song payment`);
      }

      // Handle date booking payment rejection: delete calendar entry
      if (isDateBookingPayment && isRejected && paymentDetailsBefore[0]?.release_date) {
        // Delete calendar entry directly in transaction
        await connection.query(
          `DELETE FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
          [ophId, paymentDetailsBefore[0].release_date]
        );
        console.log(`✅ Deleted calendar entry for rejected date booking payment`);
      }

      // If songId is provided, update song status (for song payments)
      // Note: songId might come from request body or from payment record
      const actualSongId = songId || paymentDetailsBefore[0]?.song_id;
      if (actualSongId && isSongPayment && !isRejected) {
        // Only recalculate if not rejected (rejected payments are disassociated)
        const AdminSongService = require('./AdminSongService');
        // Recalculate song status after payment status change
        await AdminSongService.recalculateSongStatus(
          connection,
          actualSongId,
          ophId,
          null
        );
      }

      // Update payment status in payments table
      const paymentDetailsModel = require('../model/payments');
      const result = await paymentDetailsModel.updateStatus(
        connection,
        ophId,
        transactionId,
        status,
        reject_reason,
      );

      if (result.affectedRows === 0) {
        throw new Error('No record found to update');
      }

      // Application Logic: If this is a Registration payment, update application_status
      if (isRegistrationPayment) {
        // Map payment status to application_status format
        let applicationStatus = 'pending';
        if (status === 'rejected' || status === 'Rejected') {
          applicationStatus = 'rejected';
        } else if (status === 'approved' || status === 'Approved') {
          applicationStatus = 'approved';
        } else if (status === 'under review' || status === 'Under Review') {
          applicationStatus = 'under review';
        }

        // Update payment_status in application_status table
        await ApplicationStatusService.updateStepStatus(
          connection,
          ophId,
          'payment',
          applicationStatus
        );
        
        // Recalculate overall_status (this is done automatically in updateStepStatus, but explicit for clarity)
        await ApplicationStatusService.recalculateOverallStatus(connection, ophId);
      }

      // Application Logic: If this is a Song Registration payment, update song_application_status
      if (isSongPayment) {
        // Use song_id from before update (in case it was moved to reject_for)
        const actualSongId = songIdBeforeUpdate;
        
        if (actualSongId) {
          // Map payment status to song_application_status format
          let paymentStatus = 'pending';
          if (status === 'rejected' || status === 'Rejected') {
            paymentStatus = 'rejected';
          } else if (status === 'approved' || status === 'Approved') {
            paymentStatus = 'approved';
          } else if (status === 'under review' || status === 'Under Review') {
            paymentStatus = 'under review';
          }

          // Update status_payment in song_application_status table
          await SongApplicationStatusService.updateStepStatus(
            connection,
            actualSongId,
            'payment',
            paymentStatus
          );
        }
      }

      await connection.commit();

      // Return data needed for notifications
      return {
        success: true,
        place,
        isRegistrationPayment
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update event payment status (Admin operation)
   * Handles application logic for updating event payment status and syncing with event_participants
   */
  async updateEventPaymentStatus(updateData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { ophId, transactionId, status, reject_reason, eventId } = updateData;

      if (!ophId || !transactionId || !status || !eventId) {
        throw new Error('ophId, transactionId, status, and eventId are required');
      }

      // Get payment details before updating to verify it exists and get created_at
      const paymentModel = require('../../model/payment');
      const paymentDetailsBefore = await paymentModel.getPaymentByTransactionId(connection, transactionId);
      
      if (!paymentDetailsBefore || paymentDetailsBefore.length === 0) {
        throw new Error('Payment not found');
      }

      const payment = paymentDetailsBefore[0];
      
      // Verify this is an event payment
      if (payment.from_source !== 'Event Registration' && payment.event_id !== parseInt(eventId)) {
        throw new Error('Payment does not match event registration');
      }

      // Update payment status in payments table
      const paymentDetailsModel = require('../model/payments');
      
      // Check if payment is rejected
      const isRejected = status === 'rejected' || status === 'Rejected';
      
      // If payment is rejected, move event_id to reject_for and set event_id to NULL
      const result = await paymentDetailsModel.updateEventPaymentSp(
        connection,
        ophId,
        transactionId,
        status,
        reject_reason,
        parseInt(eventId),
        isRejected // Pass flag to indicate if rejected
      );

      if (result.affectedRows === 0) {
        throw new Error('No record found to update');
      }
      
      if (isRejected) {
        console.log(`✅ Moved event_id (${eventId}) to reject_for and set event_id to NULL for rejected payment`);
      }

      // Application Logic: Update event_participants status based on payment status
      // Map payment status to event_participants status format
      let participantStatus = 'under review';
      if (status === 'approved' || status === 'Approved') {
        participantStatus = 'accepted';
      } else if (status === 'rejected' || status === 'Rejected') {
        participantStatus = 'rejected';
      } else if (status === 'under review' || status === 'Under Review') {
        participantStatus = 'under review';
      }

      // Update or insert event_participants status
      // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both cases:
      // 1. If record exists (same oph_id + event_id), update the status
      // 2. If record doesn't exist, create it with the new status
      // This handles the case where a user makes multiple payments for the same event
      const [updateResult] = await connection.query(
        `INSERT INTO event_participants (oph_id, event_id, status, updated_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
           status = VALUES(status),
           updated_at = NOW()`,
        [ophId, parseInt(eventId), participantStatus]
      );

      if (updateResult.affectedRows > 0) {
        const action = updateResult.affectedRows === 1 ? 'Created' : 'Updated';
        console.log(`✅ ${action} event_participants record - oph_id: ${ophId}, event_id: ${eventId}, Status: ${participantStatus}`);
      } else {
        console.warn(`⚠️ No event_participants record affected for oph_id: ${ophId}, event_id: ${eventId}`);
      }

      await connection.commit();

      // Return data needed for notifications
      return {
        success: true,
        place: 'Event Registration',
        affectedRows: result.affectedRows
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new AdminPaymentService();




