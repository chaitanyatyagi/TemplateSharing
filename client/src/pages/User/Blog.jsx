import { useState, useEffect } from "react";
import { Newspaper, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/blogCard";
import BlogService from "../../api/blog";
import { getServerAssetUrl } from "../../utils/assetUrl";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "health", label: "Health" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
];

const stripHtml = (s) => (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const Blog = () => {
  const [category, setCategory] = useState("all");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const res = category === "all"
          ? await BlogService.getAllBlogs(1, 12)
          : await BlogService.getBlogsByCategory(category, 1, 12);
        if (res.status === "Success") setBlogs(res.blogs || []);
        else setError(res.message || "Failed to fetch blogs");
      } catch (err) { setError(err.message || "Failed to fetch blogs"); }
      finally { setLoading(false); }
    };
    run();
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <section className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-20 pb-16 md:pb-28">
        <div className="flex flex-wrap gap-x-16 gap-y-6 items-end justify-between animate-rise">
          <div className="flex-1 basis-[520px]">
            <div className="flex items-center gap-3 font-mono text-[12px] font-medium tracking-[.08em] text-muted2 mb-[18px]">
              <span className="w-9 h-px bg-ink" />INSIGHTS &amp; GUIDES
            </div>
            <h1 className="font-display text-[clamp(52px,7vw,104px)] leading-[.95] tracking-[-.02em] m-0">
              Accelerate your <em className="text-terracotta">growth</em>
            </h1>
          </div>
          <p className="basis-[360px] flex-[0_1_360px] text-[17px] text-bodytext m-0">
            The latest AI updates and skill shifts, broken down into strategies you can actually use.
          </p>
        </div>

        <div className="my-10 md:my-12 border-t border-ink border-b border-b-line py-[18px] flex flex-wrap gap-x-8 gap-y-4 items-center justify-between">
          <div className="flex items-baseline gap-3.5">
            <h2 className="font-display text-[28px] m-0">Latest Blogs</h2>
            {!loading && !error && <span className="font-mono text-[12px] text-muted2">{String(blogs.length).padStart(2, "0")} articles</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((o) => {
              const active = category === o.value;
              return (
                <button key={o.value} onClick={() => setCategory(o.value)}
                  className={`h-10 px-4 rounded-full border text-sm font-medium transition-all ${active ? "bg-ink text-cream border-ink" : "bg-transparent text-ink border-line hover:border-ink"}`}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="py-20 flex flex-col items-center text-center gap-2">
            <AlertCircle size={38} className="text-likeRed" />
            <p className="font-display text-[26px] m-0">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 h-12 px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors">Retry</button>
          </div>
        ) : !loading && blogs.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center gap-2">
            <Newspaper size={38} className="text-faint" />
            <p className="font-display text-[28px] m-0">No articles in this category yet</p>
            <p className="text-muted2 text-sm m-0">Try a different category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-7 gap-y-14">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/2] border border-line bg-creamAlt animate-pulse" />)
              : blogs.map((b) => (
                  <Card key={b._id} id={b._id} title={b.name} description={stripHtml(b.content).slice(0, 110) + "…"}
                    category={b.type} likesCount={b.likesCount || 0} isLiked={b.likedByMe || false}
                    imageUrl={getServerAssetUrl(b.imageUrl || b.imageUrls?.thumbnail)} useOptimizedLoading />
                ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Blog;
