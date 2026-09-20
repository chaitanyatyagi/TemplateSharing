import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import Navbar from "../../components/Navbar";
import ProfileAvatar from "../../utils/ProfileAvatar";
import Card from "../../components/blogCard";
import TemplateCard from "../../components/templateCard";
import Setting from "../../assets/setting.png";
import PurchasedItems from "../../assets/purchased-items.png";
import SavedBlogs from "../../assets/saved-blogs.png";
import WishList from "../../assets/wish-list.png";
import LogoutIcon from "../../assets/logout-icon.png";
import Footer from "../../components/Footer";
import OrderService from "../../api/order";
import TemplateService from "../../api/template";
import FavoritesService from "../../api/favorites";
import { Download } from "lucide-react";
import { getProfile, updateProfile } from "../../api/auth";
import { getTemplateImageUrl, getServerAssetUrl } from "../../utils/assetUrl";

const STATUS_STYLES = {
  pending: "bg-amberAccent/10 text-amberAccent",
  completed: "bg-greenAccent/10 text-greenAccent",
  failed: "bg-redAccent/10 text-redAccent",
};

const emptyEditForm = {
  name: "",
  contact: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const Profile = () => {
  const { user, isAdmin, logout: authLogout, loading: authLoading } = useAuth();
  const { wishlistIds, savedBlogIds } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState("purchasedItems");
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const [wishlistTemplates, setWishlistTemplates] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const menuItems = [
    { key: "purchasedItems", label: "Purchased Items", icon: PurchasedItems },
    { key: "savedBlogs", label: "Saved Blogs", icon: SavedBlogs },
    { key: "wishList", label: "Wish list", icon: WishList },
  ];

  // Check auth once
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    } else if (user) {
      setLoading(false);
    }
  }, [navigate, authLoading, user]);

  // Fetch profile + orders once authenticated
  useEffect(() => {
    if (!user) return;

    getProfile()
      .then((response) => {
        if (response.status === "Success" && response.user) {
          setProfile(response.user);
          setEditForm({
            name: response.user.name || "",
            contact: response.user.contact || "",
            address: response.user.address || "",
            city: response.user.city || "",
            state: response.user.state || "",
            pincode: response.user.pincode || "",
          });
        }
      })
      .catch((err) => console.error("Error fetching profile:", err));

    setOrdersLoading(true);
    OrderService.getOrdersByUser()
      .then((response) => {
        if (response.status === "Success") {
          setOrders(response.orders || []);
        } else {
          setOrdersError(response.message || "Failed to fetch orders");
        }
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setOrdersError(err.message || "Failed to fetch orders");
      })
      .finally(() => setOrdersLoading(false));
  }, [user]);

  // Fetch wishlist templates; re-fetch when the wishlist changes (e.g. un-hearted here)
  useEffect(() => {
    if (!user) return;
    setWishlistLoading(true);
    FavoritesService.getWishlist()
      .then((response) => {
        if (response.status === "Success") setWishlistTemplates(response.templates || []);
      })
      .catch((err) => console.error("Error fetching wishlist:", err))
      .finally(() => setWishlistLoading(false));
  }, [user, wishlistIds]);

  // Fetch saved blogs; re-fetch when the saved set changes
  useEffect(() => {
    if (!user) return;
    setSavedLoading(true);
    FavoritesService.getSavedBlogs()
      .then((response) => {
        if (response.status === "Success") setSavedBlogs(response.blogs || []);
      })
      .catch((err) => console.error("Error fetching saved blogs:", err))
      .finally(() => setSavedLoading(false));
  }, [user, savedBlogIds]);

  const handleLogout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDownload = async (templateId, templateName) => {
    try {
      setDownloadError(null);
      setDownloadingId(templateId);
      const result = await TemplateService.downloadTemplate(templateId, templateName);
      if (result?.type === "link" && result.link) {
        window.open(result.link, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Download error:", err);
      setDownloadError(err.message || "Failed to download template");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileError(null);
      const response = await updateProfile(editForm);
      if (response.status === "Success" && response.user) {
        setProfile(response.user);
        setEditing(false);
      } else {
        setProfileError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Flatten orders into purchased line items
  const purchasedItems = orders.flatMap((order) =>
    (order.items || []).map((item, idx) => ({
      key: `${order._id}-${idx}`,
      ...item,
      orderStatus: order.orderStatus,
      orderDate: order.createdAt || order.orderDate,
    }))
  );

  const countFor = {
    purchasedItems: purchasedItems.length,
    savedBlogs: savedBlogs.length,
    wishList: wishlistTemplates.length,
  };

  if (loading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex flex-col w-full min-h-[73vh] bg-background items-center">
        {/* Profile Header */}
        <div className="w-[90%] sm:w-[85%] flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-white rounded-2xl mt-4">
          <div className="flex flex-row gap-4 justify-start items-center w-full sm:w-auto">
            <ProfileAvatar height="90ox" smHeight="90px" width="90px" smWidth="90px" name={user?.displayName || profile?.name || "User"} text="20px" smText="20px" />
            <div className="flex flex-col justify-center items-start">
              <p className="font-inter text-[22px] sm:text-[25px] font-semibold text-textDark">
                {profile?.name || user?.displayName || "User"}
              </p>
              <p className="font-inter text-sm sm:text-md text-grayLight">
                {user?.email || user?.phoneNumber || "No email/phone"}
              </p>
              <div className="font-inter text-xs sm:text-sm px-2 py-1 mt-1 text-bluePrimary bg-lightBlue rounded-2xl">
                {profile?.role === "admin" ? "Admin" : "Basic Member"}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 mt-3 sm:mt-0">
            {isAdmin && (
              <div
                className="flex flex-row h-[35px] px-3 gap-2 items-center justify-center border border-bluePrimary rounded-xl cursor-pointer"
                onClick={() => navigate("/admin")}
              >
                <p className="text-bluePrimary text-sm sm:text-md font-inter">Admin Panel</p>
              </div>
            )}
            <div
              className="flex flex-row w-[100px] h-[35px] gap-2 items-center justify-center bg-bluePrimary rounded-lg cursor-pointer"
              onClick={() => setEditing((prev) => !prev)}
            >
              <img src={Setting} alt="Settings" className="w-[20px] h-[20px]" />
              <p className="text-white text-sm sm:text-md font-inter">{editing ? "Close" : "Edit"}</p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="w-[90%] sm:w-[85%] bg-white rounded-2xl mt-4 p-4">
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profileError && (
                <div className="sm:col-span-2 p-3 bg-redAccent/10 text-redAccent rounded-xl text-sm">
                  {profileError}
                </div>
              )}
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={editForm.name}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <input
                type="tel"
                name="contact"
                placeholder="Phone number"
                value={editForm.contact}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editForm.address}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary sm:col-span-2"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={editForm.city}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={editForm.state}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={editForm.pincode}
                onChange={handleEditChange}
                className="border border-borderLight rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              />
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-bluePrimary text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blueHover transition disabled:opacity-50 sm:col-span-2"
              >
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>
        )}

        {/* Sidebar + Content */}
        <div className="w-[90%] sm:w-[85%] flex flex-col lg:flex-row mt-6 gap-6 font-inter">
          {/* Sidebar */}
          <div className="flex flex-row lg:flex-col gap-3 p-3 w-full lg:w-[20%] bg-white rounded-xl shadow-sm overflow-x-auto lg:overflow-visible">
            {menuItems.map((item) => (
              <div
                key={item.key}
                onClick={() => setMenu(item.key)}
                className={`flex flex-row justify-between items-center p-2.5 rounded-xl cursor-pointer transition-all duration-200 min-w-[120px] lg:min-w-0 ${menu === item.key
                    ? "bg-lightBlue text-bluePrimary font-semibold"
                    : "bg-white text-textDark hover:bg-background"
                  }`}
              >
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={item.icon}
                    alt={item.label}
                    className={`w-5 h-5 ${menu === item.key ? "filter-blue" : "opacity-70"
                      }`}
                  />
                  <p className="text-sm whitespace-nowrap">{item.label}</p>
                </div>
                {countFor[item.key] > 0 && (
                  <div
                    className={`text-sm font-semibold px-2 py-0.5 rounded-full ${menu === item.key
                        ? "bg-bluePrimary text-white"
                        : "bg-background text-bluePrimary"
                      }`}
                  >
                    {countFor[item.key]}
                  </div>
                )}
              </div>
            ))}

            <div
              className="flex flex-row justify-between items-center p-2.5 rounded-xl cursor-pointer transition-all duration-200 bg-white text-textDark hover:bg-background"
              onClick={handleLogout}
            >
              <div className="flex flex-row items-center gap-2">
                <img src={LogoutIcon} className="w-5 h-5 opacity-70" alt="Logout" />
                <p className="text-sm whitespace-nowrap">Logout</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white w-full lg:w-[80%] flex flex-col rounded-xl shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between p-3 gap-3 sm:gap-4 items-start sm:items-center">
              <div className="text-lg font-bold text-textDark">
                {menu === "purchasedItems"
                  ? "Purchased Items"
                  : menu === "savedBlogs"
                    ? "Saved Blogs"
                    : "Wish List"}
              </div>
            </div>

            {/* Download error */}
            {menu === "purchasedItems" && downloadError && (
              <div className="mx-4 mt-1 p-3 bg-redAccent/10 text-redAccent rounded-md text-sm">
                {downloadError}
              </div>
            )}

            {/* Cards */}
            <div className="rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto">
              {menu === "purchasedItems" ? (
                ordersLoading ? (
                  <p className="text-grayLight text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    Loading your orders...
                  </p>
                ) : ordersError ? (
                  <p className="text-redAccent text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    {ordersError}
                  </p>
                ) : purchasedItems.length === 0 ? (
                  <div className="text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    <p className="text-grayLight mb-3">You haven't purchased any templates yet.</p>
                    <button
                      onClick={() => navigate("/templates")}
                      className="px-4 py-2 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition text-sm"
                    >
                      Browse Templates
                    </button>
                  </div>
                ) : (
                  purchasedItems.map((item) => (
                    <div
                      key={item.key}
                      className="border rounded-xl p-4 bg-white flex flex-col gap-2"
                    >
                      <div
                        className="flex justify-between items-start gap-2 cursor-pointer"
                        onClick={() => navigate(`/templates/${item.templateId}`)}
                      >
                        <p className="font-semibold text-textDark hover:text-bluePrimary transition">{item.templateName}</p>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[item.orderStatus] || "bg-background text-textMuted"}`}
                        >
                          {item.orderStatus}
                        </span>
                      </div>
                      <p className="text-sm text-grayLight">Qty: {item.quantity}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-grayLight">
                          {item.orderDate ? new Date(item.orderDate).toLocaleDateString() : ""}
                        </span>
                        <span className="font-bold text-bluePrimary">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(item.templateId, item.templateName)}
                        disabled={downloadingId === item.templateId}
                        className="mt-2 flex items-center justify-center gap-2 w-full bg-bluePrimary text-white rounded-md px-3 py-2 text-sm font-semibold hover:bg-blueHover transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download size={16} />
                        {downloadingId === item.templateId ? "Preparing..." : "Download"}
                      </button>
                    </div>
                  ))
                )
              ) : menu === "wishList" ? (
                wishlistLoading ? (
                  <p className="text-grayLight text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    Loading your wishlist...
                  </p>
                ) : wishlistTemplates.length === 0 ? (
                  <div className="text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    <p className="text-grayLight mb-3">Your wishlist is empty.</p>
                    <button
                      onClick={() => navigate("/templates")}
                      className="px-4 py-2 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition text-sm"
                    >
                      Browse Templates
                    </button>
                  </div>
                ) : (
                  wishlistTemplates.map((template) => (
                    <TemplateCard
                      key={template._id}
                      id={template._id}
                      image={getTemplateImageUrl(template.card_image)}
                      title={template.name}
                      description={template.card_content}
                      category={template.template_category}
                      price={template.price}
                    />
                  ))
                )
              ) : (
                savedLoading ? (
                  <p className="text-grayLight text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    Loading your saved blogs...
                  </p>
                ) : savedBlogs.length === 0 ? (
                  <div className="text-center w-full py-10 sm:col-span-2 xl:col-span-3">
                    <p className="text-grayLight mb-3">You haven't saved any blogs yet.</p>
                    <button
                      onClick={() => navigate("/blogs")}
                      className="px-4 py-2 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition text-sm"
                    >
                      Browse Blogs
                    </button>
                  </div>
                ) : (
                  savedBlogs.map((blog) => (
                    <Card
                      key={blog._id}
                      id={blog._id}
                      title={blog.name}
                      description={(blog.content || "").substring(0, 100) + "..."}
                      category={blog.type}
                      imageUrl={getServerAssetUrl(blog.imageUrl)}
                      useOptimizedLoading={true}
                    />
                  ))
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
