const Contact = require("../model/contactModel");

exports.createContact = async (req, res) => {
  try {
    const { name, email, comments } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!comments) missingFields.push("comments");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const contact = await Contact.create({ name, email, comments });

    return res.status(201).json({
      status: "Success",
      message: "Thanks for reaching out! We'll get back to you soon.",
      contact,
    });
  } catch (error) {
    console.error("Create contact error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "Success",
      contacts,
    });
  } catch (error) {
    console.error("Get all contacts error:", error);
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
