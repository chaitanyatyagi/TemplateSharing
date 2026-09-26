import { useState, useEffect } from "react";
import { Heart, Bookmark, ArrowLeft, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BlogContent from "../../components/BlogContent";
import BlogService from "../../api/blog";
import { getServerAssetUrl } from "../../utils/assetUrl";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const BlogIndividual = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useFavorites();
  const { isAuthenticated, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeBusy, setLikeBusy] = useState(false);
  const saved = isSaved(blogId);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const res = await BlogService.getBlogById(blogId);
        if (res.status === "Success") {
          setBlog(res.blog);
          setLikesCount(res.blog.likesCount || 0);
          setLiked(Boolean(res.blog.likedByMe));
        } else setError(res.message || "Failed to fetch blog");
      } catch (err) { setError(err.message || "Failed to fetch blog"); }
      finally { setLoading(false); }
    };
    if (blogId) run();
  }, [blogId]);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      enqueueSnackbar("Log in to like blogs", { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
      return navigate("/login");
    }
    if (likeBusy) return;
    const pl = liked, pc = likesCount;
    setLiked(!pl); setLikesCount((c) => (!pl ? c + 1 : Math.max(0, c - 1)));
    try {
      setLikeBusy(true);
      const r = await BlogService.toggleLike(blogId);
      if (r.status === "Success") { setLiked(r.liked); setLikesCount(r.likesCount); }
      else { setLiked(pl); setLikesCount(pc); }
    } catch { setLiked(pl); setLikesCount(pc); }
    finally { setLikeBusy(false); }
  };

  const handleSave = () => {
    if (!user) {
      enqueueSnackbar("Log in to save blogs", { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } });
      return navigate("/login");
    }
    toggleSaved(blogId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 max-w-[760px] w-full mx-auto px-5 py-12 animate-pulse">
          <div className="h-10 w-3/4 bg-creamAlt mb-6" />
          <div className="h-4 bg-creamAlt mb-2" /><div className="h-4 w-5/6 bg-creamAlt" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5 gap-3">
          <AlertCircle size={38} className="text-likeRed" />
          <p className="font-display text-[28px] m-0">{error || "Blog not found"}</p>
          <button onClick={() => navigate("/blogs")} className="mt-2 h-12 px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors">Back to blogs</button>
        </div>
        <Footer />
      </div>
    );
  }

  const hero = getServerAssetUrl(blog.imageUrls?.medium || blog.imageUrl);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <article className="flex-1 px-5 sm:px-8 lg:px-12 pt-8 pb-16 md:pb-28 w-full">
        <div className="max-w-[760px] mx-auto animate-rise">
          <button onClick={() => navigate("/blogs")} className="flex items-center gap-2 py-2 mb-10 font-medium text-sm text-muted2 hover:text-ink hover:gap-3.5 transition-all">
            <ArrowLeft size={16} /> Back to blogs
          </button>
          <div className="font-mono text-[12px] font-medium tracking-[.1em] uppercase text-terracotta">{blog.type}</div>
          <h1 className="mt-4 font-display text-[clamp(44px,6vw,80px)] leading-[.98] tracking-[-.02em] text-balance m-0">{blog.name}</h1>
          <div className="flex gap-2.5 items-center mt-7 py-4 border-t border-ink border-b border-b-line">
            <button onClick={handleLike} disabled={likeBusy} className="h-10 px-3.5 border border-line rounded-full flex gap-2 items-center font-mono text-[13px] text-bodytext hover:border-likeRed active:scale-90 transition-all disabled:opacity-60">
              <Heart size={17} fill={liked ? "#B3261E" : "none"} color={liked ? "#B3261E" : "currentColor"} />{likesCount}
            </button>
            <button onClick={handleSave} aria-label="Save" className="w-10 h-10 border border-line rounded-full flex items-center justify-center hover:border-ink active:scale-90 transition-all">
              <Bookmark size={17} fill={saved ? "#010736" : "none"} color="#010736" />
            </button>
          </div>
        </div>

        {hero && (
          <div className="max-w-[1120px] mx-auto my-12 aspect-[16/8] border border-ink overflow-hidden [animation:rise_.8s_.1s_both]">
            <img src={hero} alt={blog.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = 0; }} />
          </div>
        )}

        <div className="max-w-[680px] mx-auto">
          <BlogContent html={blog.content} className="article" />
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogIndividual;
