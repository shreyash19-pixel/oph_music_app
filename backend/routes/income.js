const express = require("express");
const router = express.Router();
const { getIncomeController } = require("../controllers/income");

router.get("/get_income/:ophid", getIncomeController);

module.exports = router;