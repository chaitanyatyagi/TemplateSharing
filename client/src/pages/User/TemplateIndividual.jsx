import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Heart, ArrowLeft, Download, Mail, AlertCircle } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
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
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await TemplateService.getTemplateById(templateId);
        if (response.status === "Success" && response.template) {
          setTemplate(response.template);
        } else {
          setError(response.message || "Failed to fetch template");
        }
      } catch (err) {
        console.error("Error fetching template:", err);
        setError(err.message || "Failed to fetch template");
      } finally {
        setLoading(false);
      }
    };
    if (templateId) fetchTemplate();
  }, [templateId]);

  const requireLogin = (message) => {
    enqueueSnackbar(message, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
    navigate("/login");
  };

  const handleAddToCart = () => {
    if (!template) return;
    if (!user) return requireLogin("Log in to add templates to your cart");
    addItem({
      templateId: template._id,
      title: template.name,
      image: getTemplateImageUrl(template.card_image),
      category: template.template_category,
      price: Number(template.price) || 0,
    });
    setAddedToCart(true);
    enqueueSnackbar("Added to cart", { variant: "success", anchorOrigin: { vertical: "top", horizontal: "center" } });
  };

  const handleWishlist = () => {
    if (!user) return requireLogin("Log in to save templates to your wishlist");
    toggleWishlist(templateId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="h-[420px] bg-borderLight rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-borderLight rounded w-3/4" />
            <div className="h-6 bg-borderLight rounded w-1/4" />
            <div className="h-4 bg-borderLight rounded" />
            <div className="h-4 bg-borderLight rounded w-5/6" />
            <div className="h-12 bg-borderLight rounded-xl w-1/2 mt-4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
          <AlertCircle size={40} className="text-redAccent mb-3" />
          <p className="text-textHeading font-semibold text-lg mb-4">{error || "Template not found"}</p>
          <button onClick={() => navigate("/templates")} className="px-6 py-3 bg-bluePrimary text-white rounded-xl font-semibold hover:bg-blueHover transition">
            Back to Templates
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const gallery = template.template_images?.length ? template.template_images : [template.card_image];
  const isFree = template.template_type === "free";
  const wished = isWishlisted(templateId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
        <button onClick={() => navigate("/templates")} className="inline-flex items-center gap-2 text-textMuted hover:text-bluePrimary transition mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to templates
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-borderLight rounded-2xl p-3 shadow-sm">
              <img
                src={getTemplateImageUrl(gallery[activeImage])}
                alt={template.name}
                className="w-full h-[300px] sm:h-[380px] md:h-[440px] object-cover rounded-xl"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"; }}
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <img
                    key={idx}
                    src={getTemplateImageUrl(img)}
                    alt={`${template.name} ${idx + 1}`}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 transition ${activeImage === idx ? "border-bluePrimary" : "border-transparent hover:border-borderLight"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Buy panel */}
          <div className="lg:sticky lg:top-6 self-start w-full">
            <div className="bg-white border border-borderLight rounded-2xl shadow-sm p-6 flex flex-col gap-5">
              <div>
                <span className="inline-block bg-lightBlue text-bluePrimary text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md mb-3">
                  {template.template_category}
                </span>
                <h1 className="text-2xl md:text-3xl font-bold text-textHeading leading-snug">{template.name}</h1>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-bluePrimary">{isFree ? "Free" : `₹${template.price}`}</span>
                {!isFree && <span className="text-sm text-textMuted">one-time</span>}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl transition-all ${addedToCart ? "bg-greenAccent/10 text-greenAccent cursor-default" : "bg-bluePrimary hover:bg-blueHover text-white shadow-sm hover:shadow-md"}`}
                >
                  {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {addedToCart ? "Added to cart" : "Add to cart"}
                </button>
                <button
                  onClick={handleWishlist}
                  className="flex items-center justify-center gap-2 border border-border px-5 py-3 rounded-xl hover:bg-background transition-all"
                  aria-label="Toggle wishlist"
                >
                  <Heart size={18} fill={wished ? "#2563EB" : "none"} color={wished ? "#2563EB" : "#606060"} />
                  <span className="text-sm font-medium text-textMuted sm:hidden">{wished ? "Wishlisted" : "Wishlist"}</span>
                </button>
              </div>

              {/* trust list */}
              <div className="flex flex-col gap-2 border-t border-borderLight pt-4 text-sm text-textMuted">
                <span className="inline-flex items-center gap-2"><Download size={16} className="text-bluePrimary" /> Instant download after purchase</span>
                <span className="inline-flex items-center gap-2"><Mail size={16} className="text-bluePrimary" /> Delivered to your email too</span>
              </div>

              {template.template_tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {template.template_tags.map((tag) => (
                    <span key={tag} className="inline-block bg-background border border-borderLight text-textMuted text-xs px-2.5 py-1 rounded-md">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description + content */}
        <div className="mt-10 bg-white border border-borderLight rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-textHeading mb-2">About this template</h2>
            <p className="text-textMuted leading-relaxed whitespace-pre-line">{template.template_description}</p>
          </div>
          {template.template_content && (
            <div className="border-t border-borderLight pt-6">
              <h2 className="text-lg font-bold text-textHeading mb-2">What's included</h2>
              <p className="text-textMuted leading-relaxed whitespace-pre-line">{template.template_content}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TemplateIndividual;
