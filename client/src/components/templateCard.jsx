import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { useSnackbar } from "notistack";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const TemplateCard = ({
  id = 1,
  image = "",
  title = "Untitled template",
  description = "",
  category = "General",
  price = 0,
}) => {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useFavorites();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const liked = isWishlisted(id);
  const isFree = Number(price) === 0;

  const requireLogin = (msg) => {
    enqueueSnackbar(msg, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
    navigate("/login");
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return requireLogin("Log in to save templates to your wishlist");
    toggleWishlist(id);
  };

  const handleAdd = () => {
    if (!user) return requireLogin("Log in to add templates to your cart");
    addItem({ templateId: String(id), title, image, category, price: Number(price) || 0 });
    setAdded(true);
    enqueueSnackbar("Added to cart", { variant: "success", anchorOrigin: { vertical: "top", horizontal: "center" } });
  };

  return (
    <article className="flex flex-col gap-3.5 group">
      {/* Image */}
      <div
        onClick={() => navigate(`/templates/${id}`)}
        className="relative aspect-[4/3] border border-line overflow-hidden cursor-pointer bg-[repeating-linear-gradient(135deg,#EDE7DD_0_9px,#E7E0D4_9px_18px)] group-hover:-translate-y-1.5 group-hover:border-ink transition-all duration-500"
      >
        {image ? (
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-faint tracking-[.06em]">
            template cover
          </span>
        )}
        <span className="absolute left-3 top-3 bg-cream border border-ink px-2.5 py-1 font-mono text-[12px] font-medium">
          {isFree ? "Free" : `₹${price}`}
        </span>
        <button
          onClick={handleLike}
          aria-label="Toggle wishlist"
          className="absolute right-2.5 top-2.5 w-10 h-10 rounded-full border border-line bg-cream flex items-center justify-center hover:scale-110 active:scale-90 transition-transform"
        >
          <Heart size={17} fill={liked ? "#B4532A" : "none"} color={liked ? "#B4532A" : "#1C1A17"} />
        </button>
      </div>

      <div className="font-mono text-[11px] font-medium tracking-[.1em] uppercase text-terracotta">{category}</div>
      <h3
        onClick={() => navigate(`/templates/${id}`)}
        className="font-display text-[27px] leading-[1.08] -mt-1 cursor-pointer text-ink hover:text-terracotta transition-colors"
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted2 leading-[1.55] line-clamp-2 m-0">{description}</p>
      )}

      {added ? (
        <div className="mt-auto h-[46px] border border-successGreen rounded-full text-successGreen font-semibold text-sm flex items-center justify-center gap-2 animate-fadeIn">
          <Check size={16} /> Added to cart
        </div>
      ) : (
        <button
          onClick={handleAdd}
          className="mt-auto h-[46px] border border-ink rounded-full bg-transparent text-ink font-semibold text-sm hover:bg-ink hover:text-cream active:scale-[.97] transition-all"
        >
          Add to cart
        </button>
      )}
    </article>
  );
};

export default TemplateCard;
