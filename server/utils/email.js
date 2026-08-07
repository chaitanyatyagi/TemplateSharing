const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Absolute path to the private (non-publicly-served) template files directory.
const TEMPLATE_FILES_DIR = path.join(__dirname, "../private/templates");

// Build a Gmail SMTP transporter from env vars. Returns null if email isn't
// configured yet, so the rest of the app keeps working (email is best-effort).
//
// Required env vars (see .env.development):
//   EMAIL_USER  -> the Gmail address that sends the mail
//   EMAIL_PASS  -> a Gmail *App Password* (NOT the normal account password)
//   EMAIL_FROM  -> optional display "From" (defaults to EMAIL_USER)
function getTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function isEmailConfigured() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

/**
 * Send the "purchase successful" email to the buyer with each purchased
 * template attached (when a file exists) and any external deliverable links.
 *
 * @param {Object} order          the saved Order document
 * @param {Array}  templates       the Template documents included in the order
 * @param {String} recipientEmail  preferred recipient (the logged-in buyer's
 *                                  account email); falls back to order.userEmail
 * @returns {Promise<boolean>} true if sent, false if skipped/failed
 */
async function sendPurchaseEmail(order, templates, recipientEmail) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn(
      "[email] EMAIL_USER/EMAIL_PASS not set — skipping purchase email. See .env.development."
    );
    return false;
  }

  // Deliver to the logged-in buyer's account email; fall back to the billing
  // email captured at checkout if for some reason the account has none.
  const to = recipientEmail || order.userEmail;
  if (!to) {
    console.warn("[email] No recipient email — skipping purchase email.");
    return false;
  }

  const attachments = [];
  const linkRows = [];

  for (const template of templates) {
    if (template.template_file) {
      const filePath = path.join(TEMPLATE_FILES_DIR, template.template_file);
      if (fs.existsSync(filePath)) {
        attachments.push({
          filename: template.template_file_original || template.template_file,
          path: filePath,
        });
      } else {
        console.warn(`[email] Missing template file on disk: ${filePath}`);
      }
    }
    if (template.template_link) {
      linkRows.push(
        `<li><strong>${escapeHtml(template.name || "Template")}:</strong> ` +
          `<a href="${escapeHtml(template.template_link)}">${escapeHtml(template.template_link)}</a></li>`
      );
    }
  }

  const itemRows = (order.items || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;">${escapeHtml(item.templateName || "Template")}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;text-align:center;">${item.quantity || 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;text-align:right;">₹${item.price}</td>
        </tr>`
    )
    .join("");

  const linksBlock = linkRows.length
    ? `<p style="margin:16px 0 4px;font-weight:600;color:#1F2937;">Your download links:</p>
       <ul style="margin:0 0 8px 18px;padding:0;color:#414A5A;">${linkRows.join("")}</ul>`
    : "";

  const attachmentNote = attachments.length
    ? `<p style="color:#414A5A;">Your purchased ${attachments.length > 1 ? "templates are" : "template is"} attached to this email.</p>`
    : "";

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;color:#414A5A;">
    <div style="background:#111827;padding:24px;border-radius:12px 12px 0 0;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Thank you for your purchase! 🎉</h1>
    </div>
    <div style="padding:24px;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;">
      <p>Hi ${escapeHtml(order.userName || "there")},</p>
      <p>Your order <strong>${escapeHtml(order.orderId)}</strong> was placed successfully. Here's a summary:</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;">
        <thead>
          <tr style="background:#F9FAFB;">
            <th style="padding:8px 12px;text-align:left;color:#1F2937;">Template</th>
            <th style="padding:8px 12px;text-align:center;color:#1F2937;">Qty</th>
            <th style="padding:8px 12px;text-align:right;color:#1F2937;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="text-align:right;font-size:16px;color:#1F2937;"><strong>Total: ₹${order.orderAmount}</strong></p>
      ${attachmentNote}
      ${linksBlock}
      <p style="margin-top:16px;">You can also re-download your templates anytime from your <strong>Profile → Purchased Items</strong>.</p>
      <p style="color:#606060;font-size:13px;margin-top:24px;">— The SmartTemp Team</p>
    </div>
  </div>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: `Your SmartTemp purchase (${order.orderId}) is confirmed`,
      html,
      attachments,
    });
    console.log(`[email] Purchase email sent to ${to} for ${order.orderId}`);
    return true;
  } catch (err) {
    console.error("[email] Failed to send purchase email:", err.message);
    return false;
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = { sendPurchaseEmail, isEmailConfigured, TEMPLATE_FILES_DIR };
