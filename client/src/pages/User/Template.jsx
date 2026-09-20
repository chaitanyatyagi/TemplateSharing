import { useState, useEffect } from "react";
import { Sparkles, PackageOpen, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Dropdown from "../../components/DropDown";
import Footer from "../../components/Footer";
import TemplateCard from "../../components/templateCard";
import TemplateService from "../../api/template";
import { getTemplateImageUrl } from "../../utils/assetUrl";

const Template = () => {
  const [category, setCategory] = useState("all");
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = [
    { value: "all", label: "All Category" },
    { value: "finance", label: "Finance" },
    { value: "portfolio", label: "Portfolio" },
    { value: "business", label: "Business" },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response =
          category === "all"
            ? await TemplateService.getAllTemplates()
            : await TemplateService.getTemplatesByCategory(category);
        if (response.status === "Success") {
          setTemplates(response.templates || []);
        } else {
          setError(response.message || "Failed to fetch templates");
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError(err.message || "Failed to fetch templates");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [category]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header band */}
      <section className="relative overflow-hidden border-b border-borderLight bg-white">
        <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-lightBlue/50 blur-[110px]" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 text-bluePrimary bg-lightBlue text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            <Sparkles size={13} /> Templates
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-textHeading tracking-tight">
            Find the perfect template
          </h1>
          <p className="text-textMuted mt-3 text-base sm:text-lg max-w-2xl">
            Unlock smarter workflows and achieve superior results with our best resources.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10">
        {/* Toolbar */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-textHeading">Latest Templates</h2>
            {!loading && !error && (
              <p className="text-sm text-textMuted mt-0.5">
                {templates.length} {templates.length === 1 ? "template" : "templates"} available
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
        ) : !loading && templates.length === 0 ? (
          <div className="w-full flex flex-col items-center text-center py-16">
            <PackageOpen size={40} className="text-grayLight mb-3" />
            <p className="text-textHeading font-semibold">No templates in this category yet</p>
            <p className="text-textMuted text-sm mt-1">Try a different category or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {loading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <div key={`loading-${idx}`} className="w-full max-w-xs border border-borderLight rounded-2xl p-3 bg-white animate-pulse">
                    <div className="w-full h-[180px] rounded-xl mb-3 bg-borderLight" />
                    <div className="h-4 bg-borderLight rounded mb-2" />
                    <div className="h-3 bg-borderLight rounded mb-3 w-2/3" />
                    <div className="h-9 bg-borderLight rounded-xl" />
                  </div>
                ))
              : templates.map((template) => (
                  <TemplateCard
                    key={template._id}
                    id={template._id}
                    image={getTemplateImageUrl(template.card_image)}
                    title={template.name}
                    description={template.card_content}
                    category={template.template_category}
                    price={template.price}
                  />
                ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Template;
