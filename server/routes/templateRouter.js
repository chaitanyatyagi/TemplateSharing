const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const authController = require("../controller/authController");
const templateController = require("../controller/templateController");

router.post(
  "/get-one/:templateId",
  authController.optionalAuth,
  templateController.getTemplateById
);
router.post(
  "/get-all",
  authController.optionalAuth,
  templateController.getAllTemplates
);
router.post(
  "/get-all-by-category",
  authController.optionalAuth,
  templateController.getAllTemplatesByCategory
);
router.post(
  "/download/:templateId",
  authController.gAuth,
  templateController.downloadTemplate
);
router.post(
  "/create",
  authController.gAuth,
  authController.checkAdmin,
  templateController.uploadImages,
  templateController.resizeImages,
  templateController.createTemplate
);
router.patch(
  "/update/:templateId",
  authController.gAuth,
  authController.checkAdmin,
  templateController.uploadImages,
  templateController.resizeImages,
  templateController.updateTemplate
);
router.delete(
  "/delete/:templateId",
  authController.gAuth,
  authController.checkAdmin,
  templateController.deleteTemplate
);

module.exports = router;
