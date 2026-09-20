const Blog = require("../model/blogModel");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

// Create blogs directory if it doesn't exist
const blogsDir = path.join(__dirname, "../public/blogs");
if (!fs.existsSync(blogsDir)) {
  fs.mkdirSync(blogsDir, { recursive: true });
}

// Configure multer for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    req.msg = "Only image files are allowed";
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

exports.uploadImages = upload.single("image");

exports.processAndOptimizeImages = async (req, res, next) => {
  try {
    if (!req.file) return next();

    // Clean up the filename by removing spaces and special characters
    const cleanOriginalName = req.file.originalname.replace(/\..+$/, "").replace(/\s+/g, "-");
    const filename = `blog-${Date.now()}-${cleanOriginalName}`;

    console.log("Processing image:", req.file.originalname);
    console.log("Filename will be:", filename);

    // Process and save multiple versions
    const processingPromises = [
      // Original WebP (high quality)
      sharp(req.file.buffer)
        .webp({ quality: 90 })
        .toFile(path.join(blogsDir, `${filename}-original.webp`))
        .then(() => console.log("Original WebP saved"))
        .catch(err => {
          console.error("Original WebP error:", err);
          throw err;
        }),

      // Medium size (800px width) WebP
      sharp(req.file.buffer)
        .resize(800, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(blogsDir, `${filename}-medium.webp`))
        .then(() => console.log("Medium WebP saved"))
        .catch(err => {
          console.error("Medium WebP error:", err);
          throw err;
        }),

      // Thumbnail (300px width) WebP
      sharp(req.file.buffer)
        .resize(300, 300, { fit: "cover" })
        .webp({ quality: 80 })
        .toFile(path.join(blogsDir, `${filename}-thumbnail.webp`))
        .then(() => console.log("Thumbnail WebP saved"))
        .catch(err => {
          console.error("Thumbnail WebP error:", err);
          throw err;
        }),

      // Progressive JPEG fallback
      sharp(req.file.buffer)
        .jpeg({ quality: 85, progressive: true })
        .toFile(path.join(blogsDir, `${filename}-fallback.jpg`))
        .then(() => console.log("Fallback JPEG saved"))
        .catch(err => {
          console.error("Fallback JPEG error:", err);
          throw err;
        }),
    ];

    await Promise.all(processingPromises);

    console.log("All images processed successfully");
    // Store the filename for database
    req.body.image = filename;
    next();
  } catch (error) {
    console.error("Image processing error:", error);
    return res.status(500).json({
      status: "Error",
      message: "Image processing failed",
      error: error.message,
    });
  }
};

exports.streamImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(blogsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "Error",
        message: "Image not found",
      });
    }

    const fileSize = fs.statSync(filePath).size;
    const range = req.headers.range;

    // Handle range requests for streaming
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      });

      file.pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=31536000, immutable",
      });

      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error("Image streaming error:", error);
    res.status(500).json({
      status: "Error",
      message: "Image streaming failed",
      error: error.message,
    });
  }
};

