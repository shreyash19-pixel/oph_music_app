const Event = require("../model/events");
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
    const { body, file } = req;
    console.log(req.body);
    console.log(req.file);

    let imageUrl = "";
    if (file) {
      imageUrl = await uploadToS3(file, "event_images");
    }

    const result = await Event.insertEvent({
      ...body,
      image: imageUrl,
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
    const idParam = req.params.id;
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

    return res.json({ success: true, data: event });
  } catch (err) {
    console.error("Error fetching event:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  fetchAllEvents,
  createEvent,
  fetchAllEventsWithStatus,
  getEventById,
};
