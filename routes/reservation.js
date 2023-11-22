const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.post("/", reservationController.create);
router.post("/confirm/:token", reservationController.confirm);
router.post("/cancel/:id", verifyToken, reservationController.cancel);
router.get("/availableHours", reservationController.availableHours);
router.get(
  "/",
  verifyToken,
  verifyRole(["WORKER", "MANAGER"]),
  reservationController.getAll
);
router.get("/:id", verifyToken, reservationController.getReservation);

module.exports = router;
