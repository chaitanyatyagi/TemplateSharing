const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const newsletterController = require("../controller/newsletterController");

// Public subscribe
router.post("/subscribe", newsletterController.subscribe);

// Admin: list subscribers
router.post(
  "/get-all",
  authController.gAuth,
  authController.checkAdmin,
  newsletterController.getAllSubscribers
);

module.exports = router;
