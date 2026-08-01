const Template = require("../model/templateModel");
const Order = require("../model/orderModel");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");

const templatesDir = path.join(__dirname, "../public/templates");
// Private directory for the actual downloadable deliverables. NOT served by
// express.static, so files can only be reached through the gated download route.
const templateFilesDir = path.join(__dirname, "../private/templates");
if (!fs.existsSync(templateFilesDir)) {
  fs.mkdirSync(templateFilesDir, { recursive: true });
}

const multerStorage = multer.memoryStorage();

// Image fields must be images; the deliverable (template_file) can be any type
// (xlsx, pdf, docx, figma export, zip, ...). Admin-only route, so we stay permissive.
const multerFilter = (req, file, cb) => {
  if (file.fieldname === "template_file") {
    cb(null, true);
  } else if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    req.msg = "Only image is allowed";
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap for the deliverable file
  fileFilter: multerFilter,
});

exports.uploadImages = upload.fields([
  { name: "card_image", maxCount: 1 },
  { name: "template_images", maxCount: 5 },
  { name: "template_file", maxCount: 1 },
]);

// Turns a filename into a filesystem-safe, unique basename for the private dir.
const buildTemplateFileName = (originalname) => {
  const safe = String(originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
  return `tf-${Date.now()}-${safe}`;
};

exports.resizeImages = async (req, res, next) => {
  if (!req.files) return next();

  // Persist the deliverable file (if any) to the private directory as-is.
  if (req.files["template_file"]) {
    const file = req.files["template_file"][0];
    const storedName = buildTemplateFileName(file.originalname);
    fs.writeFileSync(path.join(templateFilesDir, storedName), file.buffer);
    file.storedName = storedName;
  }

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
    let template_file;
    let template_file_original;
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
      if (req.files["template_file"]) {
        const f = req.files["template_file"][0];
        template_file = f.storedName;
        template_file_original = f.originalname;
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
      template_link,
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
      template_file,
      template_file_original,
      template_link: template_link || "",
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

    // Replace the deliverable file if a new one was uploaded.
    let oldFileToRemove;
    if (req.files && req.files["template_file"]) {
      const f = req.files["template_file"][0];
      const existing = await Template.findById(templateId).select("template_file");
      if (existing && existing.template_file) oldFileToRemove = existing.template_file;
      updateData.template_file = f.storedName;
      updateData.template_file_original = f.originalname;
    }

    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      updateData,
      { new: true, runValidators: true }
    );

    if (updatedTemplate && oldFileToRemove) {
      const oldPath = path.join(templateFilesDir, oldFileToRemove);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
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

    // Remove the private deliverable file too.
    if (template.template_file) {
      const deliverablePath = path.join(templateFilesDir, template.template_file);
      if (fs.existsSync(deliverablePath)) fs.unlinkSync(deliverablePath);
    }

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

// Ownership-gated download of a template's deliverable.
// Allowed if: the template is free, the requester is an admin, OR the requester
// has an order containing this template. Streams the private file, or returns
// the external link when the template is delivered as a link (e.g. Figma).
exports.downloadTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ status: "Error", message: "Template not found" });
    }

    const isAdmin = req.role === "admin";
    const isFree = template.template_type === "free";
    let owns = isAdmin || isFree;

    if (!owns) {
      const order = await Order.findOne({
        userId: req.userId,
        "items.templateId": templateId,
      }).select("_id");
      owns = Boolean(order);
    }

    if (!owns) {
      return res.status(403).json({
        status: "Error",
        message: "You need to purchase this template before downloading it.",
      });
    }

    if (template.template_file) {
      const filePath = path.join(templateFilesDir, template.template_file);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          status: "Error",
          message: "Template file is no longer available. Please contact support.",
        });
      }
      return res.download(filePath, template.template_file_original || template.template_file);
    }

    if (template.template_link) {
      return res.status(200).json({
        status: "Success",
        message: "Template is delivered via link",
        link: template.template_link,
      });
    }

    return res.status(404).json({
      status: "Error",
      message: "No downloadable file is attached to this template yet.",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
