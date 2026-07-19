import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Eye, Bookmark } from "lucide-react";
import { useFavorites } from "../context/FavoritesContext";

const Card = ({
  id = 1,
  image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  title = "How to build a second brain with Notion",
  description = "How to implement the Notion with AI template in our day to day life...",
  category = "Business",
  likesCount: initialLikes = 23,
  viewsCount: initialViews = "1.3k",
  isLiked: initialIsLiked = false,
  onLike,
  imageUrl, // Optimized image URL from backend
  useOptimizedLoading = false, // Flag to use optimized loading
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [viewsCount] = useState(initialViews);
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useFavorites();
  const saved = isSaved(id);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!useOptimizedLoading || !imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [useOptimizedLoading]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    setLikesCount(prev => (newLikedState ? prev + 1 : prev - 1));

    // Mock backend simulation
    if (onLike) {
      await new Promise(resolve => setTimeout(resolve, 500)); // simulate delay
      await onLike(id, newLikedState);
    } else {
      console.log(`Mock Like Action: Post ${id} ${newLikedState ? "Liked" : "Unliked"}`);
    }
  };

  const handleSave = () => {
    toggleSaved(id);
  };

  return (
    <div
      key={id}
      className="flex flex-col h-full w-full max-w-sm border border-borderLight rounded-2xl p-3 bg-white shadow-sm hover:shadow-lg transition-all duration-200"
    >
      {/* Image with optimized loading */}
      {useOptimizedLoading ? (
        <>
          {/* Placeholder with blur effect */}
          {!imageLoaded && (
            <div
              className="w-full h-[150px] rounded-lg mb-3 cursor-pointer bg-gray-200 animate-pulse"
              onClick={() => navigate(`/blogs/${id}`)}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg"></div>
            </div>
          )}

          {/* Optimized image with lazy loading */}
          <img
            ref={imageRef}
            data-src={imageUrl || image}
            src={imageLoaded ? (imageUrl || image) : ""}
            alt={title}
            className={`w-full h-[150px] object-cover rounded-lg mb-3 cursor-pointer transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={handleImageLoad}
            onError={(e) => {
              handleImageError();
              console.error("Image failed to load:", imageUrl || image);
              e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800";
              setImageLoaded(true); // Show fallback image
            }}
            onClick={() => navigate(`/blogs/${id}`)}
            loading="lazy"
          />
        </>
      ) : (
        // Fallback to normal image loading
        <img
          src={image}
          alt={title}
          className="w-full h-[150px] object-cover rounded-lg mb-3 cursor-pointer"
          onClick={() => navigate(`/blogs/${id}`)}
        />
      )}

      {/* Title and Description */}
      <h3
        className="font-semibold text-base sm:text-lg text-textHeading mb-1 line-clamp-1 cursor-pointer hover:text-bluePrimary transition-colors"
        onClick={() => navigate(`/blogs/${id}`)}
      >
        {title}
      </h3>
      <p className="text-sm text-textMuted mb-3 line-clamp-2">
        {description}
      </p>

      {/* Category */}
      <span className="inline-block self-start bg-lightBlue text-bluePrimary text-xs font-medium px-3 py-1 rounded-lg mb-3">
        {category}
      </span>

      {/* Likes / Views / Save */}
      <div className="flex justify-between items-center border-t border-borderLight mt-auto pt-3 text-sm text-textMuted">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 focus:outline-none"
          >
            <Heart
              size={18}
              fill={liked ? "red" : "none"}
              color={liked ? "red" : "#606060"}
              className="cursor-pointer transition-all"
            />
            <span>{likesCount}</span>
          </button>

          {/* Views Count */}
          <div className="flex items-center gap-1">
            <Eye size={18} color="#606060" />
            <span>{viewsCount}</span>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="focus:outline-none"
        >
          <Bookmark
            size={18}
            fill={saved ? "#2563EB" : "none"}
            color={saved ? "#2563EB" : "#606060"}
            className="cursor-pointer transition-all"
          />
        </button>
      </div>
    </div>
  );
};

export default Card;
