import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-5 py-16 md:py-24 animate-rise">
        <div
          className="font-display font-bold leading-[.8] tracking-[-.04em] text-terracotta select-none"
          style={{ fontSize: "clamp(120px,26vw,260px)" }}
        >
          4<span className="text-cream [-webkit-text-stroke:3px_#F5D76E] [text-shadow:0_0_0_#F5D76E]">0</span>4
        </div>
        <h1 className="font-display text-[clamp(28px,4.5vw,46px)] leading-none tracking-[-.02em] mt-2 m-0">
          This page took a day off.
        </h1>
        <p className="mt-4 max-w-[440px] text-bodytext text-[17px] m-0">
          The link may be broken or the page may have moved. Let's get you back to something useful.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-8">
          <button
            onClick={() => navigate("/templates")}
            className="h-[54px] px-6 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta transition-colors"
          >
            Browse templates
          </button>
          <button
            onClick={() => navigate("/")}
            className="h-[54px] px-6 rounded-full border border-ink font-semibold hover:bg-ink hover:text-cream transition-colors"
          >
            Go to home
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="h-[54px] px-6 rounded-full font-semibold text-muted2 hover:text-ink transition-colors"
          >
            Contact us
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
