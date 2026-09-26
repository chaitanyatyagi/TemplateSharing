import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Heart, ArrowLeft, Download, Mail, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TemplateService from "../../api/template";
import { getTemplateImageUrl } from "../../utils/assetUrl";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "notistack";

const TemplateIndividual = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useFavorites();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [template, setTemplate] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const res = await TemplateService.getTemplateById(templateId);
        if (res.status === "Success" && res.template) setTemplate(res.template);
        else setError(res.message || "Failed to fetch template");
      } catch (err) { setError(err.message || "Failed to fetch template"); }
      finally { setLoading(false); }
    };
    if (templateId) run();
  }, [templateId]);

  const gate = (msg) => { enqueueSnackbar(msg, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } }); navigate("/login"); };
  const handleAdd = () => {
    if (!template) return;
    if (!user) return gate("Log in to add templates to your cart");
    addItem({ templateId: template._id, title: template.name, image: getTemplateImageUrl(template.card_image), category: template.template_category, price: Number(template.price) || 0 });
    setAdded(true);
    enqueueSnackbar("Added to cart", { variant: "success", anchorOrigin: { vertical: "top", horizontal: "center" } });
  };
  const handleWish = () => { if (!user) return gate("Log in to save templates to your wishlist"); toggleWishlist(templateId); };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-[4/3] border border-line bg-creamAlt animate-pulse" />
          <div className="flex flex-col gap-4">
            <div className="h-8 w-2/3 bg-creamAlt animate-pulse" />
            <div className="h-16 w-1/3 bg-creamAlt animate-pulse" />
            <div className="h-14 bg-creamAlt animate-pulse rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 gap-3">
          <AlertCircle size={38} className="text-likeRed" />
          <p className="font-display text-[28px] m-0">{error || "Template not found"}</p>
          <button onClick={() => navigate("/templates")} className="mt-2 h-12 px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors">Back to templates</button>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = template.template_images?.length ? template.template_images : [template.card_image];
  const isFree = template.template_type === "free";
  const wished = isWishlisted(templateId);
  const included = (template.template_content || "").split(/\n+/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <div className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-16 md:pb-28">
        <button onClick={() => navigate("/templates")} className="flex items-center gap-2 py-2 mb-7 font-medium text-sm text-muted2 hover:text-ink hover:gap-3.5 transition-all">
          <ArrowLeft size={16} /> Back to templates
        </button>

        <div className="flex flex-wrap gap-8 md:gap-[72px] items-start">
          {/* Gallery */}
          <div className="flex-1 min-w-0 basis-[520px] flex flex-col gap-3.5 animate-rise">
            <div className="aspect-[4/3] border border-ink overflow-hidden bg-[repeating-linear-gradient(135deg,#F2E4BC_0_10px,#ECDCAC_10px_20px)]">
              <img src={getTemplateImageUrl(gallery[active])} alt={template.name} className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = 0; }} />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2.5">
                {gallery.map((img, i) => (
                  <button key={i} onClick={() => setActive(i)}
                    className={`w-[84px] h-[84px] border overflow-hidden ${active === i ? "border-ink" : "border-line opacity-70 hover:opacity-100"} transition-all`}>
                    <img src={getTemplateImageUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Aside */}
          <aside className="flex-1 min-w-0 basis-[380px] lg:sticky lg:top-24 flex flex-col gap-6 [animation:rise_.8s_.1s_both]">
            <div className="font-mono text-[12px] font-medium tracking-[.1em] uppercase text-terracotta">{template.template_category}</div>
            <h1 className="font-display text-[clamp(44px,5vw,72px)] leading-[.98] tracking-[-.015em] -mt-2.5 m-0">{template.name}</h1>
            <div className="flex items-baseline gap-3 border-y border-y-line border-t-ink py-[18px]">
              <span className="font-display text-[48px] leading-none">{isFree ? "Free" : `₹${template.price}`}</span>
              {!isFree && <span className="font-mono text-[12px] text-muted2">ONE-TIME</span>}
            </div>
            <div className="flex gap-2.5">
              {added ? (
                <div className="flex-1 h-[58px] rounded-full border border-successGreen text-successGreen font-semibold text-[16px] flex items-center justify-center gap-2.5"><Check size={18} /> Added to cart</div>
              ) : (
                <button onClick={handleAdd} className="flex-1 h-[58px] rounded-full bg-ink text-cream font-semibold text-[16px] flex items-center justify-center gap-2.5 hover:bg-terracotta active:scale-[.98] transition-all">
                  <ShoppingCart size={18} /> Add to cart
                </button>
              )}
              <button onClick={handleWish} aria-label="Wishlist" className="w-[58px] h-[58px] rounded-full border border-ink flex items-center justify-center hover:scale-[1.06] active:scale-90 transition-transform">
                <Heart size={20} fill={wished ? "#22396F" : "none"} color={wished ? "#22396F" : "#010736"} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5 text-sm text-bodytext">
              <span className="flex gap-2.5 items-center"><Download size={16} className="text-terracotta" /> Instant download after purchase</span>
              <span className="flex gap-2.5 items-center"><Mail size={16} className="text-terracotta" /> Delivered to your email too</span>
            </div>
            {template.template_tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {template.template_tags.map((tag) => (
                  <span key={tag} className="font-mono text-[12px] text-muted2 border border-line px-2.5 py-1.5">#{tag}</span>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* Details */}
        <div className="mt-14 md:mt-24 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-[72px] gap-y-10 border-t border-ink pt-10">
          <div>
            <div className="font-mono text-[12px] font-medium text-terracotta tracking-[.08em] mb-3.5">01</div>
            <h2 className="font-display text-[36px] mb-3.5 m-0">About this template</h2>
            <p className="text-bodytext text-[17px] leading-[1.7] whitespace-pre-line m-0">{template.template_description}</p>
          </div>
          {included.length > 0 && (
            <div>
              <div className="font-mono text-[12px] font-medium text-terracotta tracking-[.08em] mb-3.5">02</div>
              <h2 className="font-display text-[36px] mb-3.5 m-0">What's included</h2>
              <div>
                {included.map((inc, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-line text-bodytext">
                    <Check size={16} className="text-terracotta mt-1 shrink-0" /> {inc}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TemplateIndividual;
