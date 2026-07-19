import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Check, Heart } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import TemplateService from "../../api/template";
import { getTemplateImageUrl } from "../../utils/assetUrl";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";

const TemplateIndividual = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useFavorites();

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

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const handleAddToCart = () => {
    if (!template) return;
    addItem({
      templateId: template._id,
      title: template.name,
      image: getTemplateImageUrl(template.card_image),
      category: template.template_category,
      price: Number(template.price) || 0,
    });
    setAddedToCart(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[73vh] w-[90%] max-w-4xl flex flex-col gap-6 justify-start items-start mx-auto bg-white my-6">
          <div className="w-full animate-pulse">
            <div className="h-[400px] bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 w-5/6"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !template) {
    return (
      <>
        <Navbar />
        <div className="min-h-[73vh] flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error || "Template not found"}</p>
            <button
              onClick={() => navigate("/templates")}
              className="px-6 py-3 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition"
            >
              Back to Templates
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const gallery = template.template_images?.length
    ? template.template_images
    : [template.card_image];

  return (
    <>
      <Navbar />
      <div className="min-h-[73vh] w-[90%] max-w-4xl flex flex-col gap-6 justify-start items-start mx-auto bg-white my-6">
        {/* Image gallery */}
        <div className="w-full flex flex-col gap-3">
          <img
            src={getTemplateImageUrl(gallery[activeImage])}
            alt={template.name}
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover rounded-lg"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800";
            }}
          />
          {gallery.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {gallery.map((img, idx) => (
                <img
                  key={idx}
                  src={getTemplateImageUrl(img)}
                  alt={`${template.name} ${idx + 1}`}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${
                    activeImage === idx ? "border-bluePrimary" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Title + Price */}
        <div className="w-full flex justify-between items-center flex-wrap gap-3">
          <p className="font-inter text-xl sm:text-2xl md:text-3xl text-textHeading font-semibold leading-snug">
            {template.name}
          </p>
          <span className="text-bluePrimary font-bold text-2xl">
            {template.template_type === "free" ? "Free" : `₹${template.price}`}
          </span>
        </div>

        {/* Category & tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-block bg-lightBlue text-bluePrimary text-sm font-medium px-3 py-1 rounded-lg">
            {template.template_category}
          </span>
          {template.template_tags?.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="font-inter text-base sm:text-lg text-textMuted leading-relaxed whitespace-pre-line">
          {template.template_description}
        </p>

        {/* Content */}
        {template.template_content && (
          <p className="font-inter text-base text-textMuted leading-relaxed whitespace-pre-line">
            {template.template_content}
          </p>
        )}

        {/* Add to cart + wishlist */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-all ${
              addedToCart
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-bluePrimary hover:bg-blueHover text-white"
            }`}
          >
            {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
            {addedToCart ? "Added to cart" : "Add to cart"}
          </button>
          <button
            onClick={() => toggleWishlist(templateId)}
            className="flex items-center gap-2 border border-gray-300 px-5 py-3 rounded-lg hover:bg-gray-50 transition-all"
            aria-label="Toggle wishlist"
          >
            <Heart
              size={18}
              fill={isWishlisted(templateId) ? "#2563EB" : "none"}
              color={isWishlisted(templateId) ? "#2563EB" : "#606060"}
            />
            <span className="text-sm font-medium text-textMuted">
              {isWishlisted(templateId) ? "Wishlisted" : "Wishlist"}
            </span>
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TemplateIndividual;
