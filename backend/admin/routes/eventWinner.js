const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authenticate');
const forbidProjectMemberAssignWinner = require('../../middleware/forbidProjectMemberAssignWinner');
const eventWinnerController = require('../controllers/eventWinner');
// const eventWinnerController = require('../controllers/eventWinner');

// Get all events with winner info
router.get('/events-with-winners', eventWinnerController.getEventsWithWinnerInfo);

// Get accepted participants for an event
router.get('/event-participants/:event_id', eventWinnerController.getAcceptedParticipants);

// Get all artists for dropdown
router.get('/all-artists-dropdown', eventWinnerController.getAllArtistsForDropdown);

// Assign winner to an event (project member blocked)
router.post(
  '/assign-winner',
  authMiddleware,
  forbidProjectMemberAssignWinner,
  eventWinnerController.assignEventWinner,
);

module.exports = router;
