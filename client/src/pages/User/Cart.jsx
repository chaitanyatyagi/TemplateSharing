import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, CheckCircle2, ArrowLeft, Download, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getProfile } from "../../api/auth";
import OrderService from "../../api/order";

const emptyBilling = { userName: "", userEmail: "", userPhone: "", userCity: "", userState: "", userCountry: "India", userZip: "" };

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
    setBilling((p) => ({ ...p, userName: p.userName || user.displayName || "", userEmail: p.userEmail || user.email || "", userPhone: p.userPhone || user.phoneNumber || "" }));
    getProfile().then((res) => {
      if (res.status === "Success" && res.user) {
        const pr = res.user;
        setBilling((p) => ({ ...p, userCity: p.userCity || pr.city || "", userState: p.userState || pr.state || "", userZip: p.userZip || pr.pincode || "", userPhone: p.userPhone || pr.contact || "" }));
      }
    }).catch((e) => console.error(e));
  }, [user]);

  const total = subtotal;
  const changeBilling = (e) => setBilling((p) => ({ ...p, [e.target.name]: e.target.value }));

  const openRazorpay = (order, rzp) => {
    if (!window.Razorpay) { setError("Payment library failed to load. Please refresh and try again."); return; }
    const options = {
      key: rzp.keyId, amount: rzp.amount, currency: rzp.currency, name: "SmartTemp",
      description: `Order ${order.orderId}`, order_id: rzp.orderId,
      prefill: { name: billing.userName, email: billing.userEmail, contact: billing.userPhone },
      theme: { color: "#22396F" },
      handler: async (rp) => {
        try {
          setPlacing(true); setError(null);
          const res = await OrderService.verifyPayment({ orderId: order._id, razorpay_order_id: rp.razorpay_order_id, razorpay_payment_id: rp.razorpay_payment_id, razorpay_signature: rp.razorpay_signature });
          if (res.status === "Success") { clear(); setStep("success"); }
          else setError(res.message || "Payment verification failed. Check your profile for status.");
        } catch (err) { setError(err.message || "Payment verification failed. Check your profile for status."); }
        finally { setPlacing(false); }
      },
      modal: { ondismiss: async () => { setPlacing(false); try { await OrderService.markPaymentFailed(order._id); } catch { /* ignore */ } setError("Payment cancelled — saved as 'failed' in your profile. You can try again."); } },
    };
    const obj = new window.Razorpay(options);
    obj.on("payment.failed", async (resp) => { setPlacing(false); try { await OrderService.markPaymentFailed(order._id); } catch { /* ignore */ } setError(resp?.error?.description || "Payment failed — saved as 'failed' in your profile."); });
    obj.open();
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    try {
      setPlacing(true); setError(null);
      const orderItems = items.map((i) => ({ templateId: i.templateId, quantity: i.quantity }));
      const res = await OrderService.createOrder(orderItems, billing);
      if (res.status !== "Success") { setError(res.message || "Failed to place order"); return; }
      if (!res.requiresPayment) { clear(); setStep("success"); return; }
      openRazorpay(res.order, res.razorpay);
    } catch (err) { setError(err.message || "Failed to place order"); }
    finally { setPlacing(false); }
  };

  const input = "h-11 border-0 border-b border-ink bg-transparent text-[16px] outline-none focus:border-terracotta transition-colors placeholder-faint min-w-0";

  if (step === "success") {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 gap-[18px] animate-rise">
          <div className="w-[84px] h-[84px] rounded-full border border-successGreen flex items-center justify-center"><CheckCircle2 size={40} className="text-successGreen" /></div>
          <h2 className="font-display text-[clamp(44px,5vw,64px)] leading-none m-0">Order placed successfully!</h2>
          <p className="max-w-[440px] text-bodytext m-0">Your templates are on the way to your inbox. You can download them anytime from your profile.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <button onClick={() => navigate("/profile")} className="h-[54px] px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors">View my downloads</button>
            <button onClick={() => navigate("/templates")} className="h-[54px] px-6 rounded-full border border-ink font-semibold hover:bg-ink hover:text-cream transition-colors">Continue shopping</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 gap-4 animate-rise">
          <ShoppingCart size={40} className="text-terracotta" />
          <h2 className="font-display text-[56px] leading-none m-0">Your cart is empty</h2>
          <p className="text-bodytext m-0">Add some templates to get started.</p>
          <button onClick={() => navigate("/templates")} className="mt-2 h-[54px] px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors">Browse templates</button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <div className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-16 md:pb-28">
        <button onClick={() => navigate("/templates")} className="flex items-center gap-2 py-2 mb-7 text-sm font-medium text-muted2 hover:text-ink hover:gap-3.5 transition-all"><ArrowLeft size={16} /> Continue shopping</button>

        <div className="flex items-baseline gap-[18px] flex-wrap border-b border-ink pb-6 animate-rise">
          <h1 className="font-display text-[clamp(52px,6vw,88px)] leading-[.95] tracking-[-.02em] m-0">Shopping cart</h1>
          <span className="font-mono text-[13px] text-muted2">{items.length} {items.length === 1 ? "item" : "items"}</span>
        </div>

        <div className="flex flex-wrap gap-8 md:gap-16 items-start">
          {/* Items */}
          <div className="flex-[2_1_520px] min-w-0">
            {items.map((item) => (
              <div key={item.templateId} className="flex flex-wrap gap-5 py-7 border-b border-line">
                <div onClick={() => navigate(`/templates/${item.templateId}`)} className="w-[132px] aspect-[4/3] border border-line overflow-hidden cursor-pointer shrink-0 bg-[repeating-linear-gradient(135deg,#F2E4BC_0_7px,#ECDCAC_7px_14px)]">
                  {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 basis-[240px] min-w-0 flex flex-col gap-3.5">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-mono text-[11px] font-medium tracking-[.1em] uppercase text-terracotta">{item.category}</div>
                      <h3 onClick={() => navigate(`/templates/${item.templateId}`)} className="font-display text-[28px] leading-[1.1] mt-1 cursor-pointer hover:text-terracotta transition-colors m-0">{item.title}</h3>
                    </div>
                    <button onClick={() => removeItem(item.templateId)} aria-label="Remove" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F4DEDA] transition-colors shrink-0"><Trash2 size={18} className="text-muted2" /></button>
                  </div>
                  <div className="flex justify-between items-end flex-wrap gap-3">
                    <div className="flex items-center border border-ink rounded-full h-11">
                      <button onClick={() => updateQuantity(item.templateId, item.quantity - 1)} aria-label="Decrease" className="w-11 h-[42px] flex items-center justify-center active:scale-90"><Minus size={15} /></button>
                      <span className="min-w-[28px] text-center font-mono text-[15px] font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.templateId, item.quantity + 1)} aria-label="Increase" className="w-11 h-[42px] flex items-center justify-center active:scale-90"><Plus size={15} /></button>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[12px] text-muted2">₹{item.price} each</div>
                      <div className="font-display text-[32px] leading-none">₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="flex-1 basis-[340px] min-w-0 lg:sticky lg:top-24 mt-7 bg-paper border border-ink p-7 flex flex-col gap-[18px]">
            {step === "cart" ? (
              <>
                <h2 className="font-display text-[32px] m-0">Order summary</h2>
                <div className="flex justify-between text-sm text-muted2"><span>Subtotal</span><span className="font-mono">₹{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-baseline border-t border-ink pt-4"><span className="font-semibold">Total</span><span className="font-display text-[40px] leading-none">{total <= 0 ? "Free" : `₹${total.toFixed(2)}`}</span></div>
                <button onClick={() => setStep("checkout")} className="h-14 rounded-full bg-ink text-cream font-semibold flex items-center justify-center gap-2.5 hover:bg-terracotta hover:gap-4 active:scale-[.98] transition-all">Proceed to checkout <ArrowRight size={17} /></button>
                <div className="flex flex-col gap-2.5 border-t border-line pt-4 text-sm text-bodytext">
                  <span className="flex gap-2.5 items-center"><Download size={16} className="text-terracotta" /> Instant download after purchase</span>
                  <span className="flex gap-2.5 items-center"><ShieldCheck size={16} className="text-terracotta" /> Delivered to your email</span>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-[32px] m-0">Billing details</h2>
                {error && <div className="flex items-start gap-2 p-3 bg-[#F4DEDA] text-likeRed text-sm"><AlertCircle size={16} className="shrink-0 mt-0.5" />{error}</div>}
                <form onSubmit={placeOrder} className="flex flex-col gap-5 animate-fadeIn">
                  <input type="text" name="userName" placeholder="Full name" value={billing.userName} onChange={changeBilling} className={input} required />
                  <input type="email" name="userEmail" placeholder="Email" value={billing.userEmail} onChange={changeBilling} className={input} required />
                  <input type="tel" name="userPhone" placeholder="Phone number" value={billing.userPhone} onChange={changeBilling} className={input} required />
                  <div className="grid grid-cols-2 gap-5">
                    <input type="text" name="userCity" placeholder="City" value={billing.userCity} onChange={changeBilling} className={input} required />
                    <input type="text" name="userState" placeholder="State" value={billing.userState} onChange={changeBilling} className={input} required />
                    <input type="text" name="userCountry" placeholder="Country" value={billing.userCountry} onChange={changeBilling} className={input} required />
                    <input type="text" name="userZip" placeholder="ZIP / Postal code" value={billing.userZip} onChange={changeBilling} className={input} required />
                  </div>
                  <div className="flex justify-between items-baseline border-t border-ink pt-4"><span className="font-semibold">Total</span><span className="font-display text-[40px] leading-none">{total <= 0 ? "Free" : `₹${total.toFixed(2)}`}</span></div>
                  <button type="submit" disabled={placing} className="h-14 rounded-full bg-terracotta text-paper font-semibold hover:bg-ink active:scale-[.98] transition-all disabled:opacity-60">
                    {placing ? "Processing…" : total <= 0 ? "Get it free" : `Pay ₹${total.toFixed(2)}`}
                  </button>
                  <button type="button" onClick={() => setStep("cart")} disabled={placing} className="h-[52px] rounded-full border border-line text-muted2 font-semibold hover:border-ink hover:text-ink transition-colors">Back to cart</button>
                </form>
              </>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
