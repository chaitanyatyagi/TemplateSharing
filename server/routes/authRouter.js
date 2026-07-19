const express = require("express")
const router = express.Router()
const authController = require("../controller/authController")

// router.post("/sign-up/phone", authController.signupPhone)
router.post("/sign-up/google", authController.signupGoogle)
router.post("/profile", authController.gAuth, authController.getProfile)
router.patch("/profile/update", authController.gAuth, authController.updateProfile)
router.post("/wishlist", authController.gAuth, authController.getWishlist)
router.post("/wishlist/toggle", authController.gAuth, authController.toggleWishlist)
router.post("/saved-blogs", authController.gAuth, authController.getSavedBlogs)
router.post("/saved-blogs/toggle", authController.gAuth, authController.toggleSavedBlog)

module.exports = router