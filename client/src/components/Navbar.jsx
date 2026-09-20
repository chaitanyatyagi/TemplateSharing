import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import ProfileAvatar from "../utils/ProfileAvatar";
import MainLogo from "../assets/main-logo-user.png";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Templates", path: "/templates" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : []),
  ];

  const avatarName = user?.displayName || user?.email || "User";
  const currentPath = location.pathname === "/" ? "/" : location.pathname.toLowerCase();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-borderLight">
      <div className="max-w-7xl mx-auto flex flex-row h-16 justify-between items-center px-4 sm:px-6 lg:px-8">
        {/* Left */}
        <div className="flex flex-row items-center gap-3">
          <button className="block md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu className="w-6 h-6 text-textHeading" />
          </button>
          <img src={MainLogo} alt="SmartTemp" className="h-8 w-auto cursor-pointer" onClick={() => navigate("/")} />
        </div>

        {/* Center nav */}
        <nav className="hidden md:flex flex-row gap-1 items-center">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive ? "bg-lightBlue text-bluePrimary" : "text-textDark hover:text-bluePrimary hover:bg-background"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex flex-row gap-3 sm:gap-4 items-center">
          <button className="relative cursor-pointer text-textDark hover:text-bluePrimary transition" onClick={() => navigate("/cart")} aria-label="Cart">
            <ShoppingCart size={24} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-bluePrimary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="cursor-pointer" onClick={() => navigate("/profile")}>
              <ProfileAvatar name={avatarName} />
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-bluePrimary text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-blueHover transition-all shadow-sm hover:shadow"
            >
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="bg-black/50 flex-1" onClick={() => setSidebarOpen(false)} />
          <div className="bg-white w-[78vw] max-w-xs p-5 flex flex-col gap-2 animate-slideIn">
            <div className="flex justify-between items-center mb-4">
              <img src={MainLogo} alt="SmartTemp" className="h-7 w-auto" />
              <button onClick={() => setSidebarOpen(false)} aria-label="Close menu">
                <X className="w-6 h-6 text-textHeading" />
              </button>
            </div>
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              return (
                <button
                  key={item.name}
                  className={`text-left px-3 py-2.5 rounded-xl text-md font-medium transition-all ${
                    isActive ? "bg-lightBlue text-bluePrimary" : "text-textDark hover:bg-background"
                  }`}
                  onClick={() => { setSidebarOpen(false); navigate(item.path); }}
                >
                  {item.name}
                </button>
              );
            })}
            {!user && (
              <button
                onClick={() => { setSidebarOpen(false); navigate("/login"); }}
                className="mt-2 bg-bluePrimary text-white font-semibold px-3 py-2.5 rounded-xl hover:bg-blueHover transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
