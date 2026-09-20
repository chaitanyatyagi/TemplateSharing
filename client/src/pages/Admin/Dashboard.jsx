import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import Revenue from "../../assets/revenue.png";
import OrderIcon from "../../assets/order.png";
import Users from "../../assets/user.png";
import Templates from "../../assets/template.png";
import Blogs from "../../assets/blog.png";
import { getDashboardStats } from "../../api/admin";

const StatsCard = ({ item }) => (
  <div className="flex flex-col rounded-2xl border border-borderLight p-5 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
    <div className="flex flex-row justify-between items-start w-full">
      <div className="flex flex-col">
        <p className="text-textMuted text-xs font-semibold uppercase tracking-wide">{item.title}</p>
        <p className="text-textHeading text-2xl font-bold mt-1">{item.value}</p>
      </div>
      {item.icon && (
        <div className="w-11 h-11 rounded-xl bg-lightBlue flex items-center justify-center shrink-0">
          <img src={item.icon} alt={item.title} className="w-[24px] h-[24px]" />
        </div>
      )}
    </div>

    <div className="border-t border-borderLight my-4" />

    <div className="flex flex-row justify-between items-center w-full">
      <p className="text-textMuted text-sm">{item.subtitle}</p>
      <p className="text-textHeading text-sm font-semibold">{item.subValue}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError(null);
        const response = await getDashboardStats();
        if (response.status === "Success") {
          setStats(response.stats);
        } else {
          setError(response.message || "Failed to load dashboard stats");
        }
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError(err.message || "Failed to load dashboard stats");
      }
    };
    fetchStats();
  }, []);

  const statsData = stats
    ? [
        { title: "Total Revenue", value: `₹${stats.totalRevenue}`, subtitle: "This month", subValue: `₹${stats.monthlyRevenue}`, icon: Revenue },
        { title: "Total Orders", value: stats.totalOrders, subtitle: "This month", subValue: stats.monthlyOrders, icon: OrderIcon },
        { title: "Total Users", value: stats.totalUsers, subtitle: "This month", subValue: stats.monthlyUsers, icon: Users },
        { title: "Orders / Users", value: `${stats.ordersPerUserRatio}%`, subtitle: "Orders per registered user", subValue: "—" },
        { title: "Total Templates", value: stats.totalTemplates, subtitle: "This month", subValue: stats.monthlyTemplates, icon: Templates },
        { title: "Total Blogs", value: stats.totalBlogs, subtitle: "This month", subValue: stats.monthlyBlogs, icon: Blogs },
      ]
    : [];

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-textHeading">Dashboard</h1>
        <p className="text-textMuted mt-1">Welcome back, <b className="text-textDark">Amit</b> — here's what's happening with your marketplace.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-redAccent/10 text-redAccent rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {stats
          ? statsData.map((item, index) => <StatsCard key={index} item={item} />)
          : Array.from({ length: 6 }).map((_, idx) => (
              <div key={`loading-${idx}`} className="rounded-2xl border border-borderLight p-5 bg-white shadow-sm animate-pulse h-[140px]" />
            ))}
      </div>
    </div>
  );
};

export default Dashboard;
