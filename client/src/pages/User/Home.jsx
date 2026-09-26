import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FileText, Download, ShieldCheck, Heart, Bookmark } from "lucide-react";
import { useSnackbar } from "notistack";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TemplateCard from "../../components/templateCard";
import Home1 from "../../assets/home1.png";
import TemplateService from "../../api/template";
import BlogService from "../../api/blog";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import { getTemplateImageUrl, getServerAssetUrl } from "../../utils/assetUrl";

const LIMIT = 4;
const TICKER = ["Notion systems", "Financial models", "Pitch decks", "Resume kits", "Content calendars", "Dashboards", "SOP templates", "Growth playbooks"];

const stripHtml = (s) => (s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Editorial numbered blog row (with working like/save)
const BlogRow = ({ blog, num }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSaved } = useFavorites();
  const { enqueueSnackbar } = useSnackbar();
  const [liked, setLiked] = useState(blog.likedByMe || false);
  const [likes, setLikes] = useState(blog.likesCount || 0);
  const saved = isSaved(blog._id);

  const gate = (msg) => { enqueueSnackbar(msg, { variant: "info", anchorOrigin: { vertical: "top", horizontal: "center" } }); navigate("/login"); };
  const like = async (e) => {
    e.stopPropagation();
    if (!user) return gate("Log in to like blogs");
    const pl = liked, pc = likes; setLiked(!pl); setLikes((c) => (!pl ? c + 1 : Math.max(0, c - 1)));
    try { const r = await BlogService.toggleLike(blog._id); if (r.status === "Success") { setLiked(r.liked); setLikes(r.likesCount); } else { setLiked(pl); setLikes(pc); } }
    catch { setLiked(pl); setLikes(pc); }
  };
  const save = (e) => { e.stopPropagation(); if (!user) return gate("Log in to save blogs"); toggleSaved(blog._id); };

  return (
    <article className="grid grid-cols-[minmax(40px,64px)_minmax(0,1fr)_auto] gap-x-5 gap-y-4 items-center py-6 border-b border-line">
      <span className="font-mono text-[13px] text-faint">{num}</span>
      <div onClick={() => navigate(`/blogs/${blog._id}`)} className="cursor-pointer flex flex-col gap-1.5 min-w-0 hover:translate-x-2.5 transition-transform duration-300">
        <span className="font-mono text-[11px] font-medium tracking-[.1em] uppercase text-terracotta">{blog.type}</span>
        <h3 className="font-display text-[clamp(24px,2.6vw,36px)] leading-[1.08] text-ink m-0">{blog.name}</h3>
        <p className="text-sm text-muted2 max-w-[640px] line-clamp-1 m-0">{stripHtml(blog.content).slice(0, 120)}</p>
      </div>
      <div className="flex gap-1.5 items-center">
        <button onClick={like} className="h-10 px-3 border border-line rounded-full flex items-center gap-1.5 font-mono text-[13px] text-bodytext hover:border-likeRed transition-colors active:scale-90">
          <Heart size={16} fill={liked ? "#B3261E" : "none"} color={liked ? "#B3261E" : "currentColor"} />{likes}
        </button>
        <button onClick={save} aria-label="Save" className="w-10 h-10 border border-line rounded-full flex items-center justify-center hover:border-ink transition-colors active:scale-90">
          <Bookmark size={16} fill={saved ? "#010736" : "none"} color="#010736" />
        </button>
      </div>
    </article>
  );
};

