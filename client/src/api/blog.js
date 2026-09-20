import apiClient, { handleApiError } from "../utils/apiClient";

// Blog API Service
const BlogService = {
  // Get all blogs
  getAllBlogs: async (page = 1, limit = 10, category = null) => {
    try {
      const params = { page, limit };
      if (category) params.category = category;

      const response = await apiClient.post("/blog/get-all", {}, { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get blogs by category
  getBlogsByCategory: async (category, page = 1, limit = 10) => {
    try {
      const response = await apiClient.post("/blog/get-all-by-category", {
        category,
      }, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single blog by ID
  getBlogById: async (blogId) => {
    try {
      const response = await apiClient.post(`/blog/get-one/${blogId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      const formData = new FormData();

      // Append text fields
      formData.append("name", blogData.name);
      formData.append("content", blogData.content ?? "");
      formData.append("type", blogData.type ?? "");
      if (blogData.status) formData.append("status", blogData.status);

      // Append image if provided
      if (blogData.image) {
        formData.append("image", blogData.image);
      }

      const response = await apiClient.post("/blog/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update existing blog
  updateBlog: async (blogId, blogData) => {
    try {
      const formData = new FormData();

      // Append text fields
      if (blogData.name !== undefined) formData.append("name", blogData.name);
      if (blogData.content !== undefined) formData.append("content", blogData.content);
      if (blogData.type) formData.append("type", blogData.type);
      if (blogData.status) formData.append("status", blogData.status);

      // Append image if provided
      if (blogData.image) {
        formData.append("image", blogData.image);
      }

      const response = await apiClient.patch(`/blog/update/${blogId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Toggle like for a blog (any logged-in user). Returns { liked, likesCount }.
  toggleLike: async (blogId) => {
    try {
      const response = await apiClient.post(`/blog/like/${blogId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete blog
  deleteBlog: async (blogId) => {
    try {
      const response = await apiClient.delete(`/blog/delete/${blogId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Stream image (returns URL for direct use in img src)
  getImageStreamUrl: (filename, size = "thumbnail") => {
    // Remove file extension and add size suffix
    const baseName = filename.replace(/\.[^/.]+$/, "");
    return `/api/blog/stream/${baseName}-${size}.webp`;
  },
};

export default BlogService;
