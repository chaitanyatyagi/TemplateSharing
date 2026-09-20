import React, { useState, useEffect } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud, FileText, Eye, Pencil } from "lucide-react";
import BlogService from "../api/blog";
import RichTextEditor from "./RichTextEditor";
import BlogContent from "./BlogContent";
import { getServerAssetUrl } from "../utils/assetUrl";
import { useParams } from "react-router-dom";

const CATEGORIES = ["technology", "business", "health", "lifestyle", "education", "entertainment"];

const isEmptyHtml = (html) =>
  !html || html.replace(/<(p|br|div|span)[^>]*>/g, "").replace(/<\/(p|div|span)>/g, "").trim() === "";

const EditBlog = ({ setActiveMenu }) => {
  const { blogId } = useParams();
  const [formData, setFormData] = useState({ name: "", content: "", type: "", status: "published" });
  const [localBlogId, setLocalBlogId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchBlog = async (idToFetch) => {
      try {
        setLoading(true);
        setError(null);
        const response = await BlogService.getBlogById(idToFetch);
        if (response.status === "Success") {
          const blog = response.blog;
          setFormData({
            name: blog.name || "",
            content: blog.content || "",
            type: blog.type || "",
            status: blog.status || "published",
          });
          setExistingImage(getServerAssetUrl(blog.imageUrls?.medium || ""));
        } else {
          setError(response.message || "Failed to fetch blog");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message || "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog(blogId);
    } else {
      const storedBlogId = localStorage.getItem("editBlogId");
      if (storedBlogId) {
        setLocalBlogId(storedBlogId);
        fetchBlog(storedBlogId);
      } else {
        setError("No blog selected to edit");
        setLoading(false);
      }
    }
  }, [blogId]);

  useEffect(() => {
    return () => localStorage.removeItem("editBlogId");
  }, []);

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
      if (!selectedImage && !existingImage) {
        setError("Please add a cover image to publish");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const blogData = {
        name: formData.name,
        content: formData.content,
        type: formData.type,
        status,
      };
      if (selectedImage) blogData.image = selectedImage;

      const blogIdToUse = blogId || localBlogId;
      const response = await BlogService.updateBlog(blogIdToUse, blogData);

      if (response.status === "Success") {
        setSuccess(status === "draft" ? "Saved as draft!" : "Blog published!");
        setTimeout(() => setActiveMenu("Blog"), 1500);
      } else {
        setError(response.message || "Failed to update blog");
      }
    } catch (err) {
      console.error("Error updating blog:", err);
      setError(err.message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => setActiveMenu("Blog");

  const imageSrc = selectedImage ? URL.createObjectURL(selectedImage) : existingImage;

  if (loading && !formData.name) {
    return (
      <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
        <div className="mt-4 p-4 bg-lightBlue text-bluePrimary rounded-md">Loading blog data...</div>
      </div>
    );
  }

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
            <CheckCircle2 size={16} /> <span>{loading ? "Saving..." : "Publish"}</span>
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

          <div className="lg:w-1/3 flex flex-col gap-3">
            <label className="text-textDark font-semibold">Cover Image</label>
            <div
              className="relative w-full min-h-56 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-6 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => document.getElementById("edit-blog-image-upload").click()}
            >
              {imageSrc ? (
                <>
                  <img src={imageSrc} alt="Cover" className="max-w-full max-h-48 object-contain" />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    Click to change
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud className="mb-2 text-grayLight" size={30} />
                  <p className="font-medium">Click to upload cover image</p>
                  <p className="text-xs text-gray-500">(JPG, PNG, WebP - Max 10MB)</p>
                </>
              )}
              <input
                id="edit-blog-image-upload"
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

export default EditBlog;
