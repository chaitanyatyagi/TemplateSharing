import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../api/auth";
import OrderService from "../../api/order";

const emptyBilling = {
  userName: "",
  userEmail: "",
  userPhone: "",
  userCity: "",
  userState: "",
  userCountry: "India",
  userZip: "",
};

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, updateQuantity, removeItem, clear, subtotal } = useCart();

  const [step, setStep] = useState("cart"); // cart | checkout | success
  const [billing, setBilling] = useState(emptyBilling);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  // Prefill billing info from the user's account + saved profile
  useEffect(() => {
    if (!user) return;
    setBilling((prev) => ({
      ...prev,
      userName: prev.userName || user.displayName || "",
      userEmail: prev.userEmail || user.email || "",
      userPhone: prev.userPhone || user.phoneNumber || "",
    }));

    getProfile()
      .then((response) => {
        if (response.status === "Success" && response.user) {
          const profile = response.user;
          setBilling((prev) => ({
            ...prev,
            userCity: prev.userCity || profile.city || "",
            userState: prev.userState || profile.state || "",
            userZip: prev.userZip || profile.pincode || "",
            userPhone: prev.userPhone || profile.contact || "",
          }));
        }
      })
      .catch((err) => console.error("Could not prefill profile:", err));
  }, [user]);

  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + tax;

  const handleBillingChange = (e) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setPlacing(true);
      setError(null);

      const orderItems = items.map((item) => ({
        templateId: item.templateId,
        quantity: item.quantity,
      }));

      const response = await OrderService.createOrder(orderItems, billing);

      if (response.status === "Success") {
        clear();
        setStep("success");
      } else {
        setError(response.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  // Success state
  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <CheckCircle2 size={80} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Order placed successfully!
          </h2>
          <p className="text-gray-500 mb-6">
            You can track it under your Profile &gt; Purchased Items.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="bg-bluePrimary hover:bg-blueHover text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate("/templates")}
              className="border border-bluePrimary text-bluePrimary hover:bg-lightBlue px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 px-4">
          <ShoppingCart size={80} className="text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-6">
            Add some templates to get started!
          </p>
          <button
            onClick={() => navigate("/templates")}
            className="bg-bluePrimary hover:bg-blueHover text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Browse Templates
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow bg-gray-50 py-8">
        <div className="w-[90%] sm:w-[85%] lg:w-[80%] mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-textHeading mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600">
              {items.length} {items.length === 1 ? "item" : "items"} in your
              cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.templateId}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => navigate(`/templates/${item.templateId}`)}
                    />

                    {/* Product Details */}
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3
                            className="font-semibold text-lg text-textHeading cursor-pointer hover:text-bluePrimary"
                            onClick={() => navigate(`/templates/${item.templateId}`)}
                          >
                            {item.title}
                          </h3>
                          <span className="inline-block bg-lightBlue text-bluePrimary text-xs font-medium px-2 py-1 rounded mt-1">
                            {item.category}
                          </span>
                        </div>
                        <button
                          onClick={() => removeItem(item.templateId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            Quantity:
                          </span>
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() =>
                                updateQuantity(item.templateId, item.quantity - 1)
                              }
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1 font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.templateId, item.quantity + 1)
                              }
                              className="p-2 hover:bg-gray-100 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            ₹{item.price} each
                          </p>
                          <p className="text-xl font-bold text-bluePrimary">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary / Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-textHeading mb-4">
                  {step === "checkout" ? "Billing Details" : "Order Summary"}
                </h2>

                {step === "cart" && (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (18% GST)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between text-lg font-bold text-textHeading">
                          <span>Total</span>
                          <span className="text-bluePrimary">
                            ₹{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep("checkout")}
                      className="w-full bg-bluePrimary hover:bg-blueHover text-white py-3 rounded-lg font-semibold transition-all mb-3"
                    >
                      Proceed to Checkout
                    </button>

                    <button
                      onClick={() => navigate("/templates")}
                      className="w-full border border-bluePrimary text-bluePrimary hover:bg-lightBlue py-3 rounded-lg font-semibold transition-all"
                    >
                      Continue Shopping
                    </button>

                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        ✓ Instant download after purchase
                      </p>
                      <p className="text-sm text-gray-600">
                        ✓ 30-day money-back guarantee
                      </p>
                    </div>
                  </>
                )}

                {step === "checkout" && (
                  <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
                    {error && (
                      <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                      </div>
                    )}
                    <input
                      type="text"
                      name="userName"
                      placeholder="Full name"
                      value={billing.userName}
                      onChange={handleBillingChange}
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                      required
                    />
                    <input
                      type="email"
                      name="userEmail"
                      placeholder="Email"
                      value={billing.userEmail}
                      onChange={handleBillingChange}
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                      required
                    />
                    <input
                      type="tel"
                      name="userPhone"
                      placeholder="Phone number"
                      value={billing.userPhone}
                      onChange={handleBillingChange}
                      className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="userCity"
                        placeholder="City"
                        value={billing.userCity}
                        onChange={handleBillingChange}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        required
                      />
                      <input
                        type="text"
                        name="userState"
                        placeholder="State"
                        value={billing.userState}
                        onChange={handleBillingChange}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="userCountry"
                        placeholder="Country"
                        value={billing.userCountry}
                        onChange={handleBillingChange}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        required
                      />
                      <input
                        type="text"
                        name="userZip"
                        placeholder="ZIP / Postal code"
                        value={billing.userZip}
                        onChange={handleBillingChange}
                        className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
                        required
                      />
                    </div>

                    <div className="border-t pt-3 mt-2">
                      <div className="flex justify-between text-lg font-bold text-textHeading">
                        <span>Total</span>
                        <span className="text-bluePrimary">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={placing}
                      className="w-full bg-bluePrimary hover:bg-blueHover text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                    >
                      {placing ? "Placing order..." : "Place Order"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      disabled={placing}
                      className="w-full border border-gray-300 text-gray-600 hover:bg-gray-50 py-3 rounded-lg font-semibold transition-all"
                    >
                      Back to Cart
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
