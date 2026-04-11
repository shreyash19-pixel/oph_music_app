const express = require("express");
const router = express.Router();
const {
  signin,
  updateAdminRole,
  getAdminProfile,
} = require("../controllers/adminSignIn");
const authMiddleware = require("../../middleware/authenticate");
const requireSuperAdmin = require("../../middleware/requireSuperAdmin");

router.route("/admin/signin").post(signin);
router.get("/admin/profile", authMiddleware, getAdminProfile);
router.put(
  "/admin/update-role",
  authMiddleware,
  requireSuperAdmin,
  updateAdminRole
);

module.exports = router;