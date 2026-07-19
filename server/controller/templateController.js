const Template = require("../model/templateModel");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const templatesDir = path.join(__dirname, "../public/templates");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    req.msg = "Only image is allowed";
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadImages = upload.fields([
  { name: "card_image", maxCount: 1 },
  { name: "template_images", maxCount: 5 },
]);

exports.resizeImages = async (req, res, next) => {
  if (!req.files) return next();

  if (req.files["card_image"]) {
    const mainImage = req.files["card_image"][0];
    mainImage.filename = `cover-${mainImage.originalname}`;
    await Jimp.read(mainImage.buffer)
      .then((image) => {
        return image
          .resize(550, 550)
          .quality(90)
          .write(`public/templates/${mainImage.filename}`);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }

  if (req.files["template_images"]) {
    await Promise.all(
      req.files["template_images"].map(async (file, index) => {
        file.filename = `template-${index}-${file.originalname}`;
        await Jimp.read(file.buffer)
          .then((image) => {
            return image
              .resize(550, 550)
              .quality(90)
              .write(`public/templates/${file.filename}`);
          })
          .catch((err) => {
            console.log(err);
            next(err);
          });
      })
    );
  }
  next();
};

exports.getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    return res.status(200).json({
      status: "Success",
      template,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find();
    return res.status(200).json({
      status: "Success",
      templates,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getAllTemplatesByCategory = async (req, res) => {
  try {
    const templates = await Template.find({
      template_category: req.body.template_category,
    });
    return res.status(200).json({
      status: "Success",
      templates,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    let template_images = [];
    let card_image;
    if (req.msg == "Only image is allowed") {
      return res.status(400).json({
        status: "Error",
        message: "Only image is allowed",
      });
    }
    if (req.files) {
      if (req.files["card_image"]) {
        card_image = req.files["card_image"][0].filename;
      }
      if (req.files["template_images"]) {
        req.files["template_images"].map((file) => {
          template_images.push(file.filename);
        });
      }
    }

    const {
      name,
      card_content,
      template_title,
      template_url,
      template_type,
      price,
      template_content,
      template_description,
      template_tags,
      template_category,
      template_subcategory,
    } = req.body;

    // Check for missing fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!card_image) missingFields.push("card_image");
    if (!card_content) missingFields.push("card_content");
    if (!template_images.length) missingFields.push("template_images");
    if (!template_title) missingFields.push("template_title");
    if (!template_url) missingFields.push("template_url");
    if (!template_type) missingFields.push("template_type");
    if (price === undefined || price === null || price === "") missingFields.push("price");
    if (!template_content) missingFields.push("template_content");
    if (!template_description) missingFields.push("template_description");
    if (!template_tags) missingFields.push("template_tags");
    if (!template_category) missingFields.push("template_category");
    if (!template_subcategory) missingFields.push("template_subcategory");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Error",
        message: `The following fields are missing: ${missingFields.join(
          ", "
        )}`,
      });
    }
    const parsedTags = Array.isArray(template_tags)
      ? template_tags
      : String(template_tags)
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    const body = {
      name,
      card_image,
      card_content,
      template_images,
      template_title,
      template_url,
      template_type,
      price,
      template_content,
      template_description,
      template_tags: parsedTags,
      template_category,
      template_subcategory,
    };
    const newTemplate = await Template.create(body);
    return res.status(201).json({
      status: "Success",
      message: "Template has been added successfully !",
      template: newTemplate,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const updateData = { ...req.body };

    if (updateData.template_tags !== undefined && !Array.isArray(updateData.template_tags)) {
      updateData.template_tags = String(updateData.template_tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedTemplate) {
      return res
        .status(404)
        .json({ status: "Error", message: "Template not found" });
    }

    return res.status(200).json({
      status: "Success",
      message: "Template updated successfully",
      template: updatedTemplate,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.templateId);
    if (!template) {
      return res.status(404).json({
        status: "Error",
        message: "Template not found",
      });
    }

    const imageFiles = [template.card_image, ...(template.template_images || [])].filter(Boolean);
    imageFiles.forEach((filename) => {
      const filePath = path.join(templatesDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    return res.status(200).json({
      status: "Success",
      message: "Template deleted successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
