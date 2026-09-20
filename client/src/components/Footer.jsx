import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const links = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-darkBg text-white mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-bluePrimary">
                <Sparkles size={18} className="text-white" />
              </span>
              <span className="text-xl font-bold tracking-tight">SmartTemp</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Ready-to-use productivity templates and sharp guides to help ambitious teams and
              professionals do their best work — faster.
            </p>
          </div>

          {/* Explore */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50 mb-4">Explore</h4>
            <ul className="flex flex-col gap-2.5">
              {links.map((l) => (
                <li key={l.name}>
                  <button onClick={() => navigate(l.path)} className="text-white/75 hover:text-white text-sm transition-colors">
                    {l.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50 mb-4">Stay in the loop</h4>
            <p className="text-white/60 text-sm mb-4">Fresh templates and guides in your inbox. No spam.</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl px-4 py-2.5 bg-white/10 text-white placeholder-white/40 border border-white/15 focus:outline-none focus:ring-2 focus:ring-bluePrimary text-sm"
              />
              <button type="submit" className="bg-bluePrimary hover:bg-blueHover text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/50 text-sm">© {year} SmartTemp. All rights reserved.</p>
          <p className="text-white/40 text-xs">Made for productive people.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
