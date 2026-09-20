import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bookmark } from "lucide-react";
import { useSnackbar } from "notistack";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import BlogService from "../api/blog";

const Card = ({
  id = 1,
  image = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  title = "How to build a second brain with Notion",
  description = "How to implement the Notion with AI template in our day to day life...",
  category = "Business",
  likesCount: initialLikes = 0,
  isLiked: initialIsLiked = false,
  imageUrl,
  useOptimizedLoading = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [likeBusy, setLikeBusy] = useState(false);
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useFavorites();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const saved = isSaved(id);

  useEffect(() => { setLiked(initialIsLiked); }, [initialIsLiked]);
  useEffect(() => { setLikesCount(initialLikes); }, [initialLikes]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!useOptimizedLoading || !imageRef.current) return;
    const el = imageRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.src = entry.target.dataset.src;
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [useOptimizedLoading]);

  const requireLogin = (message) => {
    enqueueSnackbar(message, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
    navigate("/login");
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return requireLogin("Log in to like blogs");
    if (likeBusy) return;
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount((c) => (!prevLiked ? c + 1 : Math.max(0, c - 1)));
    try {
      setLikeBusy(true);
      const res = await BlogService.toggleLike(id);
      if (res.status === "Success") {
        setLiked(res.liked);
        setLikesCount(res.likesCount);
      } else {
        setLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      enqueueSnackbar("Couldn't update like. Try again.", { variant: "error" });
    } finally {
      setLikeBusy(false);
    }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (!user) return requireLogin("Log in to save blogs");
    toggleSaved(id);
  };

  return (
    <div className="group flex flex-col h-full w-full max-w-sm rounded-2xl bg-white border border-borderLight shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden cursor-pointer" onClick={() => navigate(`/blogs/${id}`)}>
        {useOptimizedLoading ? (
          <>
            {!imageLoaded && <div className="w-full h-[170px] bg-borderLight animate-pulse" />}
            <img
              ref={imageRef}
              data-src={imageUrl || image}
              src={imageLoaded ? (imageUrl || image) : ""}
              alt={title}
              className={`w-full h-[170px] object-cover group-hover:scale-[1.06] transition-all duration-500 ${imageLoaded ? "opacity-100" : "opacity-0 absolute inset-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"; setImageLoaded(true); }}
              loading="lazy"
            />
          </>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-[170px] object-cover group-hover:scale-[1.06] transition-transform duration-500"
          />
        )}
      </div>

      <div className="flex flex-col flex-grow p-4">
        <span className="inline-block self-start bg-lightBlue text-bluePrimary text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md mb-2 capitalize">
          {category}
        </span>
        <h3
          className="font-semibold text-base sm:text-lg text-textHeading leading-snug mb-1 line-clamp-1 cursor-pointer group-hover:text-bluePrimary transition-colors"
          onClick={() => navigate(`/blogs/${id}`)}
        >
          {title}
        </h3>
        <p className="text-sm text-textMuted mb-3 line-clamp-2 leading-relaxed">{description}</p>

        <div className="flex justify-between items-center border-t border-borderLight mt-auto pt-3 text-sm text-textMuted">
          <button onClick={handleLike} className="flex items-center gap-1.5 hover:text-redAccent transition-colors focus:outline-none">
            <Heart size={18} fill={liked ? "#EF4444" : "none"} color={liked ? "#EF4444" : "currentColor"} className="transition-all" />
            <span>{likesCount}</span>
          </button>
          <button onClick={handleSave} className="focus:outline-none hover:text-bluePrimary transition-colors" aria-label="Save blog">
            <Bookmark size={18} fill={saved ? "#2563EB" : "none"} color={saved ? "#2563EB" : "currentColor"} className="transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
