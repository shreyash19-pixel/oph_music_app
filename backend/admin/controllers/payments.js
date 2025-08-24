const payment_details = require("../model/payments");
const { saveNotification } = require("../../utils/notify");

const updateStatus = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason } = req.body;

    if (!ophId || !transactionId || !status) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, and status are required" });
    }

    const result = await payment_details.updateStatus(
      ophId,
      transactionId,
      status,
      reject_reason,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllSongPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllSong();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No song payments under review found" });
    }

    return res.status(200).json({
      message: "Song payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllEventsPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllEvents();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No event payments under review found" });
    }

    return res.status(200).json({
      message: "Event payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllBookingPayments = async (req, res) => {
  try {
    const payments = await payment_details.getPaymentDetailsForAllBooking();

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No booking payments under review found" });
    }

    return res.status(200).json({
      message: "Booking payments fetched successfully",
      data: payments,
    });
  } catch (error) {
    console.error("Error fetching booking payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { updateStatus, getAllSongPayments,getAllEventsPayments, getAllBookingPayments };
