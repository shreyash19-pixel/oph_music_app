const express = require('express');
const router = express.Router();
const eventParticipantController = require('../controllers/eventParticipant');

// Register a new participant
// POST /participants
router.post('/event_part', eventParticipantController.registerParticipant);

// // Get all participants for a specific event
// // GET /participants/event/:event_id
// router.get('/event/:event_id', eventParticipantController.getParticipantsByEvent);

// // Get a specific participant by OPH_ID and event_id
// GET /participants/:ophid/:event_id
router.get('/event_part/:ophid', eventParticipantController.getParticipantByOphAndEvent);

// // Update status of a participant
// // PATCH /participants/:id
// router.patch('/:id', eventParticipantController.updateParticipantStatus);

module.exports = router;