function getContentType(filename) {
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({
        status: "Error",
        message: "Blog not found",
      });
    }

    // Drafts are only visible to admins.
    if (blog.status === "draft" && req.role !== "admin") {
      return res.status(404).json({ status: "Error", message: "Blog not found" });
    }

    // Enhance with optimized image URLs + per-user like state.
    const optimizedBlog = {
      ...blog._doc,
      likedByMe: req.userId ? (blog.likes || []).includes(req.userId) : false,
      imageUrls: {
        thumbnail: `/api/blog/stream/${blog.image}-thumbnail.webp`,
        medium: `/api/blog/stream/${blog.image}-medium.webp`,
        original: `/api/blog/stream/${blog.image}-original.webp`,
        fallback: `/api/blog/stream/${blog.image}-fallback.jpg`,
      },
    };

    return res.status(200).json({
      status: "Success",
      blog: optimizedBlog,
    });
  } catch (error) {
    console.error("Get blog by ID error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;

    const query = category ? { type: category } : {};
    // Non-admins never see drafts.
    if (req.role !== "admin") query.status = { $ne: "draft" };

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    // Enhance with optimized thumbnail URLs + per-user like state; hide raw likes list.
    const optimizedBlogs = blogs.map((blog) => {
      const { likes, ...rest } = blog._doc;
      return {
        ...rest,
        likedByMe: req.userId ? (likes || []).includes(req.userId) : false,
        imageUrl: `/api/blog/stream/${blog.image}-thumbnail.webp`,
      };
    });

    return res.status(200).json({
      status: "Success",
      blogs: optimizedBlogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get all blogs error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getAllBlogsByCategory = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    if (!category) {
      return res.status(400).json({
        status: "Error",
        message: "Category parameter is required",
      });
    }

    const categoryQuery = { type: category };
    // Non-admins never see drafts.
    if (req.role !== "admin") categoryQuery.status = { $ne: "draft" };

    const blogs = await Blog.find(categoryQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(categoryQuery);

    // Enhance with optimized thumbnail URLs + per-user like state; hide raw likes list.
    const optimizedBlogs = blogs.map((blog) => {
      const { likes, ...rest } = blog._doc;
      return {
        ...rest,
        likedByMe: req.userId ? (likes || []).includes(req.userId) : false,
        imageUrl: `/api/blog/stream/${blog.image}-thumbnail.webp`,
      };
    });

    return res.status(200).json({
      status: "Success",
      blogs: optimizedBlogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get blogs by category error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.createBlog = async (req, res) => {
  try {
    if (req.msg === "Only image files are allowed") {
      return res.status(400).json({
        status: "Error",
        message: "Only image files are allowed",
      });
    }

    const { name, content, type, status } = req.body;
    const publishState = status === "draft" ? "draft" : "published";

    // Drafts can be saved incomplete (only a title required); published blogs
    // must have content and a category.
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (publishState === "published") {
      if (!content) missingFields.push("content");
      if (!type) missingFields.push("type");
    }
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Generate blog ID
    const blogId = `BLOG-${Date.now()}`;

    const blogData = {
      blogId,
      name,
      content: content || "",
      type: type || "technology",
      status: publishState,
      image: req.body.image || "", // Image filename from processing
    };

    const newBlog = await Blog.create(blogData);

    return res.status(201).json({
      status: "Success",
      message: "Blog created successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        status: "Error",
        message: "Duplicate blog ID",
      });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const updateData = { ...req.body };

    // Remove image from update data if no new image was uploaded
    if (!req.file) {
      delete updateData.image;
    }
    // Never overwrite a category with an empty value (would fail the enum).
    if (updateData.type === "" || updateData.type === undefined) {
      delete updateData.type;
    }
    // Likes are managed only through the like endpoint.
    delete updateData.likes;
    delete updateData.likesCount;

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({
        status: "Error",
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Blog updated successfully",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Update blog error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Public like toggle. Keyed by the logged-in user's id so each user counts once.
exports.toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) {
      return res.status(404).json({ status: "Error", message: "Blog not found" });
    }

    const uid = req.userId;
    const idx = (blog.likes || []).indexOf(uid);
    let liked;
    if (idx > -1) {
      blog.likes.splice(idx, 1);
      liked = false;
    } else {
      blog.likes.push(uid);
      liked = true;
    }
    blog.likesCount = blog.likes.length;
    await blog.save();

    return res.status(200).json({
      status: "Success",
      liked,
      likesCount: blog.likesCount,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    // Find blog to get image filename for cleanup
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        status: "Error",
        message: "Blog not found",
      });
    }

    // Delete associated images
    if (blog.image) {
      const imagePatterns = [
        `${blog.image}-original.webp`,
        `${blog.image}-medium.webp`,
        `${blog.image}-thumbnail.webp`,
        `${blog.image}-fallback.jpg`,
      ];

      imagePatterns.forEach((pattern) => {
        const filePath = path.join(blogsDir, pattern);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Delete blog from database
    await Blog.findByIdAndDelete(blogId);

    return res.status(200).json({
      status: "Success",
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
