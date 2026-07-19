const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController")
const authController = require("../controller/authController")

router.post("/", authController.gAuth, authController.checkAdmin, adminController.testAdmin)
router.post("/users", authController.gAuth, authController.checkAdmin, adminController.getAllUsers)
router.post("/stats", authController.gAuth, authController.checkAdmin, adminController.getDashboardStats)

module.exports = router