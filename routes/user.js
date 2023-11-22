const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

router.patch("/change-password", verifyToken, userController.changePassword);
router.get("/personal-data", verifyToken, userController.getPersonalData);
router.get("/reservations", verifyToken, userController.getReservations);

module.exports = router;
