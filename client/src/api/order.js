import apiClient, { handleApiError } from "../utils/apiClient";

// Order API Service
const OrderService = {
  // Create order from cart items + billing info
  // items: [{ templateId, quantity }]
  // billingInfo: { userEmail, userPhone, userName, userCity, userState, userCountry, userZip, paymentMethod }
  createOrder: async (items, billingInfo) => {
    try {
      const response = await apiClient.post("/order/create", {
        items,
        ...billingInfo,
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get orders for the logged-in user
  getOrdersByUser: async () => {
    try {
      const response = await apiClient.post("/order/get-by-user");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Get all orders (admin only)
  getAllOrders: async () => {
    try {
      const response = await apiClient.post("/order/get-all");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default OrderService;
