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
    console.log(ophid);
    
    const participant = await EventParticipant.getParticipantByOphAndEvent(ophid);
    res.json(participant || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
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
  updateParticipantStatus
};
