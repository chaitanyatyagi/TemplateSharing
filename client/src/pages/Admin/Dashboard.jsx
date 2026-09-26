import { useEffect, useState } from "react";
import { AlertCircle, IndianRupee, ShoppingBag, Users, Percent, LayoutTemplate, Newspaper } from "lucide-react";
import { getDashboardStats } from "../../api/admin";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((res) => { if (res.status === "Success") setStats(res.stats); else setError(res.message || "Failed to load dashboard stats"); })
      .catch((err) => setError(err.message || "Failed to load dashboard stats"));
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }).toUpperCase();

  const cards = stats ? [
    { title: "Total Revenue", value: `₹${stats.totalRevenue}`, subtitle: "This month", subValue: `₹${stats.monthlyRevenue}`, Icon: IndianRupee },
    { title: "Total Orders", value: stats.totalOrders, subtitle: "This month", subValue: stats.monthlyOrders, Icon: ShoppingBag },
    { title: "Total Users", value: stats.totalUsers, subtitle: "This month", subValue: stats.monthlyUsers, Icon: Users },
    { title: "Orders / Users", value: `${stats.ordersPerUserRatio}%`, subtitle: "Orders per registered user", subValue: "—", Icon: Percent },
    { title: "Total Templates", value: stats.totalTemplates, subtitle: "This month", subValue: stats.monthlyTemplates, Icon: LayoutTemplate },
    { title: "Total Blogs", value: stats.totalBlogs, subtitle: "This month", subValue: stats.monthlyBlogs, Icon: Newspaper },
  ] : [];

  return (
    <div className="p-6 sm:p-10 lg:p-14 w-full overflow-y-auto">
      <div className="animate-rise">
        <div className="font-mono text-[12px] font-medium tracking-[.08em] text-muted2">{today}</div>
        <h1 className="font-display text-[clamp(48px,6vw,80px)] leading-[.95] tracking-[-.02em] my-2.5 m-0">Dashboard</h1>
        <p className="text-bodytext m-0">Welcome back, <b className="text-ink">Amit</b> — here's what's happening with your marketplace.</p>
      </div>

      {error && (
        <div className="mt-8 flex items-start gap-2 p-3 bg-[#F4DEDA] text-likeRed text-sm"><AlertCircle size={16} className="shrink-0 mt-0.5" />{error}</div>
      )}

      <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] border-t border-ink border-l border-l-line">
        {stats
          ? cards.map((c) => {
              const Icon = c.Icon;
              return (
                <div key={c.title} className="p-[26px] border-r border-b border-line bg-cream hover:bg-paper transition-colors flex flex-col gap-5">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-medium tracking-[.1em] uppercase text-muted2">{c.title}</span>
                    <Icon size={18} className="text-terracotta" />
                  </div>
                  <div className="font-display text-[60px] leading-[.9] tracking-[-.02em]">{c.value}</div>
                  <div className="flex justify-between text-[13px] text-muted2 border-t border-line pt-3">
                    <span>{c.subtitle}</span><span className="font-mono text-ink">{c.subValue}</span>
                  </div>
                </div>
              );
            })
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-[26px] border-r border-b border-line bg-cream h-[180px] animate-pulse" />
            ))}
      </div>
    </div>
  );
};

export default Dashboard;
