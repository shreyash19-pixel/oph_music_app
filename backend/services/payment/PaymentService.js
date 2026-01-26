const db = require('../../DB/connect');
const paymentModel = require('../../model/payment');
const ApplicationStatusService = require('../application/ApplicationStatusService');
const SongApplicationStatusService = require('../song/SongApplicationStatusService');
const songRegModel = require('../../model/songs_register');
const userModel = require('../../model/user');
// Lazy load EventBookingService to avoid potential circular dependencies
// const EventBookingService = require('../../admin/services/EventBookingService');

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
        step,
        booking_details = {}
      } = paymentData;

      console.log('[PaymentService] Processing payment:', {
        oph_id,
        from_source,
        event_id,
        song_id,
        transaction_id
      });

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

      // Determine if this is an internal or external user
      // Internal users have OPH_ID starting with "OPH-" (e.g., "OPH-CAN-IA-021")
      // External users have booking references starting with "EB-" or names
      const isInternalUser = oph_id && oph_id.match(/^OPH-/);
      const isBookingReference = oph_id && oph_id.startsWith('EB-');
      const isExternalEventBooking = (from_source === "Event Registration" && event_id) && !isInternalUser;
      
      // For external event bookings, handle booking creation/update
      // Note: We do NOT create user records for external users - details are stored in event_bookings only
      if (isExternalEventBooking) {
        // Handle event registration for external users - use event_bookings table
        try {
          // Lazy load to avoid circular dependencies
          const EventBookingService = require('../../admin/services/EventBookingService');
          
          if (isBookingReference) {
            // If OPH_ID is a booking reference, update existing booking
            await EventBookingService.updateBookingWithPayment(oph_id, transaction_id);
          } else {
            // If OPH_ID is a name (not a booking reference), try to find existing booking
            // This handles cases where payment is submitted with name instead of booking_reference
            const EventBookingModel = require('../../admin/model/eventBookings');
            
            // Try to find existing booking by name (oph_id) and event_id
            // Split name to match first_name and last_name
            const nameParts = oph_id.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            const existingBookings = await EventBookingModel.getAllBookings({
              event_id: parseInt(event_id, 10)
            });
            
            // Try multiple matching strategies
            const existingBooking = existingBookings.find(b => {
              // Exact match: "First Last" = "First Last"
              if (`${b.first_name} ${b.last_name}`.trim().toLowerCase() === oph_id.trim().toLowerCase()) {
                return true;
              }
              // Match by first name only (if last name is empty)
              if (lastName === '' && b.first_name.toLowerCase() === firstName.toLowerCase()) {
                return true;
              }
              // Match by first and last name separately
              if (b.first_name.toLowerCase() === firstName.toLowerCase() && 
                  b.last_name.toLowerCase() === lastName.toLowerCase()) {
                return true;
              }
              return false;
            });
            
            if (existingBooking) {
              // Update existing booking with payment (preserves email, instagram, profession)
              await EventBookingModel.updateBookingPayment(
                existingBooking.booking_reference, 
                transaction_id
              );
              console.log(`[PaymentService] Updated existing booking ${existingBooking.booking_reference} with payment`);
            } else {
              // No existing booking found - create booking with available details
              console.warn(`[PaymentService] No existing booking found for "${oph_id}" on event ${event_id}. Creating booking.`);
              
              // Generate booking reference
              const { generateBookingReference } = require('../../utils/bookingReference');
              const booking_reference = await generateBookingReference();
              
              // Use booking_details if provided, otherwise use minimal data
              await EventBookingModel.createBooking({
                event_id: parseInt(event_id, 10),
                first_name: booking_details.first_name || firstName,
                last_name: booking_details.last_name || lastName,
                email: booking_details.email || '',
                phone: booking_details.phone || '',
                instagram_handle: booking_details.instagram_handle || null,
                profession_id: booking_details.profession_id ? parseInt(booking_details.profession_id, 10) : null,
                booking_reference,
                status: 'pending'
              });
              
              // Update with payment transaction ID
              await EventBookingModel.updateBookingPayment(booking_reference, transaction_id);
              
              const hasDetails = booking_details.email || booking_details.phone || booking_details.instagram_handle;
              console.log(`[PaymentService] Created booking ${booking_reference} for external payment${hasDetails ? ' (with details)' : ' (minimal - missing email/instagram/profession)'}`);
            }
          }
        } catch (error) {
          // If booking creation/update fails, log but continue with payment processing
          console.warn(`[PaymentService] Error handling booking for ${oph_id}:`, error.message);
        }
      }
      
      // Handle internal users separately - use event_participants table
      if (from_source === "Event Registration" && event_id && isInternalUser) {
        // Internal users: use event_participants table
        const EventParticipantModel = require('../../admin/model/eventParticipant');
        await EventParticipantModel.registerParticipant({
          OPH_ID: oph_id,
          event_id: parseInt(event_id, 10),
          status: 'under review'
        });
        console.log(`[PaymentService] Created/updated event_participants for internal user: ${oph_id}`);
      }
      
      // For external event bookings, store the participant name in oph_id
      // Actual user details (name, email, etc.) are stored in event_bookings table
      // The name in oph_id is for reference only (foreign key constraint will be removed)
      let paymentOphId = oph_id;
      if (isExternalEventBooking) {
        // Store the participant name in oph_id for external events
        // This allows us to see the name in the payments table for reference
        // All detailed user info is stored in event_bookings table
        paymentOphId = oph_id; // Keep the name as-is
        console.log(`[PaymentService] Storing participant name "${oph_id}" in oph_id for external event booking. Full details in event_bookings.`);
      }

      // Insert payment (convert undefined to null)
      // For external bookings, use system placeholder for foreign key, but we'll track the actual name in event_bookings
      console.log('[PaymentService] Inserting payment record...');
      await paymentModel.insertPayment(
        connection,
        paymentOphId, // Use system placeholder for external bookings to satisfy foreign key
        transaction_id,
        review ?? null,
        status,
        from_source,
        song_id ?? null,
        event_id ?? null,
        release_date ?? null,
        amount ?? null
      );
      console.log('[PaymentService] Payment record inserted successfully');

      // If this is a registration payment (and not external event booking), update application status
      if (from_source === "Registration" && !isExternalEventBooking) {
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
      // For external event bookings (booking_reference or name as OPH_ID), skip user lookup
      let user = null;
      let applicationStatus = null;
      let navTo = step || '/auth/payment';
      
      if (!isExternalEventBooking) {
        // Only lookup user for registered users
        user = await userModel.findUserByOphId(connection, oph_id);
        applicationStatus = await ApplicationStatusService.getApplicationStatus(connection, oph_id);
        
        if (user && user.length > 0) {
          console.log(user[0] + "assasa");
          navTo = this.determineNavigationPath(user[0], applicationStatus, step);
        }
      } else {
        // For external bookings, use a simple success path
        navTo = '/success';
      }

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
      console.error('[PaymentService] Error in insertPayment:', {
        message: error.message,
        stack: error.stack,
        oph_id: paymentData.oph_id,
        from_source: paymentData.from_source,
        event_id: paymentData.event_id
      });
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
      
      return user?.current_step || defaultStep || '/auth/payment';
    }

    // Application completed - go to dashboard
    if (overall_status === "completed") {
      return "/dashboard";
    }
    // Default to current step
    return user?.current_step || defaultStep ||  '/auth/payment';
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

