const express = require('express');
const router = express.Router();
const { getBanks, addBank, deleteBank } = require('../controllers/banks');

router.get('/get_banks', getBanks);
router.post('/add_bank', addBank);
router.delete('/delete_bank/:bank_id', deleteBank);

module.exports = router;