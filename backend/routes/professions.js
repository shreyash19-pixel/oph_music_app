const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/professions');

router.get('/get_professions', ctrl.getProfessions);

// POST /professions       -> add new { name: '...' }
router.post('/new_profession', ctrl.addProfession);

// DELETE /professions/:id -> delete by id
router.delete('/delete_profession/:id', ctrl.deleteProfession);

module.exports = router;