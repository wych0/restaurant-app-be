const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", reservationController.create);
router.post("/confirm/:token", reservationController.confirm);
router.get("/availableHours", reservationController.availableHours);
router.get("/", verifyToken, reservationController.getAll);
router.get("/user", verifyToken, reservationController.getUserReservations);
router.get("/:id", verifyToken, reservationController.getReservation);

module.exports = router;
