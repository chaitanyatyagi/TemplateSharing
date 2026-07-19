import apiClient, { handleApiError } from "../utils/apiClient";

// Contact API Service
const ContactService = {
  createContact: async (name, email, comments) => {
    try {
      const response = await apiClient.post("/contact/create", {
        name,
        email,
        comments,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default ContactService;
