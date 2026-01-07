const db = require('../../DB/connect');
const paymentModel = require('../../model/payment');
const ApplicationStatusService = require('../application/ApplicationStatusService');
const SongApplicationStatusService = require('../song/SongApplicationStatusService');
const songRegModel = require('../../model/songs_register');
const userModel = require('../../model/user');

class PaymentService {
  /**
   * Insert payment and update application status
   */
  async insertPayment(paymentData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        oph_id,
        transaction_id,
        review,
        status,
        from_source,
        song_id,
        event_id,
        release_date,
        old_release_date,
        amount,
        step
      } = paymentData;

      // Validate: only one of song_id or event_id should be present
      if (song_id && event_id) {
        throw new Error('Only one of song_id or event_id should be provided.');
      }

      // Handle release date change logic
      if (from_source === "Release date change" && old_release_date) {
        // Move old release_date to reject_for and clear release_date for old payment
        await connection.execute(
          "UPDATE payments SET reject_for = ?, release_date = NULL, updated_at = NOW() WHERE release_date = ? AND oph_id = ? AND (from_source = ? OR from_source = ?)",
          [
            old_release_date,
            old_release_date,
            oph_id,
            "Date booking",
            "Release date change",
          ]
        );
      }

      // Insert payment (convert undefined to null)
      await paymentModel.insertPayment(
        connection,
        oph_id,
        transaction_id,
        review ?? null,
        status,
        from_source,
        song_id ?? null,
        event_id ?? null,
        release_date ?? null,
        amount ?? null
      );

      // If this is a registration payment, update application status
      if (from_source === "Registration") {
        // Update payment status in application_status
        await ApplicationStatusService.updateStepStatus(
          connection,
          oph_id,
          'payment',
          status === 'approved' ? 'approved' : 'under review'
        );

        // Update user step_status if step provided
        if (step) {
          await userModel.updateStepStatus(connection, oph_id, step);
        }
      }

      // If this is a song registration payment and song_id is provided, update payment status
      let nextRejectedSection = null;
      let redirectPath = null;
      let songName = '';
      
      if ((from_source === "Song Registration" || from_source === "Song Repayment") && song_id) {
        // Normalize payment status
        const paymentStatus = status === 'approved' ? 'approved' : 'under review';
        
        // Update payments table status to ensure it's 'under review' (normalize case and clear reject_reason)
        await connection.execute(
          `UPDATE payments 
           SET status = ?, reject_reason = NULL, updated_at = NOW()
           WHERE song_id = ? AND oph_id = ? 
           AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')
           ORDER BY created_at DESC LIMIT 1`,
          [paymentStatus, song_id, oph_id]
        );
        
        // Update payment status in song_application_status (centralized status management)
        await SongApplicationStatusService.updateStepStatus(
          connection,
          song_id,
          'payment',
          paymentStatus
        );
        
        // Check for next rejected section after resubmitting payment
        const SongRegistrationService = require('../song/SongRegistrationService');
        const nextSection = await SongRegistrationService.getNextRejectedSection(song_id, oph_id, 'payment');
        nextRejectedSection = nextSection.nextRejectedSection;
        redirectPath = nextSection.redirectPath;
        songName = nextSection.songName;
      }

