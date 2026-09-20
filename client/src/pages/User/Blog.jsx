import { useState, useEffect } from "react";
import { Sparkles, Newspaper, AlertCircle } from "lucide-react";
import Dropdown from "../../components/DropDown";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Card from "../../components/blogCard";
import BlogService from "../../api/blog";
import { getServerAssetUrl } from "../../utils/assetUrl";

const Blog = () => {
  const [category, setCategory] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = [
    { value: "all", label: "All Category" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "health", label: "Health" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "education", label: "Education" },
    { value: "entertainment", label: "Entertainment" },
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          category === "all"
            ? await BlogService.getAllBlogs(1, 12)
            : await BlogService.getBlogsByCategory(category, 1, 12);
        if (response.status === "Success") {
          setBlogs(response.blogs || []);
        } else {
          setError(response.message || "Failed to fetch blogs");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header band */}
      <section className="relative overflow-hidden border-b border-borderLight bg-white">
        <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-lightBlue/50 blur-[110px]" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 text-bluePrimary bg-lightBlue text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            <Sparkles size={13} /> Insights &amp; guides
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-textHeading tracking-tight">
            Accelerate your growth
          </h1>
          <p className="text-textMuted mt-3 text-base sm:text-lg max-w-2xl">
            The latest AI updates and skill shifts, broken down into strategies you can actually use.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-textHeading">Latest Blogs</h2>
            {!loading && !error && (
              <p className="text-sm text-textMuted mt-0.5">
                {blogs.length} {blogs.length === 1 ? "article" : "articles"}
              </p>
            )}
          </div>
          <div className="w-full xs:w-auto">
            <Dropdown id="main-category" label="Category" options={options} value={category} onChange={setCategory} />
          </div>
        </div>

        {error ? (
          <div className="w-full flex flex-col items-center text-center py-16">
            <AlertCircle size={40} className="text-redAccent mb-3" />
            <p className="text-textHeading font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-5 py-2.5 bg-bluePrimary text-white rounded-xl font-semibold hover:bg-blueHover transition"
            >
              Retry
            </button>
          </div>
        ) : !loading && blogs.length === 0 ? (
          <div className="w-full flex flex-col items-center text-center py-16">
            <Newspaper size={40} className="text-grayLight mb-3" />
            <p className="text-textHeading font-semibold">No articles in this category yet</p>
            <p className="text-textMuted text-sm mt-1">Try a different category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {loading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <div key={`loading-${idx}`} className="w-full max-w-sm border border-borderLight rounded-2xl p-3 bg-white animate-pulse">
                    <div className="w-full h-[170px] rounded-xl mb-3 bg-borderLight" />
                    <div className="h-4 bg-borderLight rounded mb-2" />
                    <div className="h-3 bg-borderLight rounded w-2/3" />
                  </div>
                ))
              : blogs.map((blog) => (
                  <Card
                    key={blog._id}
                    id={blog._id}
                    title={blog.name}
                    description={(blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 100) + "..."}
                    category={blog.type}
                    likesCount={blog.likesCount || 0}
                    isLiked={blog.likedByMe || false}
                    imageUrl={getServerAssetUrl(blog.imageUrl || blog.imageUrls?.thumbnail)}
                    useOptimizedLoading={true}
                  />
                ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
