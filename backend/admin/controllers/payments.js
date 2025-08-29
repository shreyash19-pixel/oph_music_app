const payment_details = require("../model/payments");
const { saveNotification } = require("../../utils/notify");
const { updateSongStatus } = require("../model/songs");

const updateStatus = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, songId } = req.body;

    if (!ophId || !transactionId || !status) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, and status are required" });
    }

    // If songId is provided, update song status
    if (songId) {
      await updateSongStatus(parseInt(songId), ophId, (reject_reason || "").trim() || null);
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


const getPaymentDetailsForEventsByOphId = async (req, res) => {
  try {
    const { ophid } = req.params;
    console.log("Controller received ophid:", ophid);
    console.log("req.params:", req.params);
    console.log("ophid type:", typeof ophid);
    
    if (!ophid) {
      return res.status(400).json({ message: "ophid parameter is required" });
    }
    
    const payments = await payment_details.getPaymentDetailsForEventsByOphId(ophid);
    return res.status(200).json({
      message: "Event payments fetched successfully",
      data: payments,
    });
  }
  catch (error) {
    console.error("Error fetching event payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getPaymentDetailsForSongByOphId = async (req, res) => {
  try {
    const { ophid, songid } = req.params;
    console.log("Controller received ophid:", ophid, "songid:", songid);
    
    if (!ophid || !songid) {
      return res.status(400).json({ message: "ophid and songid parameters are required" });
    }
    
    const payments = await payment_details.getPaymentDetailsForSongByOphId(ophid, songid);
    return res.status(200).json({
      message: "Song payments fetched successfully",
      data: payments,
    });
  }
  catch (error) {
    console.error("Error fetching song payments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


const updateEventPaymentSp = async (req, res) => {
  try {
    const { ophId, transactionId, status, reject_reason, eventId } = req.body;

    if (!ophId || !transactionId || !status || !eventId) {
      return res
        .status(400)
        .json({ message: "ophId, transactionId, status and eventId are required" });
    }

    const result = await payment_details.updateEventPaymentSp(
      ophId,
      transactionId,
      status,
      reject_reason,
      parseInt(eventId)
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }
    else{
      // Save notification
      const notificationMessage = `Your event payment with Transaction ID: ${transactionId} has been ${status}.`;
      await saveNotification({
        ophid: ophId,
        message: notificationMessage,
        title: `Event Payment ${status}`,
        link: null
      });
    }

    res.status(200).json({ message: "Event payment updated successfully" });
  } catch (error) {
    console.error("Error updating event payment:", error);
    res.status(500).json({ message: "Internal server error" });
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
      status
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No record found to update" });
    }

    res.status(200).json({ 
      message: "Payment status updated successfully",
      affectedRows: result.affectedRows
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
        .json({ message: "ophId, transactionId, status and FormData are required" });
    }

    const result = await payment_details.updateSongPaymentSp(
      ophId,
      transactionId,
      FormData,
      status
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

module.exports = { 
  updateStatus, 
  getAllSongPayments,
  getAllEventsPayments, 
  getAllBookingPayments, 
  getPaymentDetailsForEventsByOphId, 
  getPaymentDetailsForSongByOphId,
  updateEventPaymentSp,
  updateSongPaymentSp,
  updateStatusPayment
};
