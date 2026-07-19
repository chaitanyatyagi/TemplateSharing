import apiClient, { handleApiError } from "../utils/apiClient";

export const admin = async () => {
  try {
    const response = await apiClient.post("/admin", {
      userId: localStorage.getItem("uid"),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Admin check failed: ${error.message}`);
  }
};

export const getAllUsers = async () => {
  try {
    const response = await apiClient.post("/admin/users");
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await apiClient.post("/admin/stats");
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
