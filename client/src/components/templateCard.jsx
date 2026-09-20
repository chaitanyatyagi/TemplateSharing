import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Check } from "lucide-react";
import { useSnackbar } from "notistack";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const TemplateCard = ({
  id = 1,
  image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  title = "How to build a second brain with Notion",
  description = "How to implement the Notion with AI template in our day to day life...",
  category = "Business",
  price = 599,
  onAddToCart,
}) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useFavorites();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const liked = isWishlisted(id);
  const isFree = Number(price) === 0;

  const requireLogin = (message) => {
    enqueueSnackbar(message, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
    navigate("/login");
  };

  const handleLike = () => {
    if (!user) return requireLogin("Log in to save templates to your wishlist");
    toggleWishlist(id);
  };

  const handleAddToCart = () => {
    if (!user) return requireLogin("Log in to add templates to your cart");
    addItem({ templateId: String(id), title, image, category, price: Number(price) || 0 });
    setAddedToCart(true);
    enqueueSnackbar("Added to cart", { variant: "success", anchorOrigin: { vertical: "top", horizontal: "center" } });
    if (onAddToCart) onAddToCart(id);
  };

  return (
    <div className="group flex flex-col h-full w-full max-w-xs rounded-2xl bg-white border border-borderLight shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative cursor-pointer overflow-hidden" onClick={() => navigate(`/templates/${id}`)}>
        <img
          src={image}
          alt={title}
          className="w-full h-[190px] object-cover group-hover:scale-[1.06] transition-transform duration-500"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* Price pill */}
        <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur text-textHeading font-bold text-sm px-3 py-1 rounded-full shadow-sm">
          {isFree ? "Free" : `₹${price}`}
        </span>
        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white hover:scale-110 transition-all focus:outline-none"
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={liked ? "#2563EB" : "none"} color={liked ? "#2563EB" : "#606060"} className="transition-all" />
        </button>
      </div>

      <div className="flex flex-col flex-grow p-4">
        <span className="inline-block self-start bg-lightBlue text-bluePrimary text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md mb-2">
          {category}
        </span>
        <h3
          className="font-semibold text-base sm:text-lg text-textHeading leading-snug line-clamp-1 cursor-pointer group-hover:text-bluePrimary transition-colors"
          onClick={() => navigate(`/templates/${id}`)}
        >
          {title}
        </h3>
        <p className="text-sm text-textMuted mt-1 mb-4 line-clamp-2 leading-relaxed">{description}</p>

        <button
          onClick={handleAddToCart}
          className={`mt-auto w-full flex items-center justify-center gap-2 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all ${
            addedToCart
              ? "bg-greenAccent/10 text-greenAccent cursor-default"
              : "bg-bluePrimary hover:bg-blueHover text-white shadow-sm hover:shadow-md"
          }`}
          disabled={addedToCart}
        >
          {addedToCart ? <Check size={16} /> : <ShoppingCart size={16} />}
          {addedToCart ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;
