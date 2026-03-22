const Event = require("../model/events");
const EventParticipant = require("../model/eventParticipant");
const { uploadToS3 } = require("../../utils");

const fetchAllEvents = async (req, res) => {
  try {
    const events = await Event.getAllEvents();
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};

const createEvent = async (req, res) => {
  try {
    const { body, files } = req;
    console.log(req.body);
    console.log(req.files);

    let imageUrl = "";
    let paymentQrUrl = "";
    let paymentQrDiscountUrl = "";

    if (files) {
      if (files.image) {
        imageUrl = await uploadToS3(files.image[0], "event_images");
      }
      if (files.payment_qr) {
        paymentQrUrl = await uploadToS3(files.payment_qr[0], "event_images");
      }
      if (files.payment_qr_discount) {
        paymentQrDiscountUrl = await uploadToS3(files.payment_qr_discount[0], "event_images");
      }
    }

    const result = await Event.insertEvent({
      ...body,
      image: imageUrl,
      payment_qr: paymentQrUrl,
      payment_qr_discount: paymentQrDiscountUrl,
    });

    res.status(201).json({ message: "Event created successfully", result });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
};

const fetchAllEventsWithStatus = async (req, res) => {
  try {
    const events = await Event.getAllEventsWithStatus();
    res.status(200).json({ success: true, data: events });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ success: false, message: "Failed to fetch events" });
  }
};

const getEventById = async (req, res) => {
  try {
    const idParam = req.params.id || req.params.event_id;
    // basic validation: must be positive integer
    const eventId = parseInt(idParam, 10);
    if (!eventId || eventId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const event = await Event.getEventById(eventId);
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const participantCount = await EventParticipant.getParticipantCountByEventId(eventId);
    return res.json({
      success: true,
      data: { ...event, participant_count: participantCount },
    });
  } catch (err) {
    console.error("Error fetching event:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const idParam = req.params.id || req.params.event_id;
    const eventId = parseInt(idParam, 10);
    if (!eventId || eventId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    const { body, files } = req;
    console.log("Update event body:", req.body);
    console.log("Update event files:", req.files);

    // First get the existing event to preserve the current images
    const existingEvent = await Event.getEventById(eventId);
    if (!existingEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    let imageUrl = existingEvent.image; // Keep existing image by default
    let paymentQrUrl = existingEvent.payment_qr; // Keep existing payment QR by default
    let paymentQrDiscountUrl = existingEvent.payment_qr_discount; // Keep existing payment QR discount by default

    if (files) {
      if (files.image) {
        // Only update image if a new file is uploaded
        imageUrl = await uploadToS3(files.image[0], "event_images");
      }
      if (files.payment_qr) {
        // Only update payment QR if a new file is uploaded
        paymentQrUrl = await uploadToS3(files.payment_qr[0], "event_images");
      }
      if (files.payment_qr_discount) {
        // Only update payment QR discount if a new file is uploaded
        paymentQrDiscountUrl = await uploadToS3(files.payment_qr_discount[0], "event_images");
      }
    }

    const result = await Event.updateEvent(eventId, {
      ...body,
      image: imageUrl,
      payment_qr: paymentQrUrl,
      payment_qr_discount: paymentQrDiscountUrl,
    });

    res.status(200).json({ success: true, message: "Event updated successfully", result });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, message: "Failed to update event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const idParam = req.params.id || req.params.event_id;
    const eventId = parseInt(idParam, 10);
    if (!eventId || eventId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event id" });
    }

    // Check if event exists before deleting
    const existingEvent = await Event.getEventById(eventId);
    if (!existingEvent) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    const result = await Event.deleteEvent(eventId);
    
    res.status(200).json({ 
      success: true, 
      message: "Event deleted successfully", 
      result 
    });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete event" 
    });
  }
};

module.exports = {
  fetchAllEvents,
  createEvent,
  fetchAllEventsWithStatus,
  getEventById,
  updateEvent,
  deleteEvent,
};
