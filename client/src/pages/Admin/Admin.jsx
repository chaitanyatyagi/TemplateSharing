import { useEffect, useState } from "react";
import { Menu, X, Bell, ArrowUpRight, LayoutDashboard, ShoppingBag, Users, LayoutTemplate, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { admin } from "../../api/admin";
import DashboardPage from "./Dashboard";
import OrderPage from "./Order";
import Template from "./Template";
import Blog from "./Blog";
import UserData from "./UserData";
import MainLogo from "../../assets/main-logo-user.png";

const MENU = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Orders", icon: ShoppingBag },
  { name: "Users Data", icon: Users },
  { name: "Templates", icon: LayoutTemplate },
  { name: "Blogs", icon: Newspaper },
];

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!user) return navigate("/login");
      if (!isAdmin) return navigate("/");
      try {
        const res = await admin();
        if (res.status !== "Success") return navigate("/login");
        setLoading(false);
      } catch (err) { console.error("Admin check failed:", err); navigate("/login"); }
    };
    if (!authLoading) run();
  }, [navigate, user, isAdmin, authLoading]);

  if (loading) return null;

  const SidebarItem = ({ item, onClick }) => {
    const active = activeMenu === item.name;
    const Icon = item.icon;
    return (
      <button
        onClick={onClick}
        className={`h-12 rounded-full px-4 flex gap-3 items-center text-[15px] font-medium text-left transition-all hover:pl-[22px] ${
          active ? "bg-cream text-ink" : "bg-transparent text-[#BDB5A8] hover:text-cream"
        }`}
      >
        <Icon size={18} /> {item.name}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* Top bar */}
      <div className="h-[68px] flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-ink bg-cream sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button className="md:hidden w-11 h-11 flex items-center justify-center" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <img src={MainLogo} alt="SmartTemp" className="h-6 [filter:brightness(0)]" />
          <span className="font-mono text-[11px] font-medium tracking-[.1em] text-terracotta border border-terracotta rounded-full px-2.5 py-0.5">ADMIN</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={() => navigate("/")} className="flex gap-1.5 items-center font-medium text-[14px] text-ink border-b border-ink pb-1 hover:text-terracotta transition-colors">
            User Site <ArrowUpRight size={14} />
          </button>
          <button aria-label="Notifications" className="relative w-11 h-11 rounded-full border border-line flex items-center justify-center hover:border-ink transition-colors">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-terracotta" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <nav className="hidden md:flex w-[248px] shrink-0 bg-ink py-7 px-4 flex-col gap-1">
          <div className="font-mono text-[11px] font-medium tracking-[.1em] text-faint px-3.5 pb-3.5">MANAGE</div>
          {MENU.map((item) => <SidebarItem key={item.name} item={item} onClick={() => setActiveMenu(item.name)} />)}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 bg-cream">
          {activeMenu === "Dashboard" && <DashboardPage />}
          {activeMenu === "Orders" && <OrderPage />}
          {activeMenu === "Users Data" && <UserData />}
          {activeMenu === "Templates" && <Template />}
          {activeMenu === "Blogs" && <Blog />}
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex md:hidden">
          <div className="w-[80vw] max-w-[320px] bg-ink py-5 px-4 flex flex-col gap-1.5 [animation:rise_.4s_both]">
            <div className="flex justify-between items-center mb-5 pl-3.5">
              <span className="text-cream font-display text-[28px]">Menu</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close" className="w-11 h-11 flex items-center justify-center"><X size={22} className="text-cream" /></button>
            </div>
            {MENU.map((item) => <SidebarItem key={item.name} item={item} onClick={() => { setActiveMenu(item.name); setMenuOpen(false); }} />)}
          </div>
          <div className="flex-1 bg-ink/50" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default Admin;
