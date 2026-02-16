const db = require("../../DB/connect");
const ApplicationStatusService = require("../../services/application/ApplicationStatusService");
const SongApplicationStatusService = require("../../services/song/SongApplicationStatusService");

class AdminPaymentService {
  /**
   * Update payment status (Admin operation)
   * Handles application logic for updating payment status and syncing with application_status
   */
  async updatePaymentStatus(updateData) {
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const { ophId, transactionId, status, reject_reason, songId } =
        updateData;

      if (!ophId || !transactionId || !status) {
        throw new Error("ophId, transactionId, and status are required");
      }

      // Get payment details before updating to check if it's a Registration payment
      const paymentModel = require("../../model/payment");
      const paymentDetailsBefore = await paymentModel.getPaymentByTransactionId(
        connection,
        transactionId,
      );
      console.log(paymentDetailsBefore + "DDSDSD");

      if (!paymentDetailsBefore || paymentDetailsBefore.length === 0) {
        throw new Error("Payment not found");
      }

      const place = paymentDetailsBefore[0]?.from_source || null;
      console.log(place);

      const isRegistrationPayment = place === "Registration";
      const isSongPayment =
        place === "Song Registration" ||
        place === "Song Repayment" ||
        place === "Special Artist Song Registration";
      const isDateBookingPayment =
        place === "Date booking" || place === "Date Booking";
      const isReleaseDateChange = place === "Release date change";

      if (place === "Special Artist Song Registration") {
        console.log("in special artist");

        console.log(status + "sdsdsdsdsds");
        if (status === "rejected") {
          
          const [resp] = await connection.execute(
            "SELECT status FROM special_artist_songs WHERE oph_id = ? AND song_id = ?",
            [ophId, songId],
          );

          console.log(resp);
          

          if (resp && resp.length > 0) {
            const songStatus = resp[0].status;

            if (songStatus !== "rejected") {
              const [freeSongs] = await connection.execute(
                "SELECT rejected_count FROM special_artist_free_songs WHERE oph_id = ?",
                [ophId],
              );

              let rejectedCount = Number(freeSongs[0].rejected_count);

              await connection.execute(
                "UPDATE special_artist_free_songs SET rejected_count = ? WHERE oph_id = ?",
                [rejectedCount + 1, ophId],
              );
            }
          }
        }
      }

      // Check if payment is rejected
      const isRejected = status === "rejected" || status === "Rejected";

      // Get song_id before potentially moving it (needed for song_application_status update)
      const songIdBeforeUpdate = paymentDetailsBefore[0]?.song_id || songId;

      // Handle song payment rejection: move song_id to reject_for and set song_id to NULL
      if (isSongPayment && isRejected && paymentDetailsBefore[0]?.song_id) {
        const songIdValue = paymentDetailsBefore[0].song_id;
        await connection.query(
          `UPDATE payments 
           SET reject_for = ?, song_id = NULL, updated_at = NOW()
           WHERE oph_id = ? AND transaction_id = ? AND song_id = ?`,
          [songIdValue, ophId, transactionId, songIdValue],
        );
        console.log(
          `✅ Moved song_id (${songIdValue}) to reject_for and set song_id to NULL for rejected song payment`,
        );
      }

      // Handle date booking payment rejection: delete calendar entry
      if (
        isDateBookingPayment &&
        isRejected &&
        paymentDetailsBefore[0]?.release_date
      ) {
        // Delete calendar entry directly in transaction
        await connection.query(
          `DELETE FROM calender WHERE oph_id = ? AND current_booking_date = ?`,
          [ophId, paymentDetailsBefore[0].release_date],
        );
        console.log(
          `✅ Deleted calendar entry for rejected date booking payment`,
        );
      }

      // If songId is provided, update song status (for song payments)
      // Note: songId might come from request body or from payment record
      const actualSongId = songId || paymentDetailsBefore[0]?.song_id;
      if (actualSongId && isSongPayment && !isRejected) {
        // Only recalculate if not rejected (rejected payments are disassociated)
        const AdminSongService = require("./AdminSongService");
        // Recalculate song status after payment status change
        await AdminSongService.recalculateSongStatus(
          connection,
          actualSongId,
          ophId,
          null,
        );
      }

      // Update payment status in payments table
      const paymentDetailsModel = require("../model/payments");
      const result = await paymentDetailsModel.updateStatus(
        connection,
        ophId,
        transactionId,
        status,
        reject_reason,
      );

      if (result.affectedRows === 0) {
        throw new Error("No record found to update");
      }

      // Application Logic: If this is a Registration payment, update application_status
      if (isRegistrationPayment) {
        // Map payment status to application_status format
        let applicationStatus = "pending";
        if (status === "rejected" || status === "Rejected") {
          applicationStatus = "rejected";
        } else if (status === "approved" || status === "Approved") {
          applicationStatus = "approved";
        } else if (status === "under review" || status === "Under Review") {
          applicationStatus = "under review";
        }

        // Update payment_status in application_status table
        await ApplicationStatusService.updateStepStatus(
          connection,
          ophId,
          "payment",
          applicationStatus,
        );

        // Recalculate overall_status (this is done automatically in updateStepStatus, but explicit for clarity)
        await ApplicationStatusService.recalculateOverallStatus(
          connection,
          ophId,
        );
      }

      // Application Logic: If this is a Song Registration payment, update song_application_status
      if (isSongPayment) {
        // Use song_id from before update (in case it was moved to reject_for)
        const actualSongId = songIdBeforeUpdate;

        if (actualSongId) {
          // Map payment status to song_application_status format
          let paymentStatus = "pending";
          if (status === "rejected" || status === "Rejected") {
            paymentStatus = "rejected";
          } else if (status === "approved" || status === "Approved") {
            paymentStatus = "approved";
          } else if (status === "under review" || status === "Under Review") {
            paymentStatus = "under review";
          }

          // Update status_payment in song_application_status table
          await SongApplicationStatusService.updateStepStatus(
            connection,
            actualSongId,
            "payment",
            paymentStatus,
          );
        }
      }

      await connection.commit();

      // Return data needed for notifications
      return {
        success: true,
        place,
        isRegistrationPayment,
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

      const { ophId, transactionId, status, reject_reason, eventId } =
        updateData;

      // For external events, ophId might be NULL - we'll find booking by transaction_id
      if (!transactionId || !status || !eventId) {
        throw new Error("transactionId, status, and eventId are required");
      }

      // Get payment details before updating to verify it exists and get created_at
      const paymentModel = require("../../model/payment");
      const paymentDetailsBefore = await paymentModel.getPaymentByTransactionId(
        connection,
        transactionId,
      );

      if (!paymentDetailsBefore || paymentDetailsBefore.length === 0) {
        throw new Error("Payment not found");
      }

      const payment = paymentDetailsBefore[0];

      // Verify this is an event payment
      if (
        payment.from_source !== "Event Registration" &&
        payment.event_id !== parseInt(eventId)
      ) {
        throw new Error("Payment does not match event registration");
      }

      // Update payment status in payments table
      const paymentDetailsModel = require("../model/payments");

      // Check if payment is rejected
      const isRejected = status === "rejected" || status === "Rejected";

      // If payment is rejected, move event_id to reject_for and set event_id to NULL
      // For external events, ophId contains the participant name (not a valid OPH_ID)
      const result = await paymentDetailsModel.updateEventPaymentSp(
        connection,
        ophId, // Contains OPH_ID for internal users, or participant name for external users
        transactionId,
        status,
        reject_reason,
        parseInt(eventId),
        isRejected, // Pass flag to indicate if rejected
      );

      if (result.affectedRows === 0) {
        throw new Error("No record found to update");
      }

      if (isRejected) {
        console.log(
          `✅ Updated event payment to rejected - event_id: ${eventId}, transaction_id: ${transactionId}`,
        );
      }

      // Determine if this is an internal or external user
      // Internal users have OPH_ID starting with "OPH-" (e.g., "OPH-CAN-IA-021")
      // External users have names (not starting with "OPH-") or booking references starting with "EB-"
      const isInternalUser = ophId && ophId.match(/^OPH-/);
      const isBookingReference = ophId && ophId.startsWith("EB-");
      const isExternalEvent = ophId && !isInternalUser && !isBookingReference;

      if (isInternalUser) {
        // Internal users: Update event_participants table
        let participantStatus = "under review";
        if (status === "approved" || status === "Approved") {
          participantStatus = "accepted";
        } else if (status === "rejected" || status === "Rejected") {
          participantStatus = "rejected";
        } else if (status === "under review" || status === "Under Review") {
          participantStatus = "under review";
        }

        // Update or insert event_participants status
        const [updateResult] = await connection.query(
          `INSERT INTO event_participants (oph_id, event_id, status, updated_at)
           VALUES (?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE
             status = VALUES(status),
             updated_at = NOW()`,
          [ophId, parseInt(eventId), participantStatus],
        );

        if (updateResult.affectedRows > 0) {
          const action =
            updateResult.affectedRows === 1 ? "Created" : "Updated";
          console.log(
            `✅ ${action} event_participants record - oph_id: ${ophId}, event_id: ${eventId}, Status: ${participantStatus}`,
          );
        } else {
          console.warn(
            `⚠️ No event_participants record affected for oph_id: ${ophId}, event_id: ${eventId}`,
          );
        }
      } else {
        // External users: Update event_bookings table
        const EventBookingService = require("./EventBookingService");
        const EventBookingModel = require("../model/eventBookings");
        let bookingStatus = "pending";
        if (status === "approved" || status === "Approved") {
          bookingStatus = "approved";
        } else if (status === "rejected" || status === "Rejected") {
          bookingStatus = "rejected";
        }
        // If status is 'under review', keep it as 'pending'

        // For external events, find booking by transaction_id or by name
        if (isExternalEvent) {
          // First try to find by transaction_id (most reliable)
          let [bookings] = await connection.execute(
            "SELECT * FROM event_bookings WHERE payment_transaction_id = ? AND event_id = ?",
            [transactionId, parseInt(eventId, 10)],
          );

          // If not found by transaction_id, try to find by name (ophId contains the participant name)
          if (!bookings || bookings.length === 0) {
            const nameParts = ophId.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const allBookings = await EventBookingModel.getAllBookings({
              event_id: parseInt(eventId, 10),
            });

            bookings = allBookings.filter((b) => {
              if (
                `${b.first_name} ${b.last_name}`.trim().toLowerCase() ===
                ophId.trim().toLowerCase()
              ) {
                return true;
              }
              if (
                b.first_name.toLowerCase() === firstName.toLowerCase() &&
                b.last_name.toLowerCase() === lastName.toLowerCase()
              ) {
                return true;
              }
              return false;
            });
          }

          if (bookings && bookings.length > 0) {
            const booking = bookings[0];
            await EventBookingModel.updateBookingStatus(
              booking.booking_reference,
              bookingStatus,
            );
            console.log(
              `✅ Updated event_bookings record - booking_reference: ${booking.booking_reference}, Status: ${bookingStatus}`,
            );
          } else {
            console.warn(
              `⚠️ No event_bookings record found for transaction: ${transactionId} or name: ${ophId}, event_id: ${eventId}`,
            );
          }
        } else if (isBookingReference) {
          // Update booking status by reference
          await EventBookingService.updateBookingStatus(ophId, bookingStatus);
          console.log(
            `✅ Updated event_bookings record - booking_reference: ${ophId}, Status: ${bookingStatus}`,
          );
        } else {
          // Try to find booking by name and update (backward compatibility)
          const nameParts = ophId.trim().split(/\s+/);
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          const existingBookings = await EventBookingModel.getAllBookings({
            event_id: parseInt(eventId, 10),
          });

          const existingBooking = existingBookings.find((b) => {
            if (
              `${b.first_name} ${b.last_name}`.trim().toLowerCase() ===
              ophId.trim().toLowerCase()
            ) {
              return true;
            }
            if (
              b.first_name.toLowerCase() === firstName.toLowerCase() &&
              b.last_name.toLowerCase() === lastName.toLowerCase()
            ) {
              return true;
            }
            return false;
          });

          if (existingBooking) {
            await EventBookingModel.updateBookingStatus(
              existingBooking.booking_reference,
              bookingStatus,
            );
            console.log(
              `✅ Updated event_bookings record - booking_reference: ${existingBooking.booking_reference}, Status: ${bookingStatus}`,
            );
          } else {
            console.warn(
              `⚠️ No event_bookings record found for external user: ${ophId}, event_id: ${eventId}`,
            );
          }
        }
      }

      await connection.commit();

      // Return data needed for notifications
      return {
        success: true,
        place: "Event Registration",
        affectedRows: result.affectedRows,
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
