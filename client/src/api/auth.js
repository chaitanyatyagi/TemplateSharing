import apiClient from "../utils/apiClient";

export const phoneSignup = async (contact, userId) => {
  try {
    const response = await apiClient.post("/auth/sign-up/phone", {
      contact,
      userId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Phone signup failed: ${error.message}`);
  }
};

export const googleSignup = async (email, name, userId) => {
  try {
    const response = await apiClient.post("/auth/sign-up/google", {
      email,
      name,
      userId,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Google signup failed: ${error.message}`);
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.post("/auth/profile");
    return response.data;
  } catch (error) {
    throw new Error(`Get profile failed: ${error.message}`);
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.patch("/auth/profile/update", profileData);
    return response.data;
  } catch (error) {
    throw new Error(`Update profile failed: ${error.message}`);
  }
};
