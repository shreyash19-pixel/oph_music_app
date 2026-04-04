const express = require("express");
const router = express.Router(); 
const { changePassword } = require("../controllers/change_password");

router.post("/auth/change-password", changePassword);

module.exports = router;
