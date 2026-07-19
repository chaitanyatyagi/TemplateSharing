import React, { useState, useEffect } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud } from "lucide-react";
import BlogService from "../api/blog";
import { useNavigate, useParams } from "react-router-dom";

const EditBlog = ({ setActiveMenu }) => {
  const { blogId } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "",
  });
  const [localBlogId, setLocalBlogId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetch blog data for editing
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
          });
          setExistingImage(blog.imageUrls?.medium || "");
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

    // Check for blogId from URL params first, then from localStorage
    if (blogId) {
      fetchBlog(blogId);
    } else {
      // Try to get from localStorage
      const storedBlogId = localStorage.getItem('editBlogId');
      if (storedBlogId) {
        setLocalBlogId(storedBlogId);
        fetchBlog(storedBlogId);
      }
    }
  }, [blogId]);

  // Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('editBlogId');
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.content.trim() || !formData.type.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const blogData = {
        name: formData.name,
        content: formData.content,
        type: formData.type,
      };

      // Only include image if a new one is selected
      if (selectedImage) {
        blogData.image = selectedImage;
      }

      const blogIdToUse = blogId || localBlogId;
      const response = await BlogService.updateBlog(blogIdToUse, blogData);

      if (response.status === "Success") {
        setSuccess("Blog updated successfully!");
        // Navigate back to blog list after 2 seconds
        setTimeout(() => {
          setActiveMenu("Blog");
        }, 2000);
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

  const handleCancel = () => {
    setActiveMenu("Blog");
  };

  if (loading && !formData.name) {
    return (
      <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
        <div className="w-full bg-bluePrimary text-white flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 rounded-t-md">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 text-white hover:text-gray-200 transition"
              onClick={handleCancel}
              disabled={true}
            >
              <ArrowLeft size={18} />
              <span className="font-semibold">Back to Main Section</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 bg-white text-bluePrimary px-3 py-1.5 rounded-md hover:bg-lightBlue transition"
              disabled={true}
            >
              <CheckCircle2 size={16} /> <span>Loading...</span>
            </button>
            <button
              className="flex items-center gap-2 bg-white text-red-500 px-3 py-1.5 rounded-md hover:bg-red-50 transition"
              onClick={handleCancel}
              disabled={true}
            >
              <Trash2 size={16} /> <span>Cancel</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-lightBlue text-bluePrimary rounded-md">
          Loading blog data...
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mt-6 bg-white rounded-lg shadow-sm border border-border p-6 animate-pulse">
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="lg:w-1/3 flex flex-col gap-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="w-full h-56 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto font-inter">
      {/* 🔹 Top Bar */}
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

      {/* Success/Error Messages */}
      {success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* 🔹 Form Section */}
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 mt-6 bg-white rounded-lg shadow-sm border border-border p-6">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Title</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter blog title"
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            />
          </div>

          {/* Category & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Category</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                required
              >
                <option value="">Select category</option>
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="health">Health</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="education">Education</option>
                <option value="entertainment">Entertainment</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-textDark font-semibold">Type</label>
              <input
                type="text"
                placeholder="Additional type info"
                className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                disabled
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-textDark font-semibold">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              placeholder="Write blog content..."
              className="w-full border border-border bg-gray-50 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-bluePrimary resize-none"
              required
            />
          </div>
        </div>

        {/* Right Section - Image Upload */}
        <div className="lg:w-1/3 flex flex-col gap-3">
          <label className="text-textDark font-semibold">Blog Image</label>

          <div
            className="w-full min-h-56 border-2 border-dashed border-border bg-gray-50 rounded-md flex flex-col items-center justify-center text-grayLight text-sm text-center px-3 py-6 cursor-pointer hover:bg-gray-100 transition"
            onClick={() => document.getElementById('blog-image-upload').click()}
          >
            {selectedImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}
                  alt="Selected"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : existingImage ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={existingImage}
                  alt="Current blog image"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  Current Image (click to change)
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="mb-2 text-grayLight" size={30} />
                <p className="font-medium">Click to upload blog image</p>
                <p className="text-xs text-gray-500">(JPG, PNG, WebP - Max 10MB)</p>
              </>
            )}
            <input
              id="blog-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageSelect(file);
                  setSelectedImage(new File([file], file.name, { type: file.type }));
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditBlog;
