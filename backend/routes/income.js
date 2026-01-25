const express = require("express");
const router = express.Router();
const { getIncomeController, getTransactionHistoryController } = require("../controllers/income");

router.get("/get_income/:ophid", getIncomeController);
router.get("/transaction_history/:ophid", getTransactionHistoryController);

module.exports = router;