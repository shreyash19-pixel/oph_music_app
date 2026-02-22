const db = require('../../DB/connect');
const paymentModel = require('../../model/payment');
const ApplicationStatusService = require('../application/ApplicationStatusService');
const SongApplicationStatusService = require('../song/SongApplicationStatusService');
const songRegModel = require('../../model/songs_register');
const userModel = require('../../model/user');
const costingModel = require('../../admin/model/costing');
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
              // No existing booking found by name - check for duplicate by email+phone before creating
              const bookingEmail = booking_details.email || '';
              const bookingPhone = booking_details.phone || '';
              const existingByDetails = bookingEmail && bookingPhone
                ? await EventBookingModel.checkExistingBooking(parseInt(event_id, 10), bookingEmail, bookingPhone)
                : null;

              if (existingByDetails) {
                // Update existing booking with payment (user may have started registration earlier)
                await EventBookingModel.updateBookingPayment(
                  existingByDetails.booking_reference,
                  transaction_id
                );
                console.log(`[PaymentService] Updated existing booking ${existingByDetails.booking_reference} with payment (matched by email+phone)`);
              } else {
                // Validate registration window before creating
                const EventModel = require('../../admin/model/events');
                const event = await EventModel.getEventById(parseInt(event_id, 10));
                if (!event) {
                  throw new Error('Event not found');
                }
                const { getEndOfDayIST } = require('../../utils/registrationWindow');
                const now = new Date();
                const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
                const regEnd = event.registrationEnd ? getEndOfDayIST(event.registrationEnd) : null;
                if (regStart && now < regStart) {
                  throw new Error('Registration has not started yet');
                }
                if (regEnd && now > regEnd) {
                  throw new Error('Registration has closed');
                }

                // Generate booking reference and create - only when payment is submitted
                const { generateBookingReference } = require('../../utils/bookingReference');
                const booking_reference = await generateBookingReference();

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

                await EventBookingModel.updateBookingPayment(booking_reference, transaction_id);

                const hasDetails = booking_details.email || booking_details.phone || booking_details.instagram_handle;
                console.log(`[PaymentService] Created booking ${booking_reference} on payment submit${hasDetails ? ' (with details)' : ' (minimal - missing email/instagram/profession)'}`);
              }
            }
          }
        } catch (error) {
          // If booking creation/update fails, log but continue with payment processing
          console.warn(`[PaymentService] Error handling booking for ${oph_id}:`, error.message);
        }
      }
      
      // Handle internal users separately - use event_participants table
      if (from_source === "Event Registration" && event_id && isInternalUser) {
        // Validate registration window (same as EventBookingService for external users)
        const { getEndOfDayIST } = require('../../utils/registrationWindow');
        const EventModel = require('../../admin/model/events');
        const event = await EventModel.getEventById(parseInt(event_id, 10));
        if (!event) {
          throw new Error('Event not found');
        }
        const now = new Date();
        const regStart = event.registrationStart ? new Date(event.registrationStart) : null;
        const regEnd = event.registrationEnd ? getEndOfDayIST(event.registrationEnd) : null;
        if (regStart && now < regStart) {
          throw new Error('Registration has not started yet');
        }
        if (regEnd && now > regEnd) {
          throw new Error('Registration has closed');
        }

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

      // Normalize: treat missing or invalid release_date as null so DB fallback runs
      const isInvalidDate = (v) => {
        if (v == null || v === '') return true;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          if (s === '' || s === 'null' || s === 'undefined') return true;
          if (s === '0000-00-00' || s.startsWith('0000-00-00')) return true;
        }
        return false;
      };

      let finalReleaseDate = release_date;
      if (isInvalidDate(finalReleaseDate)) finalReleaseDate = null;

      // For Song Registration / Song Repayment, resolve release_date from DB when missing
      const isSongReg = from_source && String(from_source).toLowerCase().replace(/\s+/g, ' ') === 'song registration';
      const isSongRepay = from_source && String(from_source).toLowerCase().replace(/\s+/g, ' ') === 'song repayment';
      if ((isSongReg || isSongRepay) && song_id && !finalReleaseDate) {
        console.log('[PaymentService] Release_date fallback: song_id=%s, oph_id=%s', song_id, oph_id);
        try {
          // Query by song_id only; match oph_id from row (column may be oph_id or OPH_ID)
          const [srRows] = await connection.execute(
            'SELECT * FROM songs_register WHERE song_id = ? LIMIT 1',
            [song_id]
          );
          const row = srRows?.[0];
          const rowOphId = row?.oph_id ?? row?.OPH_ID;
          const ophMatch = rowOphId == null && oph_id == null ||
            (rowOphId != null && oph_id != null && String(rowOphId).trim() === String(oph_id).trim());
          if (row && ophMatch) {
            const srDate = row.release_date ?? row.Release_date;
            if (srDate) {
              finalReleaseDate = srDate instanceof Date ? srDate.toISOString().slice(0, 10) : String(srDate).slice(0, 10);
              console.log('[PaymentService] Using release_date from songs_register:', finalReleaseDate);
            }
          }
          if (!finalReleaseDate) {
            const [calRows] = await connection.execute(
              'SELECT * FROM calender WHERE song_id = ? LIMIT 5',
              [song_id]
            );
            const calRow = Array.isArray(calRows) && calRows.length > 0
              ? calRows.find((r) => (r.oph_id ?? r.OPH_ID) == null ? oph_id == null : String(r.oph_id || r.OPH_ID).trim() === String(oph_id).trim()) || calRows[0]
              : null;
            const calDate = calRow?.current_booking_date ?? calRow?.Current_booking_date ?? calRow?.current_booking_date;
            if (calDate) {
              finalReleaseDate = calDate instanceof Date ? calDate.toISOString().slice(0, 10) : String(calDate).slice(0, 10);
              console.log('[PaymentService] Using release_date from calender:', finalReleaseDate);
            }
          }
          // Paid-in-advance lyrical: calendar may have song_id=NULL; use unlinked Date Booking
          if (!finalReleaseDate && paymentOphId) {
            const [dbRows] = await connection.execute(
              `SELECT release_date FROM payments
               WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
               AND song_id IS NULL AND (status IS NULL OR status != 'rejected')
               AND release_date IS NOT NULL AND release_date != '0000-00-00'
               ORDER BY created_at DESC LIMIT 1`,
              [paymentOphId]
            );
            const dbRow = dbRows?.[0];
            if (dbRow?.release_date) {
              const d = dbRow.release_date;
              finalReleaseDate = typeof d === "string" ? d.trim().slice(0, 10) : d instanceof Date ? d.toISOString().slice(0, 10) : null;
              if (finalReleaseDate && finalReleaseDate !== "0000-00-00") {
                console.log('[PaymentService] Using release_date from unlinked Date Booking:', finalReleaseDate);
              } else finalReleaseDate = null;
            }
          }
        } catch (e) {
          console.warn('[PaymentService] Could not resolve release_date from DB:', e.message);
        }
        if (!finalReleaseDate) {
          console.warn('[PaymentService] No release_date for Song Registration/Repayment; song_id=%s, oph_id=%s', song_id, oph_id);
        }
      }

      // Insert payment (convert undefined to null)
      console.log('[PaymentService] Inserting payment record...');
      await paymentModel.insertPayment(
        connection,
        paymentOphId,
        transaction_id,
        review ?? null,
        status,
        from_source,
        song_id ?? null,
        event_id ?? null,
        finalReleaseDate ?? null,
        amount ?? null
      );
      console.log('[PaymentService] Payment record inserted successfully');

      // Paid-in-advance + lyrical: link Date Booking payment to song when lyrical (Lyrics Service) is submitted
      if ((from_source === "Song Registration" || from_source === "Song Repayment") && song_id) {
        const [srRows] = await connection.execute(
          "SELECT release_date, project_type, Lyrics_services FROM songs_register WHERE song_id = ? AND oph_id = ? LIMIT 1",
          [song_id, paymentOphId]
        );
        const sr = srRows?.[0];
        const isPaidInAdvance = sr?.project_type && String(sr.project_type).toLowerCase().includes("paid in advance");
        const hasLyrical = sr?.Lyrics_services === true || sr?.Lyrics_services === 1 || sr?.Lyrics_services === "true";
        const costs = await costingModel.getCostsForPaymentLogic();
        const isLyricalPayment = amount && parseFloat(amount) < costs.songRegistration;
        if (isPaidInAdvance && hasLyrical && isLyricalPayment) {
          let dateToLink = null;
          if (sr?.release_date) {
            const d = sr.release_date;
            dateToLink = typeof d === "string" ? d.trim().slice(0, 10) : d instanceof Date ? d.toISOString().slice(0, 10) : null;
            if (dateToLink === "0000-00-00") dateToLink = null;
          }
          if (!dateToLink) {
            // Release date not in songs_register: find unlinked Date Booking for this oph_id
            const [dbRows] = await connection.execute(
              `SELECT release_date FROM payments
               WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
               AND song_id IS NULL AND (status IS NULL OR status != 'rejected')
               AND release_date IS NOT NULL AND release_date != '0000-00-00'
               ORDER BY created_at DESC LIMIT 1`,
              [paymentOphId]
            );
            const dbRow = dbRows?.[0];
            if (dbRow?.release_date) {
              dateToLink = typeof dbRow.release_date === "string" ? dbRow.release_date.trim().slice(0, 10) : dbRow.release_date instanceof Date ? dbRow.release_date.toISOString().slice(0, 10) : null;
            }
          }
          if (dateToLink) {
            await paymentModel.linkDateBookingPaymentToSong(
              connection,
              paymentOphId,
              song_id,
              dateToLink
            );
            // Sync release_date to songs_register if missing
            await connection.execute(
              `UPDATE songs_register SET release_date = ?, updated_at = NOW()
               WHERE song_id = ? AND oph_id = ? AND (release_date IS NULL OR release_date = '0000-00-00')`,
              [dateToLink, song_id, paymentOphId]
            );
            console.log('[PaymentService] Linked Date Booking payment to song_id=%s, release_date=%s (paid-in-advance + lyrical)', song_id, dateToLink);
          }
        }
      }

      // When user submits transaction ID for Song Registration/Repayment: add date to calendar (source of truth)
      if ((isSongReg || isSongRepay) && song_id && finalReleaseDate && String(finalReleaseDate).slice(0, 10) !== '0000-00-00') {
        try {
          const [srRows] = await connection.execute(
            `SELECT Song_name, project_type FROM songs_register WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?) LIMIT 1`,
            [song_id, paymentOphId, paymentOphId],
          );
          const row = srRows?.[0];
          const songName = row?.Song_name ?? null;
          const projectType = row?.project_type ?? null;
          const dateStr = finalReleaseDate instanceof Date ? finalReleaseDate.toISOString().slice(0, 10) : String(finalReleaseDate).slice(0, 10);
          if (songName != null || projectType != null) {
            await connection.execute(
              `INSERT INTO calender (oph_id, current_booking_date, original_booking_date, song_id, song_name, project_type, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [paymentOphId, dateStr, dateStr, song_id, songName, projectType],
            );
            console.log('[PaymentService] Calendar entry created for song_id=%s, date=%s', song_id, dateStr);
          }
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY' && e.errno !== 1062) {
            console.warn('[PaymentService] Calendar insert on payment submit:', e.message);
          }
        }
      }

      // If this is a registration payment (and not external event booking), update application status
      if (from_source === "Registration" && !isExternalEventBooking) {
        // Update payment status in application_status
        console.log(step + "step");
        console.log(status + "status");


        
        await ApplicationStatusService.updateStepStatus(
          connection,
          oph_id,
          'payment',
          status === 'approved' ? 'approved' : 'under review'
        );

        // Update user step_status if step provided
        if (step) {
          console.log("inm step");
          
          await userModel.updateStepStatus(connection, oph_id, status,  step);
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
        
        // Update payment status in song_application_status
        // For paid-in-advance + lyrical: recompute from BOTH Date Booking and lyrical payments
        const [srCheck] = await connection.execute(
          "SELECT project_type, Lyrics_services FROM songs_register WHERE song_id = ? AND oph_id = ? LIMIT 1",
          [song_id, oph_id]
        );
        const sr = srCheck?.[0];
        const isPaidAdvanceLyrical = sr?.project_type && String(sr.project_type).toLowerCase().includes("paid in advance")
          && (sr.Lyrics_services === true || sr.Lyrics_services === 1 || sr.Lyrics_services === "true");
        if (isPaidAdvanceLyrical) {
          await SongApplicationStatusService.recomputePaymentStatusFromPayments(connection, song_id, oph_id);
        } else {
          await SongApplicationStatusService.updateStepStatus(connection, song_id, 'payment', paymentStatus);
        }
        
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
        const songDetails = SongRegistrationService.getNextRejectedSection(song_id, oph_id, 'payment');
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

    console.log(user_status, professional_status, documentation_status, payment_status, overall_status);
    

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
      
      console.log(user?.current_step);
      
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
   * Insert song ID into payment record (paid-in-advance flow).
   * Links both Song Registration and Date Booking payments to the song.
   */
  async insertSongId(ophId, songId) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Update Song Registration payment with song_id (if any)
      await paymentModel.insertSongId(connection, ophId, songId);

      // Get song's release_date to link Date Booking payment (paid-in-advance)
      const [srRows] = await connection.execute(
        "SELECT release_date FROM songs_register WHERE song_id = ? AND oph_id = ? LIMIT 1",
        [songId, ophId]
      );
      const releaseDate = srRows?.[0]?.release_date;
      if (releaseDate) {
        await paymentModel.linkDateBookingPaymentToSong(
          connection,
          ophId,
          songId,
          releaseDate
        );
      }

      // Update song status to "under review"
      await songRegModel.updateSongStatusToUnderReview(connection, songId, ophId);

      // Get payment status to update song_application_status
      // Include Date Booking (paid-in-advance payments)
      const [payments] = await connection.execute(
        `SELECT status FROM payments 
         WHERE song_id = ? AND oph_id = ? 
         AND (from_source = 'Song Registration' OR from_source = 'Song Repayment' 
              OR from_source = 'Date booking' OR from_source = 'Date Booking')
         ORDER BY created_at DESC LIMIT 1`,
        [songId, ophId]
      );

      if (payments.length > 0) {
        const paymentStatus =
          payments[0].status === "approved" ? "approved" : "under review";
        await SongApplicationStatusService.updateStepStatus(
          connection,
          songId,
          "payment",
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

      const isInvalidDateRepay = (v) => {
        if (v == null || v === '') return true;
        if (typeof v === 'string') {
          const s = v.trim().toLowerCase();
          if (s === '' || s === 'null' || s === 'undefined' || s === '0000-00-00' || s.startsWith('0000-00-00')) return true;
        }
        return false;
      };

      let finalReleaseDate = release_date;
      if (isInvalidDateRepay(finalReleaseDate)) finalReleaseDate = null;

      if (song_id && !finalReleaseDate) {
        console.log('[PaymentService] songRepayment release_date fallback: song_id=%s, oph_id=%s', song_id, oph_id);
        try {
          // 1) Unlinked Date Booking (most reliable for paid-in-advance lyrical)
          if (oph_id) {
            const [dbRows] = await connection.execute(
              `SELECT release_date FROM payments
               WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
               AND song_id IS NULL AND (status IS NULL OR status != 'rejected')
               AND release_date IS NOT NULL AND release_date != '0000-00-00'
               ORDER BY created_at DESC LIMIT 1`,
              [oph_id]
            );
            const dbRow = dbRows?.[0];
            if (dbRow?.release_date) {
              const d = dbRow.release_date;
              const parsed = typeof d === "string" ? d.trim().slice(0, 10) : d instanceof Date ? d.toISOString().slice(0, 10) : null;
              if (parsed && parsed !== "0000-00-00") {
                finalReleaseDate = parsed;
                console.log('[PaymentService] songRepayment: using release_date from unlinked Date Booking:', finalReleaseDate);
              }
            }
          }
          // 2) songs_register
          if (!finalReleaseDate) {
            const [srRows] = await connection.execute(
              'SELECT * FROM songs_register WHERE song_id = ? LIMIT 1',
              [song_id]
            );
            const row = srRows?.[0];
            const rowOphId = row?.oph_id ?? row?.OPH_ID;
            const ophMatch = rowOphId == null && oph_id == null ||
              (rowOphId != null && oph_id != null && String(rowOphId).trim() === String(oph_id).trim());
            if (row && ophMatch) {
              const srDate = row.release_date ?? row.Release_date;
              if (srDate) {
                const parsed = srDate instanceof Date ? srDate.toISOString().slice(0, 10) : String(srDate).slice(0, 10);
                if (parsed && parsed !== "0000-00-00") finalReleaseDate = parsed;
              }
            }
          }
          // 3) Calendar by song_id or oph_id
          if (!finalReleaseDate) {
            let calRow = null;
            const [calRows] = await connection.execute(
              'SELECT * FROM calender WHERE song_id = ? LIMIT 5',
              [song_id]
            );
            if (Array.isArray(calRows) && calRows.length > 0) {
              calRow = calRows.find((r) => (r.oph_id ?? r.OPH_ID) == null ? oph_id == null : String(r.oph_id || r.OPH_ID).trim() === String(oph_id).trim()) || calRows[0];
            }
            if (!calRow && oph_id) {
              const [ophCalRows] = await connection.execute(
                'SELECT * FROM calender WHERE oph_id = ? AND song_id IS NULL AND current_booking_date >= CURDATE() ORDER BY current_booking_date ASC LIMIT 5',
                [oph_id]
              );
              calRow = Array.isArray(ophCalRows) && ophCalRows.length > 0 ? ophCalRows[0] : null;
            }
            const calDate = calRow?.current_booking_date ?? calRow?.Current_booking_date;
            if (calDate) {
              const parsed = calDate instanceof Date ? calDate.toISOString().slice(0, 10) : String(calDate).slice(0, 10);
              if (parsed && parsed !== "0000-00-00") finalReleaseDate = parsed;
            }
          }
        } catch (e) {
          console.warn('[PaymentService] songRepayment: could not resolve release_date:', e.message);
        }
      }

      await paymentModel.insertPayment(
        connection,
        oph_id,
        transaction_id,
        review ?? null,
        status,
        "Song Registration",
        song_id ?? null,
        event_id ?? null,
        finalReleaseDate ?? null,
        amount ?? null
      );

      // Paid-in-advance + lyrical: link Date Booking payment to song and sync release_date
      if (song_id) {
        const [srRows] = await connection.execute(
          "SELECT release_date, project_type, Lyrics_services FROM songs_register WHERE song_id = ? AND oph_id = ? LIMIT 1",
          [song_id, oph_id]
        );
        const sr = srRows?.[0];
        const isPaidInAdvance = sr?.project_type && String(sr.project_type).toLowerCase().includes("paid in advance");
        const hasLyrical = sr?.Lyrics_services === true || sr?.Lyrics_services === 1 || sr?.Lyrics_services === "true";
        const costs = await costingModel.getCostsForPaymentLogic();
        const isLyricalPayment = amount && parseFloat(amount) < costs.songRegistration;
        if (isPaidInAdvance && hasLyrical && isLyricalPayment) {
          let dateToLink = null;
          if (sr?.release_date) {
            const d = sr.release_date;
            dateToLink = typeof d === "string" ? d.trim().slice(0, 10) : d instanceof Date ? d.toISOString().slice(0, 10) : null;
            if (dateToLink === "0000-00-00") dateToLink = null;
          }
          if (!dateToLink) {
            const [dbRows] = await connection.execute(
              `SELECT release_date FROM payments
               WHERE oph_id = ? AND (from_source = 'Date booking' OR from_source = 'Date Booking')
               AND song_id IS NULL AND (status IS NULL OR status != 'rejected')
               AND release_date IS NOT NULL AND release_date != '0000-00-00'
               ORDER BY created_at DESC LIMIT 1`,
              [oph_id]
            );
            const dbRow = dbRows?.[0];
            if (dbRow?.release_date) {
              dateToLink = typeof dbRow.release_date === "string" ? dbRow.release_date.trim().slice(0, 10) : dbRow.release_date instanceof Date ? dbRow.release_date.toISOString().slice(0, 10) : null;
            }
          }
          if (dateToLink) {
            await paymentModel.linkDateBookingPaymentToSong(connection, oph_id, song_id, dateToLink);
            await connection.execute(
              `UPDATE songs_register SET release_date = ?, updated_at = NOW()
               WHERE song_id = ? AND oph_id = ? AND (release_date IS NULL OR release_date = '0000-00-00')`,
              [dateToLink, song_id, oph_id]
            );
            // Update the lyrical payment row we just inserted (release_date was 0000-00-00)
            await connection.execute(
              `UPDATE payments SET release_date = ?, updated_at = NOW()
               WHERE song_id = ? AND oph_id = ? AND from_source = 'Song Registration'
               AND amount < ? ORDER BY created_at DESC LIMIT 1`,
              [dateToLink, song_id, oph_id, costs.songRegistration]
            );
            console.log('[PaymentService] songRepayment: linked Date Booking to song_id=%s, release_date=%s', song_id, dateToLink);
          }
        }
      }

      // Add date to calendar when user submits transaction ID (source of truth)
      if (song_id && finalReleaseDate && String(finalReleaseDate).slice(0, 10) !== '0000-00-00') {
        try {
          const [srRows] = await connection.execute(
            `SELECT Song_name, project_type FROM songs_register WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?) LIMIT 1`,
            [song_id, oph_id, oph_id],
          );
          const row = srRows?.[0];
          const songName = row?.Song_name ?? null;
          const projectType = row?.project_type ?? null;
          const dateStr = finalReleaseDate instanceof Date ? finalReleaseDate.toISOString().slice(0, 10) : String(finalReleaseDate).slice(0, 10);
          if (songName != null || projectType != null) {
            await connection.execute(
              `INSERT INTO calender (oph_id, current_booking_date, original_booking_date, song_id, song_name, project_type, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [oph_id, dateStr, dateStr, song_id, songName, projectType],
            );
            console.log('[PaymentService] songRepayment: calendar entry created for song_id=%s', song_id);
          }
        } catch (e) {
          if (e.code !== 'ER_DUP_ENTRY' && e.errno !== 1062) {
            console.warn('[PaymentService] songRepayment calendar insert:', e.message);
          }
        }
      }

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

