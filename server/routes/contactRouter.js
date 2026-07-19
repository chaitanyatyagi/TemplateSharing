const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const contactController = require("../controller/contactController");

router.post("/create", contactController.createContact);
router.post(
  "/get-all",
  authController.gAuth,
  authController.checkAdmin,
  contactController.getAllContacts
);

module.exports = router;
