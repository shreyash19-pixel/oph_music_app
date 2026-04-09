const payment_details = require("../model/payments");
const { saveNotification } = require("../../utils/notify");
const { updateSongStatus } = require("../model/songs");
const AdminPaymentService = require("../services/AdminPaymentService");
const { Resend } = require('resend');

const resend = new Resend('re_XMPVxrwG_5piBuXZ9ti12ovEuQC7RVuV5');

const updateStatus = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, songId } = req.body;

    console.log("updateStatus received body:", req.body);
    console.log(
      "ophId:",
      ophId,
      "transactionId:",
      transactionId,
      "status:",
      status,
    );

    // Handle both camelCase and snake_case
    const ophIdValue = ophId || req.body.oph_id;
    const transactionIdValue = transactionId || req.body.transaction_id;
    const statusValue = status || req.body.Status;

    if (!ophIdValue || !transactionIdValue || !statusValue) {
      return res.status(400).json({
        message: "ophId, transactionId, and status are required",
        received: {
          ophId: ophIdValue,
          transactionId: transactionIdValue,
          status: statusValue,
        },
      });
    }

    if (req.user?.role === "accounts member") {
      const rows = await payment_details.getPaymentDetailsByTransactionId(
        transactionIdValue,
      );
      const fromSource = rows?.[0]?.from_source ?? rows?.[0]?.From;
      const fs = String(fromSource || "").trim().toLowerCase();
      if (fromSource === "Registration") {
        return res.status(403).json({
          success: false,
          message:
            "Your role cannot approve or reject signup registration payments.",
        });
      }
      const isSongRelatedPayment =
        fs === "song registration" ||
        fs === "song repayment" ||
        fs.includes("special artist song");
      if (isSongRelatedPayment) {
        return res.status(403).json({
          success: false,
          message:
            "Your role cannot approve or reject song registration payments.",
        });
      }
    }

    // Use AdminPaymentService to handle all admin application logic
    const result = await AdminPaymentService.updatePaymentStatus({
      ophId: ophIdValue,
      transactionId: transactionIdValue,
      status: statusValue,
      reject_reason,
      songId,
    });

    const paymentDetails = await payment_details.getPaymentDetailsByTransactionId(transactionIdValue);
    if (!paymentDetails || paymentDetails.length === 0) {
      return res.status(404).json({ message: "Payment not found after update" });
    }
    const place = paymentDetails[0].from_source || paymentDetails[0].From || "Payment";

    let link = null;
    if (status === "rejected") {
      switch (place) {
        case "Song Registration":
          link = "/dashboard/upload-song";
          break;
        case "Event Registration":
          link = "/dashboard/events";
          break;
        case "Date booking":
          link = "/dashboard/time-calendar";
          break;
        case "Special artist song registration":
          link = "/dashboard/special-artist-song";
          break;
        default:
          link = null;
      }
    }

    const message =
      status === "rejected"
        ? `Your payment with Transaction ID: ${transactionId} has been ${status} for ${place} due to ${reject_reason}.`
        : `Your payment with Transaction ID: ${transactionId} has been ${status} for ${place}.`;

    const noificationPayload = {
      ophid: ophId,
      message: message,
      title: `Payment ${status} for ${place}`,
      link: link,
    };
    await saveNotification(noificationPayload);
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const userSocketId = onlineUsers.get(ophId);
    if (userSocketId) {
      io.to(userSocketId).emit("Payment-update", noificationPayload);
    }

    // Send email if payment is approved
    if (status === "approved") {
      console.log("Payment approved, fetching user email...");
      const db = require("../../DB/connect");
      const [userDetails] = await db.execute("SELECT email, full_name FROM user_details WHERE oph_id = ?", [ophId]);
      const userEmail = userDetails[0]?.email;
      const userName = userDetails[0]?.full_name;
      
      if (userEmail) {
        let emailSubject = 'Payment Approved!';
        let emailBody = '';
        
        if (place === "Song Registration") {
          emailSubject = 'Song Successfully Registered!';
          emailBody = `
            <p>Hi ${userName || 'Artist'},</p>
            <p>Great news! Your song has been successfully registered.</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>You can view your song details in your dashboard.</p>
            <br/>
            <p>Best regards,<br/>
            OPH Community Team<br/>
            <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`;
        } else if (place === "Date booking") {
          const releaseDate = paymentDetails[0]?.release_date || 'your selected date';
          emailSubject = 'Date Booking Successful!';
          emailBody = `
            <p>Hi ${userName || 'Artist'},</p>
            <p>Great news! Your time calendar date has been successfully booked.</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>Release Date: ${releaseDate}</p>
            <p>You can view your booking details in your dashboard.</p>
            <br/>
            <p>Best regards,<br/>
            OPH Community Team<br/>
            <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`;
        } else {
          emailBody = `
            <p>Hi ${userName || 'Artist'},</p>
            <p>Great news! Your payment has been approved.</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>You can now access your dashboard and start using our services.</p>
            <br/>
            <p>Best regards,<br/>
            OPH Community Team<br/>
            <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`;
        }
        
        console.log("Sending payment confirmation email to:", userEmail);
        const emailResult = await resend.emails.send({
          from: 'OPH Community <creators@ophcommunity.org>',
          to: userEmail,
          subject: emailSubject,
          html: emailBody
        });
        console.log("Email sent successfully:", emailResult);
      }
    }

    // Send email if payment is rejected
    if (status === "rejected") {
      console.log("Payment rejected, fetching user email...");
      const db = require("../../DB/connect");
      const [userDetails] = await db.execute("SELECT email, full_name FROM user_details WHERE oph_id = ?", [ophId]);
      const userEmail = userDetails[0]?.email;
      const userName = userDetails[0]?.full_name;
      
      if (userEmail) {
        console.log("Sending payment rejection email to:", userEmail);
        const emailResult = await resend.emails.send({
          from: 'OPH Community <creators@ophcommunity.org>',
          to: userEmail,
          subject: 'Payment Rejected',
          html: `
            <p>Hi ${userName || 'Artist'},</p>
            <p>Unfortunately, your payment has been rejected.</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>Reason: ${reject_reason || 'Not specified'}</p>
            <p>Please contact us if you have any questions or need assistance.</p>
            <br/>
            <p>Best regards,<br/>
            OPH Community Team<br/>
            <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`
        });
        console.log("Rejection email sent successfully:", emailResult);
      }
    }

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    const errorMessage = error.message || "Internal server error";
    const statusCode =
      error.message === "Payment not found" ||
      error.message === "No record found to update"
        ? 404
        : error.message.includes("required")
          ? 400
          : 500;
    res.status(statusCode).json({ message: errorMessage });
  }
};

const getAllSongPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllSong();

    return res.status(200).json({
      success: true,
      message:
        payments && payments.length > 0
          ? "Song payments fetched successfully"
          : "No song payments found",
      data: payments || [],
    });
  } catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllEventsPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllEvents();

    return res.status(200).json({
      success: true,
      message:
        payments && payments.length > 0
          ? "Event payments fetched successfully"
          : "No event payments found",
      data: payments || [],
    });
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllBookingPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllBooking();

    return res.status(200).json({
      success: true,
      message:
        payments && payments.length > 0
          ? "Booking payments fetched successfully"
          : "No booking payments under review found",
      data: payments || [],
    });
  } catch (error) {
    console.error("Error fetching booking payments:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getPaymentDetailsForEventsByOphId = async (req, res) => {
  try {
    const { ophid } = req.params;
    console.log("Controller received ophid:", ophid);
    console.log("req.params:", req.params);
    console.log("ophid type:", typeof ophid);

    if (!ophid) {
      return res.status(400).json({ message: "ophid parameter is required" });
    }

    const payments =
      await payment_details.getPaymentDetailsForEventsByOphId(ophid);
    return res.status(200).json({
      message: "Event payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getPaymentDetailsForSongByOphId = async (req, res) => {
  try {
    const { ophid, songid } = req.params;
    console.log("Controller received ophid:", ophid, "songid:", songid);

    if (!ophid || !songid) {
      return res
        .status(400)
        .json({ message: "ophid and songid parameters are required" });
    }

    const payments = await payment_details.getPaymentDetailsForSongByOphId(
      ophid,
      songid,
    );
    return res.status(200).json({
      message: "Song payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateEventPaymentSp = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, eventId } = req.body;

    if (!ophId || !transactionId || !status || !eventId) {
      return res.status(400).json({
        success: false,
        message: "ophId, transactionId, status and eventId are required",
      });
    }

    if (req.user?.role === "accounts member") {
      return res.status(403).json({
        success: false,
        message:
          "Your role cannot approve or reject event registration payments.",
      });
    }

    // Use AdminPaymentService to handle all admin application logic
    // This will update both payments and event_participants tables
    const result = await AdminPaymentService.updateEventPaymentStatus({
      ophId,
      transactionId,
      status,
      reject_reason,
      eventId,
    });

    // Send notification only for internal users (OPH-*) - external users don't have dashboard
    const isInternalUser = ophId && String(ophId).trim().match(/^OPH-/);
    if (isInternalUser) {
      const { saveNotification } = require("../../utils/notify");
      const EventModel = require("../model/events");
      const event = await EventModel.getEventById(parseInt(eventId, 10));
      const eventName = event?.EventName || "Event";

      const statusLabel = (status === "approved" || status === "Approved") ? "approved" : "rejected";
      const title =
        statusLabel === "approved"
          ? `Event "${eventName}" Registration Approved`
          : `Event "${eventName}" Registration Rejected`;
      const message =
        statusLabel === "rejected"
          ? `Your registration for "${eventName}" has been rejected${reject_reason ? `: ${reject_reason}` : "."}`
          : `Your registration for "${eventName}" has been approved. You're all set!`;

      const notificationPayload = {
        ophid: ophId,
        message,
        title,
        link: "/dashboard/events",
      };

      const notification = await saveNotification(notificationPayload);

      // Emit socket for real-time toast + bell indicator
      const io = req.app.get("io");
      const onlineUsers = req.app.get("onlineUsers");
      const userSocketId = onlineUsers?.get(ophId);
      if (io && onlineUsers && userSocketId) {
        io.to(userSocketId).emit("Event-update", { ...notification, ...notificationPayload });
      }
    }

    // Send email if payment is approved
    if (status === "approved" || status === "Approved") {
      console.log("=== EMAIL SENDING PROCESS STARTED ===");
      console.log("Event ID:", eventId);
      console.log("Transaction ID:", transactionId);
      const db = require('../../DB/connect');
      let userEmail = null;
      let userName = null;
      let eventName = null;
      
      try {
        console.log("Step 1: Fetching payment details with event booking info...");
        // Join payments with event_bookings using transaction_id
        const [paymentData] = await db.execute(
          `SELECT 
            p.oph_id,
            p.transaction_id,
            p.event_id,
            eb.email,
            eb.first_name,
            eb.last_name,
            e.EventName
          FROM OphData.payments p
          LEFT JOIN OphData.event_bookings eb ON p.transaction_id = eb.payment_transaction_id
          LEFT JOIN OphData.events e ON p.event_id = e.id
          WHERE p.transaction_id = ? AND p.status = 'approved'
          LIMIT 1`,
          [transactionId]
        );
        
        console.log("Payment data found:", paymentData.length > 0 ? "YES" : "NO");
        console.log("Payment data:", JSON.stringify(paymentData, null, 2));
        
        if (paymentData && paymentData.length > 0) {
          const payment = paymentData[0];
          userEmail = payment.email;
          userName = payment.first_name && payment.last_name 
            ? `${payment.first_name} ${payment.last_name}`.trim()
            : payment.first_name || payment.last_name || 'Artist';
          eventName = payment.EventName;
          console.log("✓ Email found:", userEmail);
          console.log("✓ Name found:", userName);
          console.log("✓ Event name:", eventName);
        } else {
          console.log("✗ No payment data found with approved status");
        }
        
        // Fallback: If email not found in event_bookings, try user_details
        if (!userEmail && paymentData && paymentData.length > 0) {
          const ophId = paymentData[0].oph_id;
          console.log("Step 2: Email not found in event_bookings, checking user_details for oph_id:", ophId);
          
          if (ophId) {
            const [userDetails] = await db.execute(
              "SELECT email, full_name FROM user_details WHERE oph_id = ?",
              [ophId]
            );
            console.log("User details found:", userDetails.length > 0 ? "YES" : "NO");
            console.log("User details:", JSON.stringify(userDetails, null, 2));
            
            if (userDetails && userDetails.length > 0) {
              userEmail = userDetails[0]?.email;
              userName = userDetails[0]?.full_name;
              console.log("✓ Email found in user_details:", userEmail);
              console.log("✓ Name found in user_details:", userName);
            }
          }
        }
      } catch (error) {
        console.log("✗ Error fetching payment/event data:", error.message);
        console.log("Error stack:", error.stack);
      }
      
      if (userEmail) {
        console.log("Step 3: Attempting to send email...");
        console.log("Recipient email:", userEmail);
        console.log("Recipient name:", userName);
        console.log("Event name:", eventName);
        try {
          const emailResult = await resend.emails.send({
            from: 'OPH Community <creators@ophcommunity.org>',
            to: userEmail,
            subject: 'Event Successfully Booked!',
            html: `
              <p>Hi ${userName || 'Artist'},</p>
              <p>Great news! Your event registration has been successfully approved.</p>
              ${eventName ? `<p><strong>Event:</strong> ${eventName}</p>` : ''}
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p>You can view your event details in your dashboard.</p>
              <br/>
              <p>Best regards,<br/>
              OPH Community Team<br/>
              <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`
          });
          console.log("✓✓✓ Email sent successfully!");
          console.log("Email result:", JSON.stringify(emailResult, null, 2));
        } catch (error) {
          console.log("✗✗✗ Error sending email:", error.message);
          console.log("Error details:", JSON.stringify(error, null, 2));
        }
      } else {
        console.log("✗✗✗ FINAL RESULT: No email found");
        console.log("Summary: Checked payments joined with event_bookings and user_details, no email address found");
      }
      console.log("=== EMAIL SENDING PROCESS ENDED ===");
    }

    res.status(200).json({
      success: true,
      message: "Event payment updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating event payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const updateStatusPayment = async (req, res) => {
  try {
    const { ophId, songId, status } = req.body;

    if (!ophId || !songId || !status) {
      return res
        .status(400)
        .json({ message: "ophId, songId, and status are required" });
    }

    const result = await payment_details.updateStatusPayment(
      ophId,
      songId,
      status,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSongPaymentSp = async (req, res) => {
  try {
    const { ophId, transactionId, status, FormData } = req.body;

    if (!ophId || !transactionId || !status || !FormData) {
      return res
        .status(400)
        .json({
          message: "ophId, transactionId, status and FormData are required",
        });
    }

    const result = await payment_details.updateSongPaymentSp(
      ophId,
      transactionId,
      FormData,
      status,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({ message: "Song payment updated successfully" });
  } catch (error) {
    console.error("Error updating song payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTransactionDetailsController = async (req, res) => {
  try {
    const { release_date, oph_id, song_id } = req.query;

    if (!release_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await payment_details.getTransactionDetails(
      release_date,
      oph_id || null,
      song_id || null
    );

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const setPaymentVerificationController = async (req, res) => {
  try {
    const { decision, reason, release_date, from, song_id, oph_id } = req.body;

    console.log("[setPaymentVerificationController] Received request:", {
      decision,
      reason: reason ? "provided" : "missing",
      release_date,
      from,
      oph_id,
      song_id,
    });

    if (!decision || !release_date || !from) {
      console.log("[setPaymentVerificationController] Missing required fields");
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: decision, release_date, and from are required",
      });
    }

    if (decision === "rejected" && (!reason || reason.trim() === "")) {
      console.log(
        "[setPaymentVerificationController] Missing rejection reason",
      );
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting",
      });
    }

    const response = await payment_details.setPaymentVerification(
      decision,
      reason,
      release_date,
      from,
      song_id,
      oph_id
    );

    console.log("[setPaymentVerificationController] Response:", response);

    if (response && response.success) {
      // Send notification for date approved/rejected (Date booking or Release date change)
      const isDateRelated =
        (from || "").toLowerCase().includes("date booking") ||
        (from || "").toLowerCase().includes("release date change");
      const ophIdVal = (oph_id || "").trim();
      const isInternalUser = ophIdVal && ophIdVal.match(/^OPH-/);

      if (isDateRelated && isInternalUser && ophIdVal) {
        const { saveNotification } = require("../../utils/notify");
        const statusLabel =
          decision === "approved" || decision === "Approved"
            ? "approved"
            : "rejected";
        const dateStr =
          release_date && typeof release_date === "string"
            ? release_date.split("T")[0] || release_date
            : release_date;
        const dateDisplay = dateStr || "selected date";
        const title =
          statusLabel === "approved"
            ? `Date Booking Approved: ${dateDisplay}`
            : `Date Booking Rejected: ${dateDisplay}`;
        const message =
          statusLabel === "rejected"
            ? `Your date booking for ${dateStr || "the selected date"} has been rejected${reason ? `: ${reason}` : "."}`
            : `Your date booking for ${dateStr || "the selected date"} has been approved.`;

        const notificationPayload = {
          ophid: ophIdVal,
          message,
          title,
          link: "/dashboard/time-calendar",
        };

        const notification = await saveNotification(notificationPayload);

        const io = req.app.get("io");
        const onlineUsers = req.app.get("onlineUsers");
        const userSocketId = onlineUsers?.get(ophIdVal);
        if (io && onlineUsers && userSocketId) {
          io.to(userSocketId).emit("Date-update", {
            ...notification,
            ...notificationPayload,
          });
        }
      }

      // Send email if decision is approved and from is Date Booking
      const fromNorm = (from || "").trim();
      if (
        (decision === "approved" || decision === "Approved") &&
        (fromNorm === "Date Booking" || fromNorm === "Date booking")
      ) {
        console.log("Date booking approved, sending email...");
        const db = require("../../DB/connect");
        const [userDetails] = await db.execute(
          "SELECT email, full_name FROM user_details WHERE oph_id = ?",
          [oph_id || ophIdVal]
        );
        const userEmail = userDetails[0]?.email;
        const userName = userDetails[0]?.full_name;
        
        if (userEmail) {
          console.log("Sending date booking confirmation email to:", userEmail);
          const emailResult = await resend.emails.send({
            from: 'OPH Community <creators@ophcommunity.org>',
            to: userEmail,
            subject: 'Date Booking Successful!',
            html: `
              <p>Hi ${userName || 'Artist'},</p>
              <p>Great news! Your time calendar date has been successfully booked.</p>
              <p>Release Date: ${release_date}</p>
              <p>You can view your booking details in your dashboard.</p>
              <br/>
              <p>Best regards,<br/>
              OPH Community Team<br/>
              <a href="mailto:connect@ophcommunity.org">connect@ophcommunity.org</a> | 8433792947</p>`
          });
          console.log("Email sent successfully:", emailResult);
        }
      }

      return res.status(200).json({
        success: true,
        message: "Data updated successfully",
        affectedRows: response.affectedRows,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to update payment verification",
        affectedRows: response?.affectedRows || 0,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getPaymentDetailsByTransactionId = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const response =
      await payment_details.getPaymentDetailsByTransactionId(transactionId);
    return res
      .status(200)
      .json({
        message: "Payment details fetched successfully",
        data: response,
      });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  updateStatus,
  getAllSongPayments,
  getAllEventsPayments,
  getAllBookingPayments,
  getPaymentDetailsForEventsByOphId,
  getPaymentDetailsForSongByOphId,
  updateEventPaymentSp,
  updateSongPaymentSp,
  updateStatusPayment,
  getTransactionDetailsController,
  setPaymentVerificationController,
  getPaymentDetailsByTransactionId,
};
