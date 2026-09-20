import React, { useState } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud, X, FileText } from "lucide-react";
import TemplateService from "../api/template";

const initialFormData = {
  name: "",
  card_content: "",
  template_link: "",
  template_type: "paid",
  price: "",
  template_content: "",
  template_description: "",
  template_tags: "",
  template_category: "",
  template_subcategory: "",
};

const AddTemplate = ({ activeMenu, setActiveMenu }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [cardImage, setCardImage] = useState(null);
  const [templateImages, setTemplateImages] = useState([]);
  const [templateFile, setTemplateFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      // Free templates are always ₹0 — clear/lock the price automatically.
      if (name === "template_type" && value === "free") next.price = "0";
      return next;
    });
  };

  const isFree = formData.template_type === "free";

  const handleCardImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) setCardImage(file);
  };

  const handleTemplateImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setTemplateImages((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeTemplateImage = (idx) => {
    setTemplateImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTemplateFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setTemplateFile(file);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setCardImage(null);
    setTemplateImages([]);
    setTemplateFile(null);
  };

  const handleCancel = () => {
    resetForm();
    setError(null);
    setSuccess(null);
    setActiveMenu(activeMenu);
  };

  const handleSubmit = async (status) => {
    // A draft only needs a title; everything else can be filled in later.
    if (!formData.name?.trim()) {
      setError("Please enter a title");
      return;
    }

    if (status === "published") {
      const requiredTextFields = [
        "card_content",
        "template_type",
        "template_content",
        "template_description",
        "template_tags",
        "template_category",
        "template_subcategory",
      ];
      const missing = requiredTextFields.filter((field) => !formData[field]?.trim());
      if (missing.length > 0 || (!isFree && formData.price === "")) {
        setError("Please fill in all required fields to publish (or save as draft instead)");
        return;
      }
      if (!cardImage) {
        setError("Please upload a card image to publish");
        return;
      }
      if (templateImages.length === 0) {
        setError("Please upload at least one template image to publish");
        return;
      }
      if (!templateFile && !formData.template_link?.trim()) {
        setError("Add the deliverable: upload a template file or provide a download link");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await TemplateService.createTemplate({
        ...formData,
        price: isFree ? 0 : formData.price,
        status,
        card_image: cardImage,
        template_images: templateImages,
        template_file: templateFile,
      });

      if (response.status === "Success") {
        setSuccess(status === "draft" ? "Draft saved!" : "Template published!");
        resetForm();
        setTimeout(() => setActiveMenu(activeMenu), 1500);
      } else {
        setError(response.message || "Failed to save template");
      }
    } catch (err) {
      console.error("Error creating template:", err);
      setError(err.message || "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
      {/* Top Bar */}
      <div className="w-full bg-bluePrimary text-white flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 rounded-t-md">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 text-white hover:text-gray-200 transition"
            onClick={handleCancel}
            disabled={loading}
          >
            <ArrowLeft size={18} />
            <span className="font-semibold">Back to Main Section</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-white/10 text-white border border-white/40 px-3 py-1.5 rounded-md hover:bg-white/20 transition"
            onClick={() => handleSubmit("draft")}
            disabled={loading}
          >
            <FileText size={16} /> <span>{loading ? "Saving..." : "Save as Draft"}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-white text-bluePrimary px-3 py-1.5 rounded-md hover:bg-lightBlue transition"
            onClick={() => handleSubmit("published")}
            disabled={loading}
          >
            <CheckCircle2 size={16} /> <span>{loading ? "Publishing..." : "Publish"}</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 bg-white text-red-500 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
            onClick={handleCancel}
            disabled={loading}
          >
            <Trash2 size={16} /> <span>Cancel</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col lg:flex-row gap-6 mt-6 bg-white rounded-lg shadow-sm border border-border p-6">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Template title (shown on the card and detail page)"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Card Description</label>
            <textarea
              name="card_content"
              value={formData.card_content}
              onChange={handleInputChange}
              rows="2"
              placeholder="Short blurb shown on the card"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Type</label>
              <select
                name="template_type"
                value={formData.template_type}
                onChange={handleInputChange}
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              >
                <option value="paid">Paid</option>
                <option value="free">Free</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Price (₹)</label>
              <input
                type="number"
                name="price"
                min="0"
                value={isFree ? 0 : formData.price}
                onChange={handleInputChange}
                disabled={isFree}
                placeholder={isFree ? "Free" : "Enter price"}
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {isFree && (
                <p className="text-xs text-grayLight">Free templates are automatically priced ₹0.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Category</label>
              <input
                type="text"
                name="template_category"
                value={formData.template_category}
                onChange={handleInputChange}
                placeholder="e.g. finance, portfolio, business"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Subcategory</label>
              <input
                type="text"
                name="template_subcategory"
                value={formData.template_subcategory}
                onChange={handleInputChange}
                placeholder="e.g. dashboard, resume"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Tags</label>
            <input
              type="text"
              name="template_tags"
              value={formData.template_tags}
              onChange={handleInputChange}
              placeholder="Comma separated, e.g. notion, planner, ai"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Full Description</label>
            <textarea
              name="template_description"
              value={formData.template_description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Detailed description shown on the detail page"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Template Content</label>
            <textarea
              name="template_content"
              value={formData.template_content}
              onChange={handleInputChange}
              rows="4"
              placeholder="What's included, how it works, etc."
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
              required
            />
          </div>
        </div>

        {/* Right Section - Images */}
        <div className="lg:w-1/3 flex flex-col gap-5">
          {/* Card Image */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Card Image</label>
            <div
              className="w-full min-h-40 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-6 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => document.getElementById("template-card-image-upload").click()}
            >
              {cardImage ? (
                <img
                  src={URL.createObjectURL(cardImage)}
                  alt="Card preview"
                  className="max-w-full max-h-32 object-contain"
                />
              ) : (
                <>
                  <UploadCloud className="mb-2 text-grayLight" size={26} />
                  <p className="font-medium">Click to upload card image</p>
                </>
              )}
              <input
                id="template-card-image-upload"
                type="file"
                accept="image/*"
                onChange={handleCardImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Template Images */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">
              Template Images ({templateImages.length}/5)
            </label>
            <div
              className="w-full min-h-24 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-4 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => document.getElementById("template-images-upload").click()}
            >
              <UploadCloud className="mb-2 text-grayLight" size={26} />
              <p className="font-medium">Click to upload (up to 5)</p>
              <input
                id="template-images-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleTemplateImagesSelect}
                className="hidden"
              />
            </div>
            {templateImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-1">
                {templateImages.map((file, idx) => (
                  <div key={idx} className="relative group rounded-md overflow-hidden border border-border">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${idx}`}
                      className="w-full h-16 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeTemplateImage(idx)}
                      className="absolute top-0.5 right-0.5 bg-black bg-opacity-60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deliverable File — what the buyer downloads / gets emailed */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Deliverable File</label>
            <div
              className="w-full min-h-24 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-4 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => document.getElementById("template-file-upload").click()}
            >
              {templateFile ? (
                <div className="flex items-center gap-2 text-textDark">
                  <FileText size={20} className="text-bluePrimary" />
                  <span className="font-medium break-all">{templateFile.name}</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="mb-2 text-grayLight" size={26} />
                  <p className="font-medium">Excel, PDF, Word, Figma export, ZIP…</p>
                </>
              )}
              <input
                id="template-file-upload"
                type="file"
                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.fig,.zip,.txt,.png,.jpg,.jpeg,.svg"
                onChange={handleTemplateFileSelect}
                className="hidden"
              />
            </div>
            {templateFile && (
              <button
                type="button"
                onClick={() => setTemplateFile(null)}
                className="text-xs text-redAccent self-start"
              >
                Remove file
              </button>
            )}
          </div>

          {/* Or a link (e.g. Figma) */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Or Download Link</label>
            <input
              type="text"
              name="template_link"
              value={formData.template_link}
              onChange={handleInputChange}
              placeholder="e.g. Figma share link (optional if a file is uploaded)"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
            />
            <p className="text-xs text-grayLight">
              Provide a file, a link, or both. The buyer receives these on purchase and from their profile.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTemplate;
