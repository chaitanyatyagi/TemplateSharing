import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import TemplateCard from "../../components/templateCard";
import ErrorState from "../../components/ErrorState";
import TemplateService from "../../api/template";
import { getTemplateImageUrl } from "../../utils/assetUrl";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "finance", label: "Finance" },
  { value: "portfolio", label: "Portfolio" },
  { value: "business", label: "Business" },
];

const Template = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = category === "all"
        ? await TemplateService.getAllTemplates()
        : await TemplateService.getTemplatesByCategory(category);
      if (res.status === "Success") setTemplates(res.templates || []);
      else setError(res.message || "Failed to fetch templates");
    } catch (err) { setError(err.message || "Failed to fetch templates"); }
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <section className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-20 pb-16 md:pb-28">
        {/* Header */}
        <div className="flex flex-wrap gap-x-16 gap-y-6 items-end justify-between animate-rise">
          <div className="flex-1 basis-[520px]">
            <div className="flex items-center gap-3 font-mono text-[12px] font-medium tracking-[.08em] text-muted2 mb-[18px]">
              <span className="w-9 h-px bg-ink" />TEMPLATES
            </div>
            <h1 className="font-display text-[clamp(36px,5.5vw,60px)] leading-[.95] tracking-[-.02em] m-0">
              Find the perfect <em className="not-italic text-terracotta">template</em>
            </h1>
          </div>
          <p className="basis-[360px] flex-[0_1_360px] text-[17px] text-bodytext m-0">
            Unlock smarter workflows and achieve superior results with our best resources.
          </p>
        </div>

        {/* Toolbar */}
        <div className="my-10 md:my-12 border-t border-ink border-b border-b-line py-[18px] flex flex-wrap gap-x-8 gap-y-4 items-center justify-between">
          <div className="flex items-baseline gap-3.5">
            <h2 className="font-display text-[22px] m-0">Latest Templates</h2>
            {!loading && !error && <span className="font-mono text-[12px] text-muted2">{String(templates.length).padStart(2, "0")} templates</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((o) => {
              const active = category === o.value;
              return (
                <button key={o.value} onClick={() => setCategory(o.value)}
                  className={`h-10 px-[18px] rounded-xl border text-sm font-medium transition-all ${active ? "bg-ink text-cream border-ink" : "bg-transparent text-ink border-line hover:border-ink"}`}>
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <ErrorState
            title="We couldn't load templates"
            message="The server didn't respond. Check your connection and try again."
            onRetry={fetchTemplates}
            secondaryLabel="Back to home"
            onSecondary={() => navigate("/")}
          />
        ) : !loading && templates.length === 0 ? (
          <ErrorState
            variant="empty"
            title="No templates in this category yet"
            message="Try a different category or check back soon."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-14">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl border border-line bg-creamAlt animate-pulse" />)
              : templates.map((t) => (
                  <TemplateCard key={t._id} id={t._id} image={getTemplateImageUrl(t.card_image)} title={t.name}
                    description={t.card_content} category={t.template_category} price={t.template_type === "free" ? 0 : t.price} />
                ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default Template;
