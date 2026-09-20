const crypto = require("crypto");
const Razorpay = require("razorpay");
const Order = require("../model/orderModel");
const Template = require("../model/templateModel");
const { sendPurchaseEmail } = require("../utils/email");

// Lazily build the Razorpay client from env keys. Returns null if not configured.
let razorpayInstance = null;
function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  razorpayInstance = new Razorpay({ key_id, key_secret });
  return razorpayInstance;
}

// Best-effort purchase email with the purchased templates attached.
async function emailForOrder(order, templateMap, recipientEmail) {
  try {
    const orderedTemplates = (order.items || [])
      .map((it) => templateMap.get(it.templateId))
      .filter(Boolean);
    return await sendPurchaseEmail(order, orderedTemplates, recipientEmail);
  } catch (err) {
    console.error("Purchase email error:", err.message);
    return false;
  }
}

exports.getOrdersByUser = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ status: "Success", orders });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: "Success", orders });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// Creates the order. Free orders (total 0) are completed immediately with no
// gateway. Paid orders are saved as "pending" and a Razorpay order is created;
// the client then pays and calls /verify to complete it.
exports.createOrder = async (req, res) => {
  try {
    const {
      items, userEmail, userPhone, userName, userCity, userState, userCountry, userZip,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: "Error", message: "Order must include at least one item" });
    }

    const missingFields = [];
    ["userEmail", "userPhone", "userName", "userCity", "userState", "userCountry", "userZip"].forEach((f) => {
      if (!req.body[f]) missingFields.push(f);
    });
    if (missingFields.length > 0) {
      return res.status(400).json({ status: "Error", message: `Missing required fields: ${missingFields.join(", ")}` });
    }

    const templateIds = items.map((item) => item.templateId).filter(Boolean);
    const templates = await Template.find({ _id: { $in: templateIds } });
    const templateMap = new Map(templates.map((t) => [t._id.toString(), t]));

    const orderItems = [];
    let orderAmount = 0;
    for (const item of items) {
      const template = templateMap.get(item.templateId);
      if (!template) {
        return res.status(404).json({ status: "Error", message: `Template ${item.templateId} not found` });
      }
      const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1;
      // Free templates are always priced 0 (authoritative, server-side).
      const price = template.template_type === "free" ? 0 : Number(template.price) || 0;
      orderItems.push({ templateId: template._id.toString(), templateName: template.name, price, quantity });
      orderAmount += price * quantity;
    }

    const orderId = `ORDER-${Date.now()}`;
    const baseFields = {
      orderId, items: orderItems, userId: req.userId, orderAmount,
      userEmail, userPhone, userName, userCity, userState, userCountry, userZip,
    };

    // ---- Free order: no gateway, complete immediately ----
    if (orderAmount <= 0) {
      const order = await Order.create({
        ...baseFields, orderStatus: "completed", paymentMethod: "free",
      });
      const emailSent = await emailForOrder(order, templateMap, req.user?.email);
      return res.status(201).json({
        status: "Success",
        requiresPayment: false,
        message: "Order placed successfully",
        emailSent,
        order,
      });
    }

    // ---- Paid order: create pending + a Razorpay order ----
    const rzp = getRazorpay();
    if (!rzp) {
      return res.status(503).json({
        status: "Error",
        message: "Online payments aren't configured yet. Please try again later.",
      });
    }

    const order = await Order.create({
      ...baseFields, orderStatus: "pending", paymentMethod: "razorpay",
    });

    let rzpOrder;
    try {
      rzpOrder = await rzp.orders.create({
        amount: Math.round(orderAmount * 100), // paise
        currency: "INR",
        receipt: order.orderId,
        notes: { dbOrderId: order._id.toString(), userId: req.userId },
      });
    } catch (rzpErr) {
      console.error("Razorpay order create failed:", rzpErr?.error || rzpErr?.message);
      order.orderStatus = "failed";
      await order.save();
      return res.status(502).json({ status: "Error", message: "Could not start payment. Please try again." });
    }

    order.razorpayOrderId = rzpOrder.id;
    await order.save();

    return res.status(201).json({
      status: "Success",
      requiresPayment: true,
      order,
      razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "Error", message: error.message });
    }
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// Verifies the Razorpay signature and completes the order (or marks it failed).
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.userId });
    if (!order) {
      return res.status(404).json({ status: "Error", message: "Order not found" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      order.orderStatus = "failed";
      await order.save();
      return res.status(400).json({ status: "Error", message: "Payment verification failed" });
    }

    order.orderStatus = "completed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    await order.save();

    // Email the templates now that payment is confirmed.
    const templateIds = (order.items || []).map((i) => i.templateId);
    const templates = await Template.find({ _id: { $in: templateIds } });
    const templateMap = new Map(templates.map((t) => [t._id.toString(), t]));
    const emailSent = await emailForOrder(order, templateMap, req.user?.email);

    return res.status(200).json({
      status: "Success",
      message: "Payment successful",
      emailSent,
      order,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

// Marks a pending order as failed (payment dismissed / errored on the client).
exports.markPaymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.userId, orderStatus: "pending" },
      { orderStatus: "failed" },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ status: "Error", message: "Pending order not found" });
    }
    return res.status(200).json({ status: "Success", order });
  } catch (error) {
    console.error("Mark failed error:", error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};
