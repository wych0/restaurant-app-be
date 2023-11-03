const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");

router.post("/", reservationController.create);
router.get("/availableHours", reservationController.availableHours);

module.exports = router;