      // Determine navigation path
      const user = await userModel.findUserByOphId(connection, oph_id);
      const applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, oph_id);
      
      const navTo = this.determineNavigationPath(user[0], applicationStatus, step);

      await connection.commit();

      // Get song details if this is a song payment
      let songId = null;
      let releaseDate = null;
      let projectType = null;
      let lyricalServices = null;
      
      if ((from_source === "Song Registration" || from_source === "Song Repayment") && song_id) {
        const SongRegistrationService = require('../song/SongRegistrationService');
        const songDetails = await SongRegistrationService.getNextRejectedSection(song_id, oph_id, 'payment');
        songId = songDetails.songId;
        releaseDate = songDetails.releaseDate;
        projectType = songDetails.projectType;
        lyricalServices = songDetails.lyricalServices;
      }

      return {
        success: true,
        message: "Payment ID sent for verification",
        step: navTo,
        nextRejectedSection: nextRejectedSection,
        redirectPath: redirectPath,
        songName: songName,
        songId: songId,
        releaseDate: releaseDate,
        projectType: projectType,
        lyricalServices: lyricalServices
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Determine navigation path after payment
   */
  determineNavigationPath(user, applicationStatus, defaultStep) {
    if (!applicationStatus) {
      return defaultStep || '/auth/payment';
    }

    const { user_status, professional_status, documentation_status, payment_status, overall_status } = applicationStatus;

    // All steps under review - show status page
    if (
      user_status === "under review" &&
      professional_status === "under review" &&
      documentation_status === "under review" &&
      payment_status === "under review"
    ) {
      return "/auth/profile-status";
    }

    // Check for rejected steps (priority order)
    if (payment_status === "rejected") {
      return "/auth/payment";
    }
    if (user_status === "rejected") {
      return "/auth/create-profile/personal-details";
    }
    if (professional_status === "rejected") {
      return "/auth/create-profile/professional-details";
    }
    if (documentation_status === "rejected") {
      return "/auth/create-profile/documentation-details";
    }

    // Any step under review - go to current step
    if (
      user_status === "under review" ||
      professional_status === "under review" ||
      documentation_status === "under review" ||
      payment_status === "under review"
    ) {
      return defaultStep || user?.step_status || '/auth/payment';
    }

    // Application completed - go to dashboard
    if (overall_status === "completed") {
      return "/dashboard";
    }

    // Default to current step
    return defaultStep || user?.step_status || '/auth/payment';
  }

  /**
   * Insert song ID into payment record
   */
  async insertSongId(ophId, songId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update payment with song_id
      await paymentModel.insertSongId(connection, ophId, songId);

      // Update song status to "under review"
      await songRegModel.updateSongStatusToUnderReview(connection, songId, ophId);

      // Get payment status to update song_application_status
      const [payments] = await connection.execute(
        "SELECT status FROM payments WHERE song_id = ? AND oph_id = ? AND (from_source = 'Song Registration' OR from_source = 'Song Repayment') ORDER BY created_at DESC LIMIT 1",
        [songId, ophId]
      );

      if (payments.length > 0) {
        const paymentStatus = payments[0].status === 'approved' ? 'approved' : 'under review';
        await SongApplicationStatusService.updateStepStatus(
          connection,
          songId,
          'payment',
          paymentStatus
        );
      }

      await connection.commit();
      return { success: true, message: "Data updated successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Handle song repayment
   */
  async songRepayment(paymentData) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const {
        oph_id,
        transaction_id,
        review,
        status,
        song_id,
        event_id,
        release_date,
        amount
      } = paymentData;

      // Update existing payment to set reject_for and clear song_id
      await connection.execute(
        "UPDATE payments SET reject_for = ?, song_id = ? WHERE song_id = ? AND oph_id = ?",
        [song_id, null, song_id, oph_id]
      );

      // Insert new payment record (convert undefined to null)
      await paymentModel.insertPayment(
        connection,
        oph_id,
        transaction_id,
        review ?? null,
        status,
        "Song Registration",
        song_id ?? null,
        event_id ?? null,
        release_date ?? null,
        amount ?? null
      );

      // If song_id is provided, update song status and payment status
      if (song_id) {
        // Update song status to "under review"
        await songRegModel.updateSongStatusToUnderReview(connection, song_id, oph_id);

        // Update payment status in song_application_status to 'under review'
        await SongApplicationStatusService.updateStepStatus(
          connection,
          song_id,
          'payment',
          status === 'approved' ? 'approved' : 'under review'
        );
      }

      await connection.commit();

      return { success: true, message: "Data updated successfully" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new PaymentService();

