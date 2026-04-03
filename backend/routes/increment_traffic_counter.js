const express = require("express")
const router = express.Router()

const {incrementTrafficCounterController} = require("../controllers/increment_traffic_counter")

// Public: profile view counter (optional Bearer still accepted by clients; not required)
router.post("/increment-traffic", incrementTrafficCounterController)


module.exports = router