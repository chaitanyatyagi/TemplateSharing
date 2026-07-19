import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { admin } from "../../api/admin";
import DashboardPage from "./Dashboard";
import OrderPage from "./Order";
import Template from "./Template";
import Blog from "./Blog";
import UserData from "./UserData";
import MainLogo from "../../assets/main-logo.png"
import Notification from "../../assets/notification.png"
import Dashboard from "../../assets/dashboard-white.svg"
import Orders from "../../assets/order-white.svg"
import UsersData from "../../assets/user-white.svg"
import Templates from "../../assets/template-white.svg"
import Blogs from "../../assets/blog-white.svg"
import DashboardGrey from "../../assets/dashboard-grey.svg"
import OrdersGrey from "../../assets/order-grey.svg"
import UsersDataGrey from "../../assets/user-grey.svg"
import TemplatesGrey from "../../assets/template-grey.svg"
import BlogsGrey from "../../assets/blog-grey.svg"

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Dashboard");
        const menuItems = [
        { name: "Dashboard", icon: Dashboard, iconGrey: DashboardGrey },
        { name: "Orders", icon: Orders, iconGrey: OrdersGrey },
        { name: "Users Data", icon: UsersData, iconGrey: UsersDataGrey },
        { name: "Templates", icon: Templates, iconGrey: TemplatesGrey },
        { name: "Blogs", icon: Blogs, iconGrey: BlogsGrey },
        ];
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        navigate("/");
        return;
      }

      try {
        const response = await admin();
        console.log("Admin response:", response);

        if (response.status !== "Success") {
          navigate("/login");
          return;
        }
        setLoading(false);
      } catch (error) {
        console.error("Admin check failed:", error);
        navigate("/login");
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [navigate, user, isAdmin, authLoading]);

  if (loading) return null;

  return (
    <div className="flex flex-col w-full h-screen bg-white">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center shadow-md px-4 sm:px-6 py-3">
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
            className="h-[30px] w-[180px] sm:h-[35px] sm:w-[230px]"
          />
        </div>

        <div className="flex flex-row gap-4 sm:gap-8 items-center">
          <p
            className="text-sm sm:text-md md:text-lg text-bluePrimary underline cursor-pointer"
            onClick={() => navigate("/")}
          >
            User Site
          </p>
          <img
            src={Notification}
            alt="Notification"
            className="h-[25px] w-[22px] sm:h-[30px] sm:w-[26px] md:h-[35px] md:w-[28px]"
          />
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="flex flex-row w-full h-full overflow-hidden">
        {/* SIDEBAR (visible on desktop, hidden on mobile) */}
        <div className="hidden md:flex flex-col w-[15vw] min-w-[200px] bg-darkBg gap-4 py-4">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-row p-3 mx-4 gap-3 items-center justify-start cursor-pointer rounded-lg transition-all duration-300 ${
                activeMenu === item.name
                  ? "bg-bluePrimary border-2 border-bluePrimary"
                  : "hover:bg-darkBgHover"
              }`}
              onClick={() => setActiveMenu(item.name)}
            >
              <img
                src={activeMenu === item.name ? item.icon : item.iconGrey}
                alt={item.name}
                className="w-[20px] h-[20px]"
              />
              <p
                className={`text-sm sm:text-md font-semi ${
                  activeMenu === item.name ? "text-white" : "text-grayLight"
                }`}
              >
                {item.name}
              </p>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex justify-start items-start w-full md:w-[85vw] p-2 sm:p-4 overflow-y-auto">
          {activeMenu === "Dashboard" && <DashboardPage />}
          {activeMenu === "Orders" && <OrderPage />}
          {activeMenu === "Users Data" && <UserData />}
          {activeMenu === "Templates" && <Template />}
          {activeMenu === "Blogs" && <Blog />}
        </div>
      </div>

      {/* MOBILE SIDEBAR (Overlay Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay background */}
          <div
            className="bg-black/50 flex-1"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Sidebar content */}
          <div className="bg-darkBg w-[80vw] sm:w-[60vw] p-4 flex flex-col gap-4 animate-slideIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white text-lg font-bold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex flex-row p-3 gap-3 items-center cursor-pointer rounded-lg transition-all duration-300 ${
                  activeMenu === item.name
                    ? "bg-bluePrimary border-2 border-bluePrimary"
                    : "hover:bg-darkBgHover"
                }`}
                onClick={() => {
                  setActiveMenu(item.name);
                  setSidebarOpen(false);
                }}
              >
                <img
                  src={activeMenu === item.name ? item.icon : item.iconGrey}
                  alt={item.name}
                  className="w-[20px] h-[20px]"
                />
                <p
                  className={`text-md font-semi ${
                    activeMenu === item.name ? "text-white" : "text-grayLight"
                  }`}
                >
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
