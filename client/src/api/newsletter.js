import apiClient, { handleApiError } from "../utils/apiClient";

const NewsletterService = {
  subscribe: async (email) => {
    try {
      const response = await apiClient.post("/newsletter/subscribe", { email });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default NewsletterService;
