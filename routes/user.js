const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

router.patch("/change-password", verifyToken, userController.changePassword);

module.exports = router;
