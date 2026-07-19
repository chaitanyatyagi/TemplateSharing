import React, { useState } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud, X } from "lucide-react";
import TemplateService from "../api/template";

const initialFormData = {
  name: "",
  card_content: "",
  template_title: "",
  template_url: "",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const resetForm = () => {
    setFormData(initialFormData);
    setCardImage(null);
    setTemplateImages([]);
  };

  const handleCancel = () => {
    resetForm();
    setError(null);
    setSuccess(null);
    setActiveMenu(activeMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredTextFields = [
      "name",
      "card_content",
      "template_title",
      "template_url",
      "template_type",
      "template_content",
      "template_description",
      "template_tags",
      "template_category",
      "template_subcategory",
    ];
    const missing = requiredTextFields.filter((field) => !formData[field]?.trim());

    if (missing.length > 0 || formData.price === "") {
      setError("Please fill in all required fields");
      return;
    }
    if (!cardImage) {
      setError("Please upload a card image");
      return;
    }
    if (templateImages.length === 0) {
      setError("Please upload at least one template image");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await TemplateService.createTemplate({
        ...formData,
        card_image: cardImage,
        template_images: templateImages,
      });

      if (response.status === "Success") {
        setSuccess("Template created successfully!");
        resetForm();
        setTimeout(() => setActiveMenu(activeMenu), 1500);
      } else {
        setError(response.message || "Failed to create template");
      }
    } catch (err) {
      console.error("Error creating template:", err);
      setError(err.message || "Failed to create template");
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
            type="submit"
            className="flex items-center gap-2 bg-white text-bluePrimary px-3 py-1.5 rounded-md hover:bg-lightBlue transition"
            onClick={handleSubmit}
            disabled={loading}
          >
            <CheckCircle2 size={16} /> <span>{loading ? "Adding..." : "Add"}</span>
          </button>
          <button
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

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 mt-6 bg-white rounded-lg shadow-sm border border-border p-6">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Card Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Shown on the template card"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Full Title</label>
              <input
                type="text"
                name="template_title"
                value={formData.template_title}
                onChange={handleInputChange}
                placeholder="Shown on the detail page"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
            </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                value={formData.price}
                onChange={handleInputChange}
                placeholder={formData.template_type === "free" ? "0" : "Enter price"}
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Preview URL</label>
              <input
                type="text"
                name="template_url"
                value={formData.template_url}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              />
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
        </div>
      </form>
    </div>
  );
};

export default AddTemplate;
