import React, { useState, useEffect } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud, FileText } from "lucide-react";
import TemplateService from "../api/template";
import { getTemplateImageUrl } from "../utils/assetUrl";

const initialFormData = {
  name: "",
  card_content: "",
  template_title: "",
  template_url: "",
  template_link: "",
  template_type: "paid",
  price: "",
  template_content: "",
  template_description: "",
  template_tags: "",
  template_category: "",
  template_subcategory: "",
};

const EditTemplate = ({ setActiveMenu }) => {
  const [templateId, setTemplateId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [cardImagePreview, setCardImagePreview] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [templateFile, setTemplateFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem("editTemplateId");
    if (!storedId) {
      setError("No template selected to edit");
      setLoading(false);
      return;
    }
    setTemplateId(storedId);

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await TemplateService.getTemplateById(storedId);

        if (response.status === "Success" && response.template) {
          const t = response.template;
          setFormData({
            name: t.name || "",
            card_content: t.card_content || "",
            template_title: t.template_title || "",
            template_url: t.template_url || "",
            template_link: t.template_link || "",
            template_type: t.template_type || "paid",
            price: t.price ?? "",
            template_content: t.template_content || "",
            template_description: t.template_description || "",
            template_tags: (t.template_tags || []).join(", "),
            template_category: t.template_category || "",
            template_subcategory: t.template_subcategory || "",
          });
          setCardImagePreview(getTemplateImageUrl(t.card_image));
          setCurrentFileName(t.template_file_original || "");
        } else {
          setError(response.message || "Failed to fetch template");
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError(err.message || "Failed to fetch template");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  useEffect(() => {
    return () => localStorage.removeItem("editTemplateId");
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setTemplateFile(file);
  };

  const handleCancel = () => setActiveMenu("Template");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.template_title.trim() || formData.price === "") {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = templateFile
        ? { ...formData, template_file: templateFile }
        : formData;
      const response = await TemplateService.updateTemplate(templateId, payload);

      if (response.status === "Success") {
        setSuccess("Template updated successfully!");
        setTimeout(() => setActiveMenu("Template"), 1500);
      } else {
        setError(response.message || "Failed to update template");
      }
    } catch (err) {
      console.error("Error updating template:", err);
      setError(err.message || "Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
        <div className="mt-4 p-4 bg-lightBlue text-bluePrimary rounded-md">
          Loading template data...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
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
            <CheckCircle2 size={16} /> <span>{loading ? "Updating..." : "Update"}</span>
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
        <div className="flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Card Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
              placeholder="Comma separated"
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
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
              required
            />
          </div>
        </div>

        <div className="lg:w-1/3 flex flex-col gap-3">
          <label className="text-textDark font-semibold">Card Image</label>
          <div className="w-full min-h-40 border-2 border-dashed border-border bg-gray-50 rounded-md flex items-center justify-center overflow-hidden">
            {cardImagePreview ? (
              <img src={cardImagePreview} alt="Card" className="max-w-full max-h-40 object-contain" />
            ) : (
              <p className="text-sm text-grayLight px-3 text-center">No image</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Images can't be changed here yet — delete and recreate the template to change images.
          </p>

          {/* Deliverable File */}
          <label className="text-textDark font-semibold mt-2">Deliverable File</label>
          {currentFileName && !templateFile && (
            <div className="flex items-center gap-2 text-sm text-textDark bg-gray-50 border border-border rounded-md px-3 py-2">
              <FileText size={18} className="text-bluePrimary shrink-0" />
              <span className="break-all">{currentFileName}</span>
            </div>
          )}
          <div
            className="w-full min-h-20 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-3 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => document.getElementById("edit-template-file-upload").click()}
          >
            {templateFile ? (
              <div className="flex items-center gap-2 text-textDark">
                <FileText size={18} className="text-bluePrimary" />
                <span className="font-medium break-all">{templateFile.name}</span>
              </div>
            ) : (
              <>
                <UploadCloud className="mb-1 text-grayLight" size={22} />
                <p className="font-medium">{currentFileName ? "Replace file" : "Upload file"}</p>
              </>
            )}
            <input
              id="edit-template-file-upload"
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
              Cancel replacement
            </button>
          )}

          {/* Download Link */}
          <label className="text-textDark font-semibold mt-2">Download Link</label>
          <input
            type="text"
            name="template_link"
            value={formData.template_link}
            onChange={handleInputChange}
            placeholder="e.g. Figma share link (optional)"
            className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary text-sm"
          />
        </div>
      </form>
    </div>
  );
};

export default EditTemplate;
