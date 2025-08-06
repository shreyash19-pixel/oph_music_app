const express = require('express');
const router = express.Router();
const controller = require('../controllers/spotlight_notes');

router.get('/notes/:ophId', controller.getMetricsByOPH_ID);
router.post('/note/:ophid', controller.updateNotes);

module.exports = router;
