const User = require("../model/userModel");
const Template = require("../model/templateModel");
const Blog = require("../model/blogModel");
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-config.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// const firebaseConfig = {
//   apiKey: "AIzaSyC4pT1AeetNsWJR2RJs1-1RKq0UA9SeS64",
//   authDomain: "amit-dev-f8f1a.firebaseapp.com",
//   projectId: "amit-dev-f8f1a",
//   storageBucket: "amit-dev-f8f1a.firebasestorage.app",
//   messagingSenderId: "38174103846",
//   appId: "1:38174103846:web:032f669571daef30c149e7",
//   measurementId: "G-ZF3B8YWJ0E",
// };

// admin.initializeApp(firebaseConfig);

exports.signupPhone = async (req, res) => {
  try {
    const { contact, userId } = req.body;
    const user = await User.findOne({ userId });
    if (user) {
      return res.status(200).json({
        status: "Success",
        message: "You are logged in !",
      });
    }
    await User.create({ contact, userId });
    return res.status(201).json({
      status: "Success",
      message: "You are successfully registered !",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: 400,
        message: "Validation error. Please provide valid data.",
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Something went wrong !",
    });
  }
};

exports.signupGoogle = async (req, res) => {
  try {
    console.log("enter google signup");
    const { email, name, userId } = req.body;
    console.log(req.body);
    const adminEmail =
      process.env.NODE_ENV === "production"
        ? "2020uch1395@mnit.ac.in"
        : "chaitanyatyagi1540@gmail.com";

    const isAdminEmail = email === adminEmail;
    if (isAdminEmail) {
      setAdminRole(userId);
    }

    const user = await User.findOne({ userId });
    if (user) {
      if (isAdminEmail && user.role !== "admin") {
        user.role = "admin";
        await user.save();
      }
      return res.status(200).json({
        status: "Success",
        message: "You are logged in !",
      });
    }
    await User.create({ email, name, userId, role: isAdminEmail ? "admin" : "user" });
    return res.status(201).json({
      status: "Success",
      message: "You are successfully registered !",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: 400,
        message: "Validation error. Please provide valid data.",
      });
    }
    return res.status(500).json({
      status: 500,
      message: "Something went wrong!",
    });
  }
};

exports.getProfile = async (req, res) => {
  return res.status(200).json({
    status: "Success",
    user: req.user,
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "contact", "address", "city", "state", "pincode"];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "Error",
        message: "User not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({
      status: "Error",
      message: "Failed to update profile",
    });
  }
};

// ---- Wishlist (templates) ----

exports.getWishlist = async (req, res) => {
  try {
    const ids = req.user.wishlist || [];
    const templates = await Template.find({ _id: { $in: ids } });
    return res.status(200).json({
      status: "Success",
      templates,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { templateId } = req.body;
    if (!templateId) {
      return res.status(400).json({
        status: "Error",
        message: "templateId is required",
      });
    }

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ status: "Error", message: "User not found" });
    }

    const index = user.wishlist.indexOf(templateId);
    let wishlisted;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      wishlisted = false;
    } else {
      user.wishlist.push(templateId);
      wishlisted = true;
    }
    await user.save();

    return res.status(200).json({
      status: "Success",
      wishlisted,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// ---- Saved blogs ----

exports.getSavedBlogs = async (req, res) => {
  try {
    const ids = req.user.savedBlogs || [];
    const blogs = await Blog.find({ _id: { $in: ids } });

    const optimizedBlogs = blogs.map((blog) => ({
      ...blog._doc,
      imageUrl: `/api/blog/stream/${blog.image}-thumbnail.webp`,
    }));

    return res.status(200).json({
      status: "Success",
      blogs: optimizedBlogs,
    });
  } catch (error) {
    console.error("Get saved blogs error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.toggleSavedBlog = async (req, res) => {
  try {
    const { blogId } = req.body;
    if (!blogId) {
      return res.status(400).json({
        status: "Error",
        message: "blogId is required",
      });
    }

    const user = await User.findOne({ userId: req.userId });
    if (!user) {
      return res.status(404).json({ status: "Error", message: "User not found" });
    }

    const index = user.savedBlogs.indexOf(blogId);
    let saved;
    if (index > -1) {
      user.savedBlogs.splice(index, 1);
      saved = false;
    } else {
      user.savedBlogs.push(blogId);
      saved = true;
    }
    await user.save();

    return res.status(200).json({
      status: "Success",
      saved,
      savedBlogs: user.savedBlogs,
    });
  } catch (error) {
    console.error("Toggle saved blog error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

async function setAdminRole(uid) {
  try {
    const user = await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log("User role updated to admin:", user);
  } catch (error) {
    console.error("Error setting user role:", error);
  }
}

exports.checkAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Error",
        message: "Authorization token missing or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "Error",
        message: "Authorization token missing",
      });
    }

    let decodeValue;
    try {
      decodeValue = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      if (verifyError.code === "auth/id-token-expired") {
        return res.status(401).json({
          status: "Error",
          message: "Session expired. Please login again.",
        });
      }
      return res.status(401).json({
        status: "Error",
        message: "Invalid authorization token",
      });
    }

    if (!decodeValue || !decodeValue.admin) {
      return res.status(403).json({
        status: "Error",
        message: "Access denied: Admins only",
      });
    }

    req.role = "admin";
    req.userId = decodeValue.uid;
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({
      status: "Error",
      message: "Internal server error during authorization",
    });
  }
};

exports.gAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "Error",
        message: "Authorization token missing or invalid format",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "Error",
        message: "Authorization token missing",
      });
    }

    let decodeValue;
    try {
      decodeValue = await admin.auth().verifyIdToken(token);
    } catch (verifyError) {
      console.error("Token verification error:", verifyError);
      if (verifyError.code === "auth/id-token-expired") {
        return res.status(401).json({
          status: "Error",
          message: "Session expired. Please login again.",
        });
      }
      return res.status(401).json({
        status: "Error",
        message: "Invalid authorization token",
      });
    }

    if (!decodeValue || !decodeValue.uid) {
      return res.status(401).json({
        status: "Error",
        message: "Invalid user credentials",
      });
    }

    req.userId = decodeValue.uid;
    const user = await User.findOne({ userId: req.userId });

    if (!user) {
      return res.status(401).json({
        status: "Error",
        message: "User not found. Please register first.",
      });
    }

    req.user = user;
    req.role = user.role || "user";
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "Error",
        message: "Validation error. Please provide valid data.",
      });
    }
    if (error.code === "auth/argument-error") {
      return res.status(401).json({
        status: "Error",
        message: "Unauthorized: Invalid token format",
      });
    }
    return res.status(500).json({
      status: "Error",
      message: "Authentication failed. Please try again later.",
    });
  }
};
