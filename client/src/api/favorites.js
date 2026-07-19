import apiClient, { handleApiError } from "../utils/apiClient";

// Favorites API Service (wishlist templates + saved blogs)
const FavoritesService = {
  getWishlist: async () => {
    try {
      const response = await apiClient.post("/auth/wishlist");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  toggleWishlist: async (templateId) => {
    try {
      const response = await apiClient.post("/auth/wishlist/toggle", { templateId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getSavedBlogs: async () => {
    try {
      const response = await apiClient.post("/auth/saved-blogs");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  toggleSavedBlog: async (blogId) => {
    try {
      const response = await apiClient.post("/auth/saved-blogs/toggle", { blogId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default FavoritesService;
