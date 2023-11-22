const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/autologin", authController.autologin);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/isAuth", authController.isAuth);
router.post("/activate/:token", authController.activateAccount);
router.post("/resend-activation-email", authController.resendActivationEmail);
router.post("/recover/:token", authController.recoverPassword);
router.post(
  "/send-recover-password-email",
  authController.recoverPasswordEmail
);
router.get("/check-recovery-token/:token", authController.checkRecoveryToken);

module.exports = router;
