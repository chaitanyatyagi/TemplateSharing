import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ProfileAvatar from "../utils/ProfileAvatar";
import Notification from "../assets/notification.png";
import MainLogo from "../assets/main-logo.png";
import Cart from "../assets/cart.svg";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    { name: "home", path: "/" },
    { name: "templates", path: "/templates" },
    { name: "blogs", path: "/blogs" },
    { name: "contact", path: "/contact" },
    ...(isAdmin ? [{ name: "admin", path: "/admin" }] : []),
  ];

  const avatarName = user?.displayName || user?.email || "Guest";

  // Derive current active menu based on the route
  const currentPath = location.pathname === "/" ? "/" : location.pathname.toLowerCase();

  return (
    <div className="flex flex-row h-[7vh] justify-between items-center bg-white border border-gray-300 shadow-md px-4 sm:px-6 py-3">
      {/* Left Section */}
      <div className="flex flex-row items-center gap-4">
        {/* Hamburger menu - visible only on mobile */}
        <button
          className="block md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="w-6 h-6 text-textHeading" />
        </button>

        <img
          src={MainLogo}
          alt="Main Logo"
          className="h-[30px] w-[180px] sm:h-[35px] sm:w-[230px] cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      {/* Middle Menu (hidden on mobile) */}
      <div className="hidden md:flex flex-row gap-4 sm:gap-8 items-center">
        {menuItems.map((item, index) => {
          const isActive = currentPath === item.path;
          return (
            <p
              key={index}
              className={`text-sm sm:text-md md:text-lg cursor-pointer transition-colors ${
                isActive ? "text-bluePrimary underline" : "text-textHeading hover:text-bluePrimary"
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </p>
          );
        })}
      </div>

      {/* Right Icons */}
      <div className="flex flex-row gap-4 sm:gap-8 items-center">
        <div className="relative cursor-pointer" onClick={() => navigate("/cart")}>
          <img
            src={Cart}
            alt="Cart"
            className="h-[25px] w-[22px] sm:h-[30px] sm:w-[26px] md:h-[35px] md:w-[28px]"
          />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-bluePrimary text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
        <ProfileAvatar name={avatarName} />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Background overlay */}
          <div
            className="bg-black/50 flex-1"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar content */}
          <div className="bg-white w-[75vw] sm:w-[60vw] p-4 flex flex-col gap-4 animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-textHeading">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-textHeading" />
              </button>
            </div>

            {menuItems.map((item, index) => {
              const isActive = currentPath === item.path;
              return (
                <p
                  key={index}
                  className={`p-2 rounded-md text-md font-medium cursor-pointer transition-all ${
                    isActive
                      ? "text-bluePrimary bg-lightBlue"
                      : "text-textHeading hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate(item.path);
                  }}
                >
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
