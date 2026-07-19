import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";

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

  const liked = isWishlisted(id);

  const handleLike = () => {
    toggleWishlist(id);
  };

  const handleAddToCart = () => {
    addItem({ templateId: String(id), title, image, category, price: Number(price) || 0 });
    setAddedToCart(true);
    if (onAddToCart) onAddToCart(id);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-xs border border-borderLight rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="relative cursor-pointer overflow-hidden" onClick={() => navigate(`/templates/${id}`)}>
        <img
          src={image}
          alt={title}
          className="w-full h-[180px] object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Wishlist button overlay */}
        <button
          onClick={(e) => { e.stopPropagation(); handleLike(); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 shadow-sm hover:bg-white transition-all focus:outline-none"
          aria-label="Toggle wishlist"
        >
          <Heart
            size={18}
            fill={liked ? "#2563EB" : "none"}
            color={liked ? "#2563EB" : "#606060"}
            className="transition-all"
          />
        </button>
      </div>
      <div className="flex flex-col flex-grow p-4">
        {/* Title and Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-semibold text-base sm:text-lg text-textHeading line-clamp-1 cursor-pointer hover:text-bluePrimary transition-colors"
            onClick={() => navigate(`/templates/${id}`)}
          >
            {title}
          </h3>
          <span className="text-bluePrimary font-bold text-base sm:text-lg whitespace-nowrap">₹ {price}</span>
        </div>
        {/* Description */}
        <p className="text-sm text-textMuted mb-3 line-clamp-2">
          {description}
        </p>
        {/* Category */}
        <span className="inline-block self-start bg-lightBlue text-bluePrimary text-xs font-medium px-3 py-1 rounded-lg mb-4">
          {category}
        </span>
        {/* Add to cart pinned to bottom */}
        <button
          onClick={handleAddToCart}
          className={`mt-auto w-full font-semibold px-5 py-2.5 rounded-lg text-sm transition-all ${
            addedToCart
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-bluePrimary hover:bg-blueHover text-white"
          }`}
          disabled={addedToCart}
        >
          {addedToCart ? "Added to cart" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default TemplateCard;