const express = require("express");
const router = express.Router();
const costingController = require("../controllers/costing");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.get("/get_costing", costingController.getCosting);
router.post("/insert_costing", upload.single('qr_image'), costingController.insertCosting);
router.put("/update_costing/:id", upload.single('qr_image'), costingController.updateCosting);
router.get("/get_costing_by_id/:id", costingController.getCostingById);

module.exports = router;