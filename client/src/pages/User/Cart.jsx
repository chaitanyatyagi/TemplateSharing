import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, CheckCircle2, ArrowLeft, Download, ShieldCheck, AlertCircle } from "lucide-react";
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

  const handleBillingChange = (e) => setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setPlacing(true);
      setError(null);
      const orderItems = items.map((item) => ({ templateId: item.templateId, quantity: item.quantity }));
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

  const inputClass =
    "w-full border border-borderLight rounded-xl px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition";

  // ---- Success ----
  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-greenAccent/10 flex items-center justify-center mb-5">
            <CheckCircle2 size={44} className="text-greenAccent" />
          </div>
          <h2 className="text-2xl font-bold text-textHeading mb-2">Order placed successfully!</h2>
          <p className="text-textMuted mb-6 max-w-md">
            Your templates are on the way to your inbox. You can download them anytime from your profile.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/profile")} className="bg-bluePrimary hover:bg-blueHover text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md">
              View my downloads
            </button>
            <button onClick={() => navigate("/templates")} className="border border-border text-textHeading hover:border-bluePrimary hover:text-bluePrimary px-6 py-3 rounded-xl font-semibold transition-all">
              Continue shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ---- Empty ----
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-lightBlue flex items-center justify-center mb-5">
            <ShoppingCart size={40} className="text-bluePrimary" />
          </div>
          <h2 className="text-2xl font-bold text-textHeading mb-2">Your cart is empty</h2>
          <p className="text-textMuted mb-6">Add some templates to get started.</p>
          <button onClick={() => navigate("/templates")} className="bg-bluePrimary hover:bg-blueHover text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md">
            Browse templates
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-10">
        <button onClick={() => navigate("/templates")} className="inline-flex items-center gap-2 text-textMuted hover:text-bluePrimary transition mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Continue shopping
        </button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-textHeading">Shopping cart</h1>
          <p className="text-textMuted mt-1">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.templateId} className="bg-white rounded-2xl border border-borderLight shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full sm:w-32 h-32 object-cover rounded-xl cursor-pointer"
                    onClick={() => navigate(`/templates/${item.templateId}`)}
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400"; }}
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-lg text-textHeading cursor-pointer hover:text-bluePrimary transition" onClick={() => navigate(`/templates/${item.templateId}`)}>
                          {item.title}
                        </h3>
                        <span className="inline-block bg-lightBlue text-bluePrimary text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md mt-1">
                          {item.category}
                        </span>
                      </div>
                      <button onClick={() => removeItem(item.templateId)} className="text-grayLight hover:text-redAccent transition-colors" aria-label="Remove item">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                      <div className="flex items-center border border-borderLight rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.templateId, item.quantity - 1)} className="p-2 hover:bg-background transition-colors" aria-label="Decrease quantity">
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-1 font-semibold text-textHeading">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.templateId, item.quantity + 1)} className="p-2 hover:bg-background transition-colors" aria-label="Increase quantity">
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-textMuted">₹{item.price} each</p>
                        <p className="text-lg font-bold text-bluePrimary">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary / Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-borderLight shadow-sm p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold text-textHeading mb-4">
                {step === "checkout" ? "Billing details" : "Order summary"}
              </h2>

              {step === "cart" && (
                <>
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-textMuted text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-textMuted text-sm">
                      <span>Tax (18% GST)</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-borderLight pt-3 flex justify-between text-lg font-bold text-textHeading">
                      <span>Total</span>
                      <span className="text-bluePrimary">₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={() => setStep("checkout")} className="w-full bg-bluePrimary hover:bg-blueHover text-white py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md mb-3">
                    Proceed to checkout
                  </button>

                  <div className="mt-5 pt-5 border-t border-borderLight flex flex-col gap-2 text-sm text-textMuted">
                    <span className="inline-flex items-center gap-2"><Download size={16} className="text-bluePrimary" /> Instant download after purchase</span>
                    <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-bluePrimary" /> Delivered to your email</span>
                  </div>
                </>
              )}

              {step === "checkout" && (
                <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-redAccent/10 text-redAccent rounded-xl text-sm">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
                    </div>
                  )}
                  <input type="text" name="userName" placeholder="Full name" value={billing.userName} onChange={handleBillingChange} className={inputClass} required />
                  <input type="email" name="userEmail" placeholder="Email" value={billing.userEmail} onChange={handleBillingChange} className={inputClass} required />
                  <input type="tel" name="userPhone" placeholder="Phone number" value={billing.userPhone} onChange={handleBillingChange} className={inputClass} required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="userCity" placeholder="City" value={billing.userCity} onChange={handleBillingChange} className={inputClass} required />
                    <input type="text" name="userState" placeholder="State" value={billing.userState} onChange={handleBillingChange} className={inputClass} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="userCountry" placeholder="Country" value={billing.userCountry} onChange={handleBillingChange} className={inputClass} required />
                    <input type="text" name="userZip" placeholder="ZIP / Postal code" value={billing.userZip} onChange={handleBillingChange} className={inputClass} required />
                  </div>

                  <div className="border-t border-borderLight pt-3 mt-1 flex justify-between text-lg font-bold text-textHeading">
                    <span>Total</span>
                    <span className="text-bluePrimary">₹{total.toFixed(2)}</span>
                  </div>

                  <button type="submit" disabled={placing} className="w-full bg-bluePrimary hover:bg-blueHover text-white py-3 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-50">
                    {placing ? "Placing order..." : "Place order"}
                  </button>
                  <button type="button" onClick={() => setStep("cart")} disabled={placing} className="w-full border border-border text-textMuted hover:bg-background py-3 rounded-xl font-semibold transition-all">
                    Back to cart
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
