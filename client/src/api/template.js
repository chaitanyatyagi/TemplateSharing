import apiClient, { handleApiError } from "../utils/apiClient";

const TEXT_FIELDS = [
  "name",
  "card_content",
  "template_title",
  "template_url",
  "template_type",
  "price",
  "template_content",
  "template_description",
  "template_tags",
  "template_category",
  "template_subcategory",
];

// Template API Service
const TemplateService = {
  // Get all templates
  getAllTemplates: async () => {
    try {
      const response = await apiClient.post("/template/get-all");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get templates by category
  getTemplatesByCategory: async (category) => {
    try {
      const response = await apiClient.post("/template/get-all-by-category", {
        template_category: category,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get single template by ID
  getTemplateById: async (templateId) => {
    try {
      const response = await apiClient.post(`/template/get-one/${templateId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Create new template (card_image: single File, template_images: File[])
  createTemplate: async (templateData) => {
    try {
      const formData = new FormData();

      TEXT_FIELDS.forEach((field) => {
        if (templateData[field] !== undefined && templateData[field] !== null) {
          formData.append(field, templateData[field]);
        }
      });

      if (templateData.card_image) {
        formData.append("card_image", templateData.card_image);
      }
      if (templateData.template_images?.length) {
        templateData.template_images.forEach((file) => {
          formData.append("template_images", file);
        });
      }

      const response = await apiClient.post("/template/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update existing template (text fields only, no image re-upload)
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await apiClient.patch(
        `/template/update/${templateId}`,
        templateData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Delete template
  deleteTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`/template/delete/${templateId}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default TemplateService;
