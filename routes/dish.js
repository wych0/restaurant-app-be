const express = require("express");
const router = express.Router();
const dishController = require("../controllers/dishController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get(
  "/",
  verifyToken,
  verifyRole(["WORKER", "MANAGER"]),
  dishController.getAll
);
router.post(
  "/",
  verifyToken,
  verifyRole(["WORKER", "MANAGER"]),
  dishController.create
);
router.get("/to-display", dishController.getAllToDisplay);
router.put(
  "/:id",
  verifyToken,
  verifyRole(["WORKER", "MANAGER"]),
  dishController.update
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["WORKER", "MANAGER"]),
  dishController.remove
);

module.exports = router;
