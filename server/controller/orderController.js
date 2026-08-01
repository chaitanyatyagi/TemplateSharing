const Order = require("../model/orderModel");
const Template = require("../model/templateModel");
const { sendPurchaseEmail } = require("../utils/email");

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({
      status: "Success",
      orders,
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

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "Success",
      orders,
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

exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      userEmail,
      userPhone,
      userName,
      userCity,
      userState,
      userCountry,
      userZip,
      paymentMethod,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "Error",
        message: "Order must include at least one item",
      });
    }

    const missingFields = [];
    if (!userEmail) missingFields.push("userEmail");
    if (!userPhone) missingFields.push("userPhone");
    if (!userName) missingFields.push("userName");
    if (!userCity) missingFields.push("userCity");
    if (!userState) missingFields.push("userState");
    if (!userCountry) missingFields.push("userCountry");
    if (!userZip) missingFields.push("userZip");

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "Error",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const templateIds = items.map((item) => item.templateId).filter(Boolean);
    const templates = await Template.find({ _id: { $in: templateIds } });
    const templateMap = new Map(templates.map((t) => [t._id.toString(), t]));

    const orderItems = [];
    let orderAmount = 0;

    for (const item of items) {
      const template = templateMap.get(item.templateId);
      if (!template) {
        return res.status(404).json({
          status: "Error",
          message: `Template ${item.templateId} not found`,
        });
      }

      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      orderItems.push({
        templateId: template._id.toString(),
        templateName: template.name,
        price: template.price,
        quantity,
      });
      orderAmount += template.price * quantity;
    }

    const orderId = `ORDER-${Date.now()}`;

    const order = await Order.create({
      orderId,
      items: orderItems,
      userId: req.userId,
      orderAmount,
      orderStatus: "pending",
      paymentMethod: paymentMethod || "credit_card",
      userEmail,
      userPhone,
      userName,
      userCity,
      userState,
      userCountry,
      userZip,
    });

    // Best-effort purchase email with the purchased templates attached.
    // Never let an email hiccup fail the order — log and continue.
    let emailSent = false;
    try {
      const orderedTemplates = templateIds
        .map((id) => templateMap.get(id))
        .filter(Boolean);
      emailSent = await sendPurchaseEmail(order, orderedTemplates);
    } catch (emailErr) {
      console.error("Purchase email error:", emailErr.message);
    }

    return res.status(201).json({
      status: "Success",
      message: "Order placed successfully",
      emailSent,
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({
      status: "Error",
      message: error.message,
    });
  }
};
