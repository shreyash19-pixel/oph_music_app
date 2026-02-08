const EventParticipant = require('../model/eventParticipant');

// POST /participants
const registerParticipant = async (req, res) => {
  const { OPH_ID, event_id, status = "under review" } = req.body;

  if (!OPH_ID || !event_id) {
    return res.status(400).json({ error: "OPH_ID and event_id are required." });
  }

  try {
    const id = await EventParticipant.registerParticipant({ OPH_ID, event_id, status });
    res.status(201).json({ message: "Participant registered", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /participants/event/:event_id
const getParticipantsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;
    const participants = await EventParticipant.getParticipantsByEventId(event_id);
    res.json(participants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /participants/:ophid
const getParticipantByOphAndEvent = async (req, res) => {
  try {

    const { ophid } = req.params;
    const { event_id } = req.query;

    // If event_id is provided, fetch that specific (oph_id, event_id) row.
    // Otherwise return all event_participants rows for this oph_id (user can be in multiple events).
    if (event_id) {
      const participant = await EventParticipant.getParticipantByOphAndEvent(
        ophid,
        parseInt(event_id, 10),
      );
      return res.json(participant || []);
    }

    const participants = await EventParticipant.getParticipantsByOphId(ophid);
    return res.json(participants || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getParticipant = async (req, res) => {
  try {
    const participant = await EventParticipant.getParticipant();
    res.status(200).json({ success: true, data: participant });
  } catch (error) {
    console.error("Error fetching participant:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// PATCH /participants/:id
const updateParticipantStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["under review", "accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    await EventParticipant.updateParticipantStatus(id, status);
    res.json({ message: "Participant status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerParticipant,
  getParticipantsByEvent,
  getParticipantByOphAndEvent,
  updateParticipantStatus,
  getParticipant,
};
