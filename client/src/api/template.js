import apiClient, { handleApiError } from "../utils/apiClient";

const TEXT_FIELDS = [
  "name",
  "card_content",
  "template_title",
  "template_url",
  "template_link",
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
      if (templateData.template_file) {
        formData.append("template_file", templateData.template_file);
      }

      const response = await apiClient.post("/template/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Update existing template. Sends multipart when a new deliverable file is
  // provided (templateData.template_file is a File), otherwise plain JSON.
  updateTemplate: async (templateId, templateData) => {
    try {
      const hasFile = templateData.template_file instanceof File;

      if (hasFile) {
        const formData = new FormData();
        TEXT_FIELDS.forEach((field) => {
          if (templateData[field] !== undefined && templateData[field] !== null) {
            formData.append(field, templateData[field]);
          }
        });
        formData.append("template_file", templateData.template_file);

        const response = await apiClient.patch(
          `/template/update/${templateId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return response.data;
      }

      // Strip any non-file template_file placeholder before sending JSON.
      const { template_file, ...jsonData } = templateData;
      void template_file;
      const response = await apiClient.patch(
        `/template/update/${templateId}`,
        jsonData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Download a purchased template's deliverable. Returns either a saved file
  // (triggers browser download) or an external link to open. The caller gets
  // { type: "file" } | { type: "link", link } and should act accordingly.
  downloadTemplate: async (templateId, fallbackName = "template") => {
    try {
      const response = await apiClient.post(
        `/template/download/${templateId}`,
        {},
        { responseType: "blob" }
      );

      const contentType = response.headers["content-type"] || "";

      // Link-delivered templates come back as a JSON blob.
      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        const json = JSON.parse(text);
        if (json.link) return { type: "link", link: json.link };
        throw new Error(json.message || "Download unavailable");
      }

      // Parse filename from Content-Disposition, fall back to a sensible name.
      const disposition = response.headers["content-disposition"] || "";
      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)/i);
      const filename = match ? decodeURIComponent(match[1]) : fallbackName;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return { type: "file" };
    } catch (error) {
      // Error responses also arrive as blobs; unwrap the message when possible.
      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          throw new Error(json.message || "Download failed");
        } catch {
          throw new Error("Download failed");
        }
      }
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
