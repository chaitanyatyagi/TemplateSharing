import { useState, useEffect } from "react";
import { Heart, Bookmark, ArrowLeft } from "lucide-react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import BlogContent from "../../components/BlogContent";
import BlogService from "../../api/blog";
import { getServerAssetUrl } from "../../utils/assetUrl";
import { useFavorites } from "../../context/FavoritesContext";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const BlogIndividual = () => {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const { isSaved, toggleSaved } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [likeBusy, setLikeBusy] = useState(false);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const saved = isSaved(blogId);

  // Fetch single blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await BlogService.getBlogById(blogId);

        if (response.status === "Success") {
          setBlog(response.blog);
          setLikesCount(response.blog.likesCount || 0);
          setLiked(Boolean(response.blog.likedByMe));
        } else {
          setError(response.message || "Failed to fetch blog");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError(err.message || "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const handleLike = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    if (likeBusy) return;

    // Optimistic update, reconciled with the server response.
    const prevLiked = liked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setLikesCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));

    try {
      setLikeBusy(true);
      const res = await BlogService.toggleLike(blogId);
      if (res.status === "Success") {
        setLiked(res.liked);
        setLikesCount(res.likesCount);
      } else {
        setLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (err) {
      console.error("Like error:", err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLikeBusy(false);
    }
  };

  const handleSave = () => {
    toggleSaved(blogId);
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
            <div className="h-4 bg-gray-200 rounded mb-4 w-4/6"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-[73vh] flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Navbar />
        <div className="min-h-[73vh] flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Blog not found</p>
            <button
              onClick={() => navigate('/blogs')}
              className="mt-4 px-6 py-3 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition"
            >
              Back to Blogs
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <article className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <button onClick={() => navigate("/blogs")} className="inline-flex items-center gap-2 text-textMuted hover:text-bluePrimary transition mb-6 text-sm font-medium">
          <ArrowLeft size={16} /> Back to blogs
        </button>

        {/* Category + title */}
        <span className="inline-block bg-lightBlue text-bluePrimary text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full capitalize">
          {blog.type}
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-textHeading leading-tight tracking-tight">
          {blog.name}
        </h1>

        {/* Meta / actions */}
        <div className="flex items-center justify-between gap-3 mt-4 mb-6 border-b border-borderLight pb-5">
          <div className="flex items-center gap-5">
            <button onClick={handleLike} disabled={likeBusy} className="flex items-center gap-1.5 text-textMuted hover:text-redAccent transition focus:outline-none disabled:opacity-60">
              <Heart size={20} fill={liked ? "#EF4444" : "none"} color={liked ? "#EF4444" : "currentColor"} />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>
            <button onClick={handleSave} className="text-textMuted hover:text-bluePrimary transition focus:outline-none" aria-label="Save blog">
              <Bookmark size={20} fill={saved ? "#2563EB" : "none"} color={saved ? "#2563EB" : "currentColor"} />
            </button>
          </div>
        </div>

        {/* Hero image */}
        <img
          src={getServerAssetUrl(blog.imageUrls?.medium || blog.imageUrl) || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"}
          alt={blog.name}
          className="w-full h-[280px] sm:h-[360px] md:h-[420px] object-cover rounded-2xl shadow-sm mb-8"
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800"; }}
        />

        {/* Content */}
        <BlogContent html={blog.content} />
      </article>

      <Footer />
    </div>
  );
};

export default BlogIndividual;
