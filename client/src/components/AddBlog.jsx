import React, { useState } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud, FileText, Eye, Pencil } from "lucide-react";
import BlogService from "../api/blog";
import RichTextEditor from "./RichTextEditor";
import BlogContent from "./BlogContent";

const CATEGORIES = [
  "technology",
  "business",
  "health",
  "lifestyle",
  "education",
  "entertainment",
];

// Quill represents an empty editor as "<p><br></p>"; treat that as empty.
const isEmptyHtml = (html) =>
  !html || html.replace(/<(p|br|div|span)[^>]*>/g, "").replace(/<\/(p|div|span)>/g, "").trim() === "";

const AddBlog = ({ activeMenu, setActiveMenu }) => {
  const [formData, setFormData] = useState({ name: "", content: "", type: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (html) => {
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (status) => {
    if (!formData.name.trim()) {
      setError("Please enter a blog title");
      return;
    }
    if (status === "published") {
      if (isEmptyHtml(formData.content)) {
        setError("Please write some content to publish (or save as draft)");
        return;
      }
      if (!formData.type.trim()) {
        setError("Please choose a category to publish");
        return;
      }
      if (!selectedImage) {
        setError("Please upload a cover image to publish");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await BlogService.createBlog({
        name: formData.name,
        content: formData.content,
        type: formData.type,
        status,
        image: selectedImage,
      });

      if (response.status === "Success") {
        setSuccess(status === "draft" ? "Draft saved!" : "Blog published!");
        setFormData({ name: "", content: "", type: "" });
        setSelectedImage(null);
        setTimeout(() => setActiveMenu(activeMenu), 1500);
      } else {
        setError(response.message || "Failed to save blog");
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", content: "", type: "" });
    setSelectedImage(null);
    setError(null);
    setSuccess(null);
    setActiveMenu(activeMenu);
  };

  const imageSrc = selectedImage ? URL.createObjectURL(selectedImage) : null;

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
      {/* Top Bar */}
      <div className="w-full bg-bluePrimary text-white flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3 rounded-t-md">
        <button
          className="flex items-center gap-2 text-white hover:text-gray-200 transition"
          onClick={handleCancel}
          disabled={loading}
        >
          <ArrowLeft size={18} />
          <span className="font-semibold">Back to Main Section</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            className="flex items-center gap-2 bg-white/10 text-white border border-white/40 px-3 py-1.5 rounded-md hover:bg-white/20 transition"
            onClick={() => setPreview((p) => !p)}
            disabled={loading}
          >
            {preview ? <Pencil size={16} /> : <Eye size={16} />}
            <span>{preview ? "Edit" : "Preview"}</span>
          </button>
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
            className="flex items-center gap-2 bg-white text-red-500 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
            onClick={handleCancel}
            disabled={loading}
          >
            <Trash2 size={16} /> <span>Cancel</span>
          </button>
        </div>
      </div>

      {success && <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">{success}</div>}
      {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {preview ? (
        /* ---------- Preview (approximates the public blog page) ---------- */
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
            {imageSrc && (
              <img src={imageSrc} alt="cover" className="w-full h-[300px] object-cover rounded-lg" />
            )}
            <h1 className="text-2xl md:text-3xl font-semibold text-textHeading">
              {formData.name || "Untitled blog"}
            </h1>
            {formData.type && (
              <span className="inline-block w-max bg-lightBlue text-bluePrimary text-sm font-medium px-3 py-1 rounded-lg capitalize">
                {formData.type}
              </span>
            )}
            {isEmptyHtml(formData.content) ? (
              <p className="text-grayLight">No content yet.</p>
            ) : (
              <BlogContent html={formData.content} />
            )}
          </div>
        </div>
      ) : (
        /* ---------- Editor ---------- */
        <div className="flex flex-col lg:flex-row gap-6 mt-6 bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Title</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter blog title"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
            </div>

            <div className="flex flex-col gap-2 sm:max-w-xs">
              <label className="text-textDark font-semibold">Category</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary capitalize"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Content</label>
              <RichTextEditor value={formData.content} onChange={handleContentChange} />
            </div>
          </div>

          {/* Cover image */}
          <div className="lg:w-1/3 flex flex-col gap-3">
            <label className="text-textDark font-semibold">Cover Image</label>
            <div
              className="w-full min-h-56 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-6 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => document.getElementById("blog-image-upload").click()}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="Selected" className="max-w-full max-h-48 object-contain" />
              ) : (
                <>
                  <UploadCloud className="mb-2 text-grayLight" size={30} />
                  <p className="font-medium">Click to upload cover image</p>
                  <p className="text-xs text-gray-500">(JPG, PNG, WebP - Max 10MB)</p>
                </>
              )}
              <input
                id="blog-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedImage(file);
                }}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBlog;
