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

  // Verify a Razorpay payment and complete the order
  verifyPayment: async (payload) => {
    try {
      const response = await apiClient.post("/order/verify", payload);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Mark a pending order as failed (payment dismissed/errored)
  markPaymentFailed: async (orderId) => {
    try {
      const response = await apiClient.post("/order/payment-failed", { orderId });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default OrderService;
