import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Download, FileText, ShieldCheck } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/blogCard";
import TemplateCard from "../../components/templateCard";
import Home1 from "../../assets/home1.png";
import TemplateService from "../../api/template";
import BlogService from "../../api/blog";
import { getTemplateImageUrl, getServerAssetUrl } from "../../utils/assetUrl";

const HOME_PAGE_ITEM_LIMIT = 4;

// Consistent section heading (eyebrow + title + subtitle)
const SectionHead = ({ eyebrow, title, subtitle }) => (
  <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-10">
    {eyebrow && (
      <span className="inline-flex items-center gap-1.5 text-bluePrimary bg-lightBlue text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
        {eyebrow}
      </span>
    )}
    <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-textHeading leading-tight">{title}</h2>
    {subtitle && <p className="text-textMuted mt-3 text-base sm:text-lg leading-relaxed">{subtitle}</p>}
  </div>
);

const CardSkeleton = () => (
  <div className="w-full max-w-xs rounded-2xl border border-borderLight bg-white p-3 animate-pulse">
    <div className="w-full h-[180px] rounded-xl mb-3 bg-borderLight" />
    <div className="h-4 bg-borderLight rounded mb-2" />
    <div className="h-3 bg-borderLight rounded w-2/3" />
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await TemplateService.getAllTemplates();
        if (response.status === "Success") {
          setTemplates((response.templates || []).slice(0, HOME_PAGE_ITEM_LIMIT));
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await BlogService.getAllBlogs(1, HOME_PAGE_ITEM_LIMIT);
        if (response.status === "Success") setBlogs(response.blogs || []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchTemplates();
    fetchBlogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Navbar />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        {/* soft brand glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-bluePrimary/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-40 -left-24 w-[360px] h-[360px] rounded-full bg-lightBlue/50 blur-[120px]" />

        <div className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 px-5 sm:px-8 lg:px-12 py-14 md:py-20">
          <div className="flex-1 flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 self-start text-bluePrimary bg-white border border-borderLight shadow-sm text-xs font-semibold px-3 py-1.5 rounded-full">
              <Sparkles size={14} /> 100+ premium templates &amp; guides
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-textHeading leading-[1.08] tracking-tight">
              Productivity templates for{" "}
              <span className="text-bluePrimary">ambitious</span> teams &amp; professionals.
            </h1>
            <p className="text-textMuted text-base md:text-lg leading-relaxed max-w-xl">
              Stop starting from scratch. Get a head start on your best work with ready-to-use
              templates you can ship today — plus sharp guides to lead tomorrow.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <button
                onClick={() => navigate("/templates")}
                className="inline-flex items-center gap-2 bg-bluePrimary text-white px-6 py-3 rounded-xl font-semibold shadow-sm hover:bg-blueHover hover:shadow-md transition-all"
              >
                Browse templates <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("/blogs")}
                className="inline-flex items-center gap-2 bg-white text-textHeading border border-border px-6 py-3 rounded-xl font-semibold hover:border-bluePrimary hover:text-bluePrimary transition-all"
              >
                Read the blog
              </button>
            </div>
            {/* trust row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-textMuted">
              <span className="inline-flex items-center gap-2"><FileText size={16} className="text-bluePrimary" /> Excel, PDF, Docs &amp; Figma</span>
              <span className="inline-flex items-center gap-2"><Download size={16} className="text-bluePrimary" /> Instant download</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-bluePrimary" /> Emailed to your inbox</span>
            </div>
          </div>

          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-lightBlue to-white rounded-3xl rotate-3" />
              <div className="relative bg-white border border-borderLight rounded-3xl shadow-xl p-6">
                <img src={Home1} alt="Productivity templates" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Templates ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <SectionHead
          eyebrow="Templates"
          title="Find the perfect template"
          subtitle="Our most popular picks to help you work smarter and deliver exceptional results."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {loadingTemplates ? (
            Array.from({ length: HOME_PAGE_ITEM_LIMIT }).map((_, i) => <CardSkeleton key={`t-${i}`} />)
          ) : templates.length === 0 ? (
            <p className="text-textMuted col-span-full text-center py-6">No templates available yet.</p>
          ) : (
            templates.map((template) => (
              <div key={template._id} className="w-full max-w-xs">
                <TemplateCard
                  id={template._id}
                  image={getTemplateImageUrl(template.card_image)}
                  title={template.name}
                  description={template.card_content}
                  category={template.template_category}
                  price={template.price}
                />
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/templates")}
            className="inline-flex items-center gap-2 text-bluePrimary font-semibold px-6 py-3 rounded-xl border border-borderLight bg-white hover:border-bluePrimary hover:shadow-sm transition-all"
          >
            View all templates <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ---------------- Newsletter band ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-darkBg px-6 sm:px-12 py-12 text-center">
          <div className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-bluePrimary/25 blur-[100px]" />
          <div className="relative max-w-xl mx-auto flex flex-col items-center gap-4">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Get productivity tips in your inbox</h3>
            <p className="text-white/70">Fresh templates and guides, no spam. Unsubscribe anytime.</p>
            <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl px-4 py-3 bg-white/10 text-white placeholder-white/50 border border-white/15 focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <button type="submit" className="bg-bluePrimary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blueHover transition-all">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ---------------- Blogs ---------------- */}
      <section className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <SectionHead
          eyebrow="Insights"
          title="Accelerate your growth with our blogs"
          subtitle="We break down the latest AI updates and skill shifts into strategies you can actually use."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {loadingBlogs ? (
            Array.from({ length: HOME_PAGE_ITEM_LIMIT }).map((_, i) => <CardSkeleton key={`b-${i}`} />)
          ) : blogs.length === 0 ? (
            <p className="text-textMuted col-span-full text-center py-6">No blogs available yet.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="w-full max-w-xs">
                <Card
                  id={blog._id}
                  title={blog.name}
                  description={(blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 100) + "..."}
                  category={blog.type}
                  likesCount={blog.likesCount || 0}
                  isLiked={blog.likedByMe || false}
                  imageUrl={getServerAssetUrl(blog.imageUrl)}
                  useOptimizedLoading={true}
                />
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center mt-10">
          <button
            onClick={() => navigate("/blogs")}
            className="inline-flex items-center gap-2 text-bluePrimary font-semibold px-6 py-3 rounded-xl border border-borderLight bg-white hover:border-bluePrimary hover:shadow-sm transition-all"
          >
            View all blogs <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
