const express = require('express');
const router = express.Router();
const eventWinnerController = require('../controllers/eventWinner');

// Get all events with winner info
router.get('/events-with-winners', eventWinnerController.getEventsWithWinnerInfo);

// Get accepted participants for an event
router.get('/event-participants/:event_id', eventWinnerController.getAcceptedParticipants);

// Get all artists for dropdown
router.get('/all-artists-dropdown', eventWinnerController.getAllArtistsForDropdown);

// Assign winner to an event
router.post('/assign-winner', eventWinnerController.assignEventWinner);

module.exports = router;
