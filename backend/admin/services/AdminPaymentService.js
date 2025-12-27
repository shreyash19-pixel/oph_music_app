const db = require('../../DB/connect');
const ApplicationStatusService = require('../../services/application/ApplicationStatusService');

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
      
      if (!paymentDetailsBefore || paymentDetailsBefore.length === 0) {
        throw new Error('Payment not found');
      }

      const place = paymentDetailsBefore[0]?.from_source || null;
      const isRegistrationPayment = place === "Registration";

      // If songId is provided, update song status
      if (songId) {
        const { updateSongStatus } = require('../model/songs');
        await updateSongStatus(parseInt(songId), ophId, (reject_reason || "").trim() || null);
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
}

module.exports = new AdminPaymentService();




