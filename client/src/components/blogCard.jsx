import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Bookmark } from "lucide-react";
import { useSnackbar } from "notistack";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import BlogService from "../api/blog";

const Card = ({
  id = 1,
  image = "",
  title = "Untitled",
  description = "",
  category = "General",
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
  const src = imageUrl || image;

  useEffect(() => { setLiked(initialIsLiked); }, [initialIsLiked]);
  useEffect(() => { setLikesCount(initialLikes); }, [initialLikes]);

  useEffect(() => {
    if (!useOptimizedLoading || !imageRef.current) return;
    const el = imageRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.src = en.target.dataset.src; obs.unobserve(en.target); }
      });
    }, { rootMargin: "100px", threshold: 0.1 });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [useOptimizedLoading]);

  const requireLogin = (msg) => {
    enqueueSnackbar(msg, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
    navigate("/login");
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return requireLogin("Log in to like blogs");
    if (likeBusy) return;
    const pl = liked, pc = likesCount;
    setLiked(!pl); setLikesCount((c) => (!pl ? c + 1 : Math.max(0, c - 1)));
    try {
      setLikeBusy(true);
      const res = await BlogService.toggleLike(id);
      if (res.status === "Success") { setLiked(res.liked); setLikesCount(res.likesCount); }
      else { setLiked(pl); setLikesCount(pc); }
    } catch {
      setLiked(pl); setLikesCount(pc);
    } finally { setLikeBusy(false); }
  };

  const handleSave = (e) => {
    e.stopPropagation();
    if (!user) return requireLogin("Log in to save blogs");
    toggleSaved(id);
  };

  return (
    <article className="flex flex-col gap-3 group">
      <div
        onClick={() => navigate(`/blogs/${id}`)}
        className="relative aspect-[3/2] border border-line overflow-hidden cursor-pointer bg-[repeating-linear-gradient(45deg,#EDE7DD_0_9px,#E7E0D4_9px_18px)] group-hover:-translate-y-1.5 group-hover:border-ink transition-all duration-500"
      >
        {useOptimizedLoading ? (
          <img
            ref={imageRef}
            data-src={src}
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            loading="lazy"
          />
        ) : (
          src && <img src={src} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="font-mono text-[11px] font-medium tracking-[.1em] uppercase text-terracotta mt-1">{category}</div>
      <h3
        onClick={() => navigate(`/blogs/${id}`)}
        className="font-display text-[28px] leading-[1.08] -mt-0.5 cursor-pointer text-ink hover:text-terracotta transition-colors"
      >
        {title}
      </h3>
      {description && <p className="text-sm text-muted2 line-clamp-2 m-0">{description}</p>}

      <div className="mt-auto pt-3 border-t border-line flex justify-between items-center">
        <button onClick={handleLike} className="flex items-center gap-2 font-mono text-[13px] font-medium text-bodytext hover:text-likeRed transition-colors active:scale-90">
          <Heart size={17} fill={liked ? "#B3261E" : "none"} color={liked ? "#B3261E" : "currentColor"} />
          {likesCount}
        </button>
        <button onClick={handleSave} aria-label="Save blog" className="text-bodytext hover:text-ink transition-colors active:scale-90">
          <Bookmark size={17} fill={saved ? "#1C1A17" : "none"} color="currentColor" />
        </button>
      </div>
    </article>
  );
};

export default Card;
