import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import MainLogo from "../assets/main-logo-user.png";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const initialsOf = (name) =>
  (name || "You")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  const nav = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];
  const current = location.pathname === "/" ? "/" : location.pathname.toLowerCase();
  const initials = initialsOf(user?.displayName || user?.email);

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-ink">
      <div className="max-w-[1320px] mx-auto h-[72px] px-5 sm:px-8 lg:px-12 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3.5">
          <button className="md:hidden -ml-2 w-11 h-11 flex items-center justify-center" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} className="text-ink" />
          </button>
          <img
            src={MainLogo}
            alt="SmartTemp"
            onClick={() => navigate("/")}
            className="h-7 w-auto cursor-pointer [filter:brightness(0)_saturate(0)] opacity-90"
          />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => {
            const active = current === n.path;
            return (
              <button
                key={n.name}
                onClick={() => navigate(n.path)}
                className={`font-sans text-[15px] font-medium pb-1 border-b transition-colors ${
                  active ? "text-ink border-ink" : "text-muted2 border-transparent hover:text-ink hover:border-line"
                }`}
              >
                {n.name}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/cart")}
            aria-label="Cart"
            className="relative w-11 h-11 rounded-full border border-line flex items-center justify-center hover:border-ink hover:-rotate-6 transition-all"
          >
            <ShoppingCart size={19} className="text-ink" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-terracotta text-paper font-mono text-[11px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <button
              onClick={() => navigate("/profile")}
              aria-label="Profile"
              className="w-11 h-11 rounded-full bg-ink text-cream font-display italic text-[19px] flex items-center justify-center hover:bg-terracotta transition-colors"
            >
              {initials}
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="h-11 px-5 rounded-full bg-ink text-cream font-semibold text-[14px] hover:bg-terracotta transition-colors"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="w-[86vw] max-w-[380px] bg-cream border-r border-ink px-6 py-5 flex flex-col gap-1.5 [animation:rise_.4s_both]">
            <div className="flex justify-between items-center mb-7">
              <img src={MainLogo} alt="SmartTemp" className="h-6 w-auto [filter:brightness(0)]" />
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="w-11 h-11 flex items-center justify-center">
                <X size={22} className="text-ink" />
              </button>
            </div>
            {nav.map((n) => (
              <button
                key={n.name}
                onClick={() => { setMenuOpen(false); navigate(n.path); }}
                className="text-left border-b border-line py-3.5 font-display text-[34px] leading-none text-ink"
              >
                {n.name}
              </button>
            ))}
            {!user && (
              <button
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="mt-5 h-[52px] py-3.5 rounded-full bg-ink text-cream font-semibold"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="flex-1 bg-ink/45 animate-fadeIn" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
