/**
 * Seed dummy deliverable files onto existing templates so downloads + email
 * can be tested end-to-end without re-uploading through the admin panel.
 *
 * What it does:
 *   1. Copies the sample files from /sample-templates into /private/templates
 *      (giving each a unique stored name).
 *   2. Assigns them round-robin to every Template that has no template_file yet.
 *
 * Idempotent: templates that already have a deliverable are left untouched.
 *
 * Run from the server directory:
 *   node scripts/seedTemplateFiles.js
 */
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config({
  path: path.join(
    __dirname,
    NODE_ENV === "production" ? "../.env.production" : "../.env.development"
  ),
});

const Template = require("../model/templateModel");

const sampleDir = path.join(__dirname, "../sample-templates");
const privateDir = path.join(__dirname, "../private/templates");

const SAMPLES = [
  "sample-spreadsheet.xlsx",
  "sample-guide.pdf",
  "sample-document.docx",
  "sample-budget.csv",
];

async function run() {
  if (!process.env.DATABASE) {
    console.error("DATABASE env var not set. Aborting.");
    process.exit(1);
  }
  if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir, { recursive: true });

  await mongoose.connect(process.env.DATABASE);
  console.log("Connected to DB.");

  const templates = await Template.find({
    $or: [{ template_file: { $exists: false } }, { template_file: "" }, { template_file: null }],
  });

  if (templates.length === 0) {
    console.log("No templates need a deliverable file. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  let i = 0;
  for (const template of templates) {
    const sample = SAMPLES[i % SAMPLES.length];
    const src = path.join(sampleDir, sample);
    if (!fs.existsSync(src)) {
      console.warn(`Sample missing: ${src} — skipping.`);
      i++;
      continue;
    }
    const storedName = `tf-seed-${Date.now()}-${i}-${sample}`;
    fs.copyFileSync(src, path.join(privateDir, storedName));

    template.template_file = storedName;
    template.template_file_original = sample;
    await template.save();
    console.log(`  ${template.name || template._id} -> ${sample}`);
    i++;
  }

  console.log(`Done. Seeded ${templates.length} template(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
