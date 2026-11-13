const Newsletter = require("../model/newsletterModel");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public: subscribe an email to the newsletter. Idempotent — an already-subscribed
// email returns success (not an error) so the user experience is friendly.
exports.subscribe = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ status: "Error", message: "Please enter your email address." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ status: "Error", message: "Please enter a valid email address." });
    }

    const existing = await Newsletter.findOne({ email }).select("_id");
    if (existing) {
      return res.status(200).json({ status: "Success", message: "You're already subscribed — thanks!" });
    }

    await Newsletter.create({ email });
    return res.status(201).json({ status: "Success", message: "You're subscribed! Watch your inbox." });
  } catch (error) {
    // Unique-index race: treat as already-subscribed.
    if (error.code === 11000) {
      return res.status(200).json({ status: "Success", message: "You're already subscribed — thanks!" });
    }
    console.error("Newsletter subscribe error:", error);
    return res.status(500).json({ status: "Error", message: "Something went wrong. Please try again." });
  }
};

// Admin: list all subscribers (newest first).
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: "Success", subscribers });
  } catch (error) {
    console.error("Get subscribers error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};
