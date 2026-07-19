const express = require("express")
const router = express.Router()
const adminController = require("../controller/adminController")
const authController = require("../controller/authController")
const orderController = require("../controller/orderController")

router.post("/get-by-user", authController.gAuth, orderController.getOrdersByUser)
router.post("/get-all", authController.gAuth, authController.checkAdmin, orderController.getAllOrders)
router.post("/create", authController.gAuth, orderController.createOrder)

module.exports = router