import React, { useState, useRef } from "react";
import { Trash2, CheckCircle2, ArrowLeft, UploadCloud } from "lucide-react";
import ImageUploader from "./ImageUploader";
import BlogService from "../api/blog";
import { useNavigate } from "react-router-dom";

const AddBlog = ({activeMenu,setActiveMenu}) => {
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    type: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name.trim() || !formData.content.trim() || !formData.type.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (!selectedImage) {
      setError("Please upload an image");
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
        image: selectedImage,
      };

      const response = await BlogService.createBlog(blogData);

      if (response.status === "Success") {
        setSuccess("Blog created successfully!");
        // Reset form
        setFormData({ name: "", content: "", type: "" });
        setSelectedImage(null);

        // Navigate back to blog list after 2 seconds
        setTimeout(() => {
          setActiveMenu(activeMenu);
        }, 2000);
      } else {
        setError(response.message || "Failed to create blog");
      }
    } catch (err) {
      console.error("Error creating blog:", err);
      setError(err.message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form and go back
    setFormData({ name: "", content: "", type: "" });
    setSelectedImage(null);
    setError(null);
    setSuccess(null);
    setActiveMenu(activeMenu);
  };

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

        {/* Right Section - Modified ImageUploader */}
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
                  // Preview the image immediately
                  const previewUrl = URL.createObjectURL(file);
                  // Force re-render by creating a new object
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

export default AddBlog;
