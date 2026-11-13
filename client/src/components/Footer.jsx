import { useNavigate } from "react-router-dom";
import MainLogo from "../assets/main-logo-user.png";

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
    <footer className="bg-ink text-cream mt-auto">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12 pt-14 md:pt-24 pb-10">
        <p className="font-display font-bold text-[clamp(34px,6vw,64px)] leading-[.92] tracking-[-.045em] max-w-[1000px] m-0">
          Made for <em className="not-italic text-gold">productive</em> people.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.8fr_1fr] gap-10 border-t border-inkSoft pt-10 mt-14">
          <div className="flex flex-col gap-3.5">
            <img src={MainLogo} alt="SmartTemp" className="h-6 w-auto self-start [filter:brightness(0)_invert(1)]" />
            <p className="max-w-[320px] text-sm text-[#B9C1DA]">
              Ready-to-use productivity templates and sharp guides to help ambitious teams and
              professionals do their best work — faster.
            </p>
          </div>

          <div>
            <div className="font-sans text-[11px] font-medium tracking-[.1em] text-faint mb-4">EXPLORE</div>
            <div className="flex flex-col gap-2.5 items-start">
              {links.map((l) => (
                <button
                  key={l.name}
                  onClick={() => navigate(l.path)}
                  className="text-[15px] text-[#DCE3FA] hover:text-gold hover:translate-x-1 transition-all"
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex flex-wrap justify-between gap-3 mt-14 font-sans text-[12px] text-faint">
          <span>© {year} SmartTemp. All rights reserved.</span>
          <span>Made for productive people.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
