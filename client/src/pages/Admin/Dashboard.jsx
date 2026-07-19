import { useEffect, useState } from "react";
import Revenue from "../../assets/revenue.png";
import OrderIcon from "../../assets/order.png";
import Users from "../../assets/user.png";
import Templates from "../../assets/template.png";
import Blogs from "../../assets/blog.png";
import { getDashboardStats } from "../../api/admin";

const StatsCard = ({ item }) => (
  <div className="flex flex-col border-2 border-border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex flex-row justify-between items-center w-full mb-2">
      <div className="flex flex-col">
        <p className="text-border text-sm font-inter">{item.title}</p>
        <p className="text-textDark text-xl font-semi font-inter">{item.value}</p>
      </div>
      {item.icon && (
        <img src={item.icon} alt={item.title} className="w-[40px] h-[40px]" />
      )}
    </div>

    <div className="border-b-2 border-border my-2"></div>

    <div className="flex flex-row justify-between items-start w-full">
      <div className="flex flex-col">
        <p className="text-border text-sm font-inter">{item.subtitle}</p>
        <p className="text-textDark text-xl font-semi font-inter">{item.subValue}</p>
      </div>
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
        {
          title: "Total Revenue",
          value: `Rs ${stats.totalRevenue}`,
          subtitle: "Monthly Revenue",
          subValue: `Rs ${stats.monthlyRevenue}`,
          icon: Revenue,
        },
        {
          title: "Total Orders",
          value: stats.totalOrders,
          subtitle: "Monthly Orders",
          subValue: stats.monthlyOrders,
          icon: OrderIcon,
        },
        {
          title: "Total Users",
          value: stats.totalUsers,
          subtitle: "Monthly Users",
          subValue: stats.monthlyUsers,
          icon: Users,
        },
        {
          title: "Orders / Users",
          value: `${stats.ordersPerUserRatio}%`,
          subtitle: "Ratio of orders to registered users",
          subValue: "—",
        },
        {
          title: "Total Templates",
          value: stats.totalTemplates,
          subtitle: "Monthly Templates",
          subValue: stats.monthlyTemplates,
          icon: Templates,
        },
        {
          title: "Total Blogs",
          value: stats.totalBlogs,
          subtitle: "Monthly Blogs",
          subValue: stats.monthlyBlogs,
          icon: Blogs,
        },
      ]
    : [];

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
      <p className="text-grayDark text-md sm:text-lg font-inter mb-6">
        Welcome back, <b>Amit!</b> Here's what's happening with your marketplace.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {stats ? (
          statsData.map((item, index) => <StatsCard key={index} item={item} />)
        ) : (
          Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`loading-${idx}`}
              className="border-2 border-border rounded-md p-4 bg-white shadow-sm animate-pulse h-[130px]"
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
