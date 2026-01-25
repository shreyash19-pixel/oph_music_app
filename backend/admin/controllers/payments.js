const payment_details = require("../model/payments");
const { saveNotification } = require("../../utils/notify");
const AdminPaymentService = require("../services/AdminPaymentService");

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

    // Use AdminPaymentService to handle all admin application logic
    const result = await AdminPaymentService.updatePaymentStatus({
      ophId: ophIdValue,
      transactionId: transactionIdValue,
      status: statusValue,
      reject_reason,
      songId,
    });

    const { place } = result;

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
          : "No song payments under review found",
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
          : "No event payments under review found",
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

    // Use AdminPaymentService to handle all admin application logic
    // This will update both payments and event_participants tables
    const result = await AdminPaymentService.updateEventPaymentStatus({
      ophId,
      transactionId,
      status,
      reject_reason,
      eventId,
    });

    // Send notification to user
    const { saveNotification } = require("../../utils/notify");
    const message =
      status === "rejected"
        ? `Your event payment with Transaction ID: ${transactionId} has been ${status}${reject_reason ? ` due to: ${reject_reason}` : ""}.`
        : `Your event payment with Transaction ID: ${transactionId} has been ${status}.`;

    const notificationPayload = {
      ophid: ophId,
      message: message,
      title: `Event Payment ${status}`,
      link: status === "rejected" ? "/dashboard/events" : null,
    };

    await saveNotification(notificationPayload);

    // Emit socket event if user is online
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");
    const userSocketId = onlineUsers?.get(ophId);
    if (userSocketId) {
      io.to(userSocketId).emit("Payment-update", notificationPayload);
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
    const { release_date } = req.query;

    if (!release_date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await payment_details.getTransactionDetails(release_date);

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
