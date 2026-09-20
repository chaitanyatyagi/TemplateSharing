const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const blogController = require("../controller/blogController");

router.post(
  "/get-one/:blogId",
  authController.gAuth,
  blogController.getBlogById
);
router.post(
  "/get-all",
  authController.gAuth,
  blogController.getAllBlogs
);
router.post(
  "/get-all-by-category",
  authController.gAuth,
  blogController.getAllBlogsByCategory
);
router.post(
  "/create",
  authController.gAuth,
  authController.checkAdmin,
  blogController.uploadImages,
  blogController.processAndOptimizeImages,
  blogController.createBlog
);
router.patch(
  "/update/:blogId",
  authController.gAuth,
  authController.checkAdmin,
  blogController.uploadImages,
  blogController.processAndOptimizeImages,
  blogController.updateBlog
);
router.delete(
  "/delete/:blogId",
  authController.gAuth,
  authController.checkAdmin,
  blogController.deleteBlog
);

// Public like toggle (any logged-in user)
router.post(
  "/like/:blogId",
  authController.gAuth,
  blogController.toggleLike
);

// Image streaming endpoint
router.get(
  "/stream/:filename",
  blogController.streamImage
);

module.exports = router;