const SectionHead = ({ num, label, title, subtitle, cta, onCta }) => (
  <div className="flex flex-wrap gap-x-12 gap-y-5 items-end justify-between border-b border-ink pb-7 mb-10">
    <div className="flex-1 min-w-[280px] basis-[420px]">
      <div className="font-mono text-[12px] font-medium tracking-[.08em] text-terracotta mb-3.5">{num} / {label}</div>
      <h2 className="font-display text-[clamp(40px,5vw,68px)] leading-none tracking-[-.015em] text-ink m-0">{title}</h2>
    </div>
    <div className="basis-[380px] flex-[0_1_380px] flex flex-col gap-4 items-start">
      <p className="text-bodytext m-0">{subtitle}</p>
      <button onClick={onCta} className="flex gap-2.5 items-center font-semibold text-[15px] text-ink hover:text-terracotta hover:gap-4 transition-all">
        {cta} <ArrowRight size={17} />
      </button>
    </div>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loadingT, setLoadingT] = useState(true);
  const [loadingB, setLoadingB] = useState(true);

  useEffect(() => {
    TemplateService.getAllTemplates()
      .then((r) => { if (r.status === "Success") setTemplates((r.templates || []).slice(0, LIMIT)); })
      .catch((e) => console.error(e)).finally(() => setLoadingT(false));
    BlogService.getAllBlogs(1, LIMIT)
      .then((r) => { if (r.status === "Success") setBlogs(r.blogs || []); })
      .catch((e) => console.error(e)).finally(() => setLoadingB(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />

      {/* HERO */}
      <section className="max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-24 pb-12 md:pb-20 flex flex-wrap gap-8 md:gap-[72px] items-end">
        <div className="flex-1 min-w-0 basis-[520px] flex flex-col gap-7 animate-rise">
          <div className="flex items-center gap-3 font-mono text-[12px] font-medium tracking-[.08em] uppercase text-muted2">
            <span className="w-9 h-px bg-ink" />100+ premium templates &amp; guides
          </div>
          <h1 className="font-display font-normal text-[clamp(52px,7.4vw,112px)] leading-[.94] tracking-[-.02em] text-balance m-0">
            Productivity templates for <em className="text-terracotta">ambitious</em> teams &amp; professionals.
          </h1>
          <p className="max-w-[520px] text-[clamp(17px,1.4vw,19px)] leading-[1.6] text-bodytext m-0">
            Stop starting from scratch. Get a head start on your best work with ready-to-use
            templates you can ship today — plus sharp guides to lead tomorrow.
          </p>
          <div className="flex flex-wrap gap-x-7 gap-y-3 items-center">
            <button onClick={() => navigate("/templates")} className="h-14 px-7 rounded-full bg-ink text-cream font-semibold text-[15px] flex items-center gap-3 hover:bg-terracotta hover:gap-4 active:scale-[.97] transition-all">
              Browse templates <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate("/blogs")} className="font-semibold text-[15px] text-ink border-b border-ink pb-1.5 hover:text-terracotta transition-colors">
              Read the blog
            </button>
          </div>
          <div className="flex flex-wrap border-t border-line mt-3 text-sm text-bodytext">
            <div className="flex-1 basis-[160px] flex gap-2.5 items-center pt-4 pr-4"><FileText size={17} className="text-terracotta shrink-0" />Excel, PDF, Docs &amp; Figma</div>
            <div className="flex-1 basis-[160px] flex gap-2.5 items-center pt-4 pr-4"><Download size={17} className="text-terracotta shrink-0" />Instant download</div>
            <div className="flex-1 basis-[160px] flex gap-2.5 items-center pt-4 pr-4"><ShieldCheck size={17} className="text-terracotta shrink-0" />Emailed to your inbox</div>
          </div>
        </div>
        <figure className="flex-1 min-w-0 basis-[380px] m-0 flex flex-col gap-3 [animation:rise_.9s_.15s_both]">
          <div className="bg-paper border border-ink p-5 sm:p-8 shadow-[10px_10px_0_#EBDCA8] hover:shadow-[16px_16px_0_#22396F] hover:-rotate-1 hover:-translate-y-1 transition-all duration-500">
            <img src={Home1} alt="Productivity templates" className="w-full block" />
          </div>
          <figcaption className="font-mono text-[12px] text-muted2 tracking-[.04em]">FIG. 01 — A template, ready to ship</figcaption>
        </figure>
      </section>

      {/* MARQUEE */}
      <div className="border-y border-ink bg-creamAlt overflow-hidden">
        <div className="flex w-max animate-marquee">
          {[...TICKER, ...TICKER].map((tk, i) => (
            <span key={i} className="flex items-center gap-7 px-3.5 py-4 font-display italic text-[30px] leading-none whitespace-nowrap">
              {tk}<span className="w-2 h-2 rounded-full bg-terracotta" />
            </span>
          ))}
        </div>
      </div>

      {/* TEMPLATES */}
      <section className="max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-14 md:pt-28 pb-10">
        <SectionHead num="02" label="TEMPLATES" title="Find the perfect template"
          subtitle="Our most popular picks to help you work smarter and deliver exceptional results."
          cta="View all templates" onCta={() => navigate("/templates")} />
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-x-7 gap-y-12">
          {loadingT
            ? Array.from({ length: LIMIT }).map((_, i) => <div key={i} className="aspect-[4/3] border border-line bg-creamAlt animate-pulse" />)
            : templates.map((t) => (
                <TemplateCard key={t._id} id={t._id} image={getTemplateImageUrl(t.card_image)} title={t.name}
                  description={t.card_content} category={t.template_category} price={t.template_type === "free" ? 0 : t.price} />
              ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 py-10">
        <div className="bg-ink text-cream p-8 sm:p-12 md:p-20 flex flex-wrap gap-8 md:gap-16 items-end justify-between">
          <div className="flex-1 basis-[420px]">
            <div className="font-mono text-[12px] font-medium tracking-[.08em] text-terracottaLight mb-4">THE NEWSLETTER</div>
            <h3 className="font-display text-[clamp(36px,4.4vw,60px)] leading-none m-0">Get productivity tips <em className="text-cream">in your inbox</em></h3>
            <p className="text-[#B9BFD2] mt-4 m-0">Fresh templates and guides, no spam. Unsubscribe anytime.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex-1 basis-[360px] flex flex-wrap gap-3 items-stretch">
            <input type="email" placeholder="Enter your email" className="flex-1 basis-[220px] h-14 bg-transparent border-b border-muted2 text-cream placeholder-faint text-[18px] outline-none focus:border-terracottaLight transition-colors" />
            <button type="submit" className="h-14 px-7 rounded-full bg-cream text-ink font-semibold text-[15px] hover:bg-terracotta hover:text-paper active:scale-[.97] transition-all">Subscribe</button>
          </form>
        </div>
      </section>

      {/* BLOGS */}
      <section className="max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-14 md:pt-24 pb-16 md:pb-28">
        <SectionHead num="03" label="INSIGHTS" title="Accelerate your growth with our blogs"
          subtitle="We break down the latest AI updates and skill shifts into strategies you can actually use."
          cta="View all blogs" onCta={() => navigate("/blogs")} />
        <div>
          {loadingB
            ? Array.from({ length: LIMIT }).map((_, i) => <div key={i} className="h-20 border-b border-line animate-pulse" />)
            : blogs.length === 0
              ? <p className="text-muted2 py-6">No blogs available yet.</p>
              : blogs.map((b, i) => <BlogRow key={b._id} blog={{ ...b, imageUrl: getServerAssetUrl(b.imageUrl) }} num={String(i + 1).padStart(2, "0")} />)}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
