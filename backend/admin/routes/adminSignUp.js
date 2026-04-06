const express = require("express");

const router = express.Router();
const { signup, getAllPersonal } = require("../controllers/adminSignUp");
const authMiddleware = require("../../middleware/authenticate");
const requireSuperAdmin = require("../../middleware/requireSuperAdmin");

router.route("/admin/signup").post(signup);
router
  .route("/admin/personal")
  .get(authMiddleware, requireSuperAdmin, getAllPersonal);

module.exports = router;