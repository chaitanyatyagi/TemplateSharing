import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
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

// Editorial-masthead link (2a): uppercase, tracked, with a cobalt underline that
// grows from the left on hover and sits full-width when the route is active.
const MastheadLink = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative font-sans text-[13px] font-semibold uppercase tracking-[.12em] whitespace-nowrap pb-1.5 transition-colors ${
      active ? "text-ink" : "text-muted2 hover:text-ink"
    }`}
  >
    {label}
    <span
      className={`absolute left-0 bottom-0 h-0.5 w-full bg-terracotta origin-left transition-transform duration-300 ${
        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  </button>
);

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  const current = location.pathname === "/" ? "/" : location.pathname.toLowerCase();
  const isActive = (path) => (path === "/" ? current === "/" : current.startsWith(path));
  const initials = initialsOf(user?.displayName || user?.email);

  // Links split either side of the centred wordmark (editorial masthead).
  const leftNav = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: "Blogs", path: "/blogs" },
  ];
  const rightNav = [
    { name: "Contact", path: "/contact" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];
  const allNav = [...leftNav, ...rightNav];

  const Wordmark = ({ size = "text-[30px]" }) => (
    <button
      onClick={() => navigate("/")}
      className="text-ink hover:opacity-80 transition-opacity"
      aria-label="SmartTemp home"
    >
      <span className={`font-display font-bold leading-none tracking-[-.06em] whitespace-nowrap ${size}`}>
        smarttemp<span className="text-terracotta">.</span>
      </span>
    </button>
  );

  const CartButton = ({ asLink = false }) =>
    asLink ? (
      <button
        onClick={() => navigate("/cart")}
        className="group flex items-center gap-2 font-sans text-[13px] font-semibold uppercase tracking-[.12em] text-ink hover:text-terracotta transition-colors"
        aria-label="Cart"
      >
        Cart
        <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-gold text-ink font-sans text-[11px] font-bold flex items-center justify-center normal-case tracking-normal">
          {count}
        </span>
      </button>
    ) : (
      <button
        onClick={() => navigate("/cart")}
        aria-label="Cart"
        className="relative w-11 h-11 rounded-full border border-line flex items-center justify-center hover:border-ink transition-colors"
      >
        <ShoppingCart size={19} className="text-ink" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-gold text-ink font-sans text-[11px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    );

  const Avatar = () =>
    user ? (
      <button
        onClick={() => navigate("/profile")}
        aria-label="Profile"
        className="w-10 h-10 rounded-full border-2 border-ink text-ink font-display font-bold tracking-[-.02em] text-[14px] flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
      >
        {initials}
      </button>
    ) : (
      <button
        onClick={() => navigate("/login")}
        className="h-10 px-5 rounded-full border-2 border-ink text-ink font-sans text-[13px] font-semibold uppercase tracking-[.1em] hover:bg-ink hover:text-cream transition-colors"
      >
        Sign in
      </button>
    );

  return (
    <>
    <header className="sticky top-0 z-40 bg-cream supports-[backdrop-filter]:bg-cream/90 backdrop-blur-md border-b-2 border-ink">
      <div className="max-w-[1320px] mx-auto px-5 sm:px-8 lg:px-12">
        {/* Desktop — editorial masthead: links | centred wordmark | links + actions */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center h-[84px] gap-4 xl:gap-8">
          <nav className="flex items-center gap-5 xl:gap-[30px] min-w-0">
            {leftNav.map((n) => (
              <MastheadLink key={n.name} label={n.name} active={isActive(n.path)} onClick={() => navigate(n.path)} />
            ))}
          </nav>

          <div className="justify-self-center">
            <Wordmark size="text-[30px] xl:text-[32px]" />
          </div>

          <div className="flex items-center gap-4 xl:gap-6 justify-end min-w-0">
            {rightNav.map((n) => (
              <MastheadLink key={n.name} label={n.name} active={isActive(n.path)} onClick={() => navigate(n.path)} />
            ))}
            <CartButton asLink />
            <Avatar />
          </div>
        </div>

        {/* Mobile / tablet — hamburger · centred wordmark · cart + avatar */}
        <div className="lg:hidden grid grid-cols-[1fr_auto_1fr] items-center h-[72px] gap-3">
          <div className="justify-self-start">
            <button
              className="-ml-2 w-11 h-11 flex items-center justify-center"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} className="text-ink" />
            </button>
          </div>
          <div className="justify-self-center">
            <Wordmark size="text-[23px]" />
          </div>
          <div className="justify-self-end flex items-center gap-2.5">
            <CartButton />
            {user && (
              <button
                onClick={() => navigate("/profile")}
                aria-label="Profile"
                className="w-10 h-10 rounded-full border-2 border-ink text-ink font-display font-bold text-[13px] flex items-center justify-center"
              >
                {initials}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Mobile drawer — rendered outside <header> so its fixed positioning
          is viewport-relative (the header's backdrop-filter would otherwise
          make it the containing block and trap the drawer at navbar height). */}
      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex lg:hidden">
          <div className="w-[86vw] max-w-[380px] bg-cream border-r-2 border-ink px-6 py-5 flex flex-col gap-1.5 overflow-y-auto [animation:slideInLeft_.3s_cubic-bezier(.2,.8,.2,1)_both]">
            <div className="flex justify-between items-center mb-7">
              <span className="font-display font-bold text-[26px] leading-none tracking-[-.06em] text-ink">
                smarttemp<span className="text-terracotta">.</span>
              </span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="w-11 h-11 flex items-center justify-center">
                <X size={22} className="text-ink" />
              </button>
            </div>
            {allNav.map((n) => (
              <button
                key={n.name}
                onClick={() => { setMenuOpen(false); navigate(n.path); }}
                className={`text-left border-b border-line py-3.5 font-display text-[34px] leading-none transition-colors ${
                  isActive(n.path) ? "text-terracotta" : "text-ink hover:text-terracotta"
                }`}
              >
                {n.name}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => { setMenuOpen(false); navigate("/profile"); }}
                className="mt-5 h-[52px] rounded-full bg-ink text-cream font-semibold flex items-center justify-center gap-2.5"
              >
                <span className="w-7 h-7 rounded-full bg-cream text-ink font-display font-bold text-[13px] flex items-center justify-center">{initials}</span>
                My account
              </button>
            ) : (
              <button
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="mt-5 h-[52px] rounded-full bg-ink text-cream font-semibold"
              >
                Sign in
              </button>
            )}
          </div>
          <div className="flex-1 bg-ink/45 animate-fadeIn" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Navbar;
