const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.post("/", verifyToken, verifyRole(["MANAGER"]), userController.create);
router.get(
  "/",
  verifyToken,
  verifyRole(["MANAGER"]),
  userController.getWorkers
);
router.patch("/change-password", verifyToken, userController.changePassword);
router.get("/personal-data", verifyToken, userController.getPersonalData);
router.get("/reservations", verifyToken, userController.getReservations);
router.delete(
  "/:id",
  verifyToken,
  verifyRole(["MANAGER"]),
  userController.deleteWorker
);

module.exports = router;
