import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Settings, LogOut, ShoppingBag, Bookmark, Heart, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../context/FavoritesContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Card from "../../components/blogCard";
import TemplateCard from "../../components/templateCard";
import ErrorState from "../../components/ErrorState";
import OrderService from "../../api/order";
import TemplateService from "../../api/template";
import FavoritesService from "../../api/favorites";
import { getProfile, updateProfile } from "../../api/auth";
import { getTemplateImageUrl, getServerAssetUrl } from "../../utils/assetUrl";

const STATUS_STYLES = {
  pending: "bg-warnBg text-warnText",
  completed: "bg-okBg text-successGreen",
  failed: "bg-errBg text-err",
};
// Inline note shown under non-downloadable rows (Error States design #08).
const STATUS_NOTE = {
  pending: "Payment pending — download unlocks once confirmed.",
  failed: "Payment failed — this order wasn't completed, so it can't be downloaded.",
};

const emptyEditForm = { name: "", contact: "", address: "", city: "", state: "", pincode: "" };
const initialsOf = (n) => (n || "You").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

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
  const [downloadError, setDownloadError] = useState(null); // { key, message }

  const [wishlistTemplates, setWishlistTemplates] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(true);

  const tabs = [
    { key: "purchasedItems", label: "Purchased", icon: ShoppingBag },
    { key: "savedBlogs", label: "Saved Blogs", icon: Bookmark },
    { key: "wishList", label: "Wishlist", icon: Heart },
  ];

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    else if (user) setLoading(false);
  }, [navigate, authLoading, user]);

  const fetchOrders = useCallback(() => {
    setOrdersLoading(true); setOrdersError(null);
    return OrderService.getOrdersByUser().then((res) => {
      if (res.status === "Success") setOrders(res.orders || []);
      else setOrdersError(res.message || "Failed to fetch orders");
    }).catch((e) => setOrdersError(e.message || "Failed to fetch orders")).finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    getProfile().then((res) => {
      if (res.status === "Success" && res.user) {
        setProfile(res.user);
        setEditForm({ name: res.user.name || "", contact: res.user.contact || "", address: res.user.address || "", city: res.user.city || "", state: res.user.state || "", pincode: res.user.pincode || "" });
      }
    }).catch((e) => console.error(e));
    fetchOrders();
  }, [user, fetchOrders]);

  useEffect(() => {
    if (!user) return;
    setWishlistLoading(true);
    FavoritesService.getWishlist().then((res) => { if (res.status === "Success") setWishlistTemplates(res.templates || []); })
      .catch((e) => console.error(e)).finally(() => setWishlistLoading(false));
  }, [user, wishlistIds]);

  useEffect(() => {
    if (!user) return;
    setSavedLoading(true);
    FavoritesService.getSavedBlogs().then((res) => { if (res.status === "Success") setSavedBlogs(res.blogs || []); })
      .catch((e) => console.error(e)).finally(() => setSavedLoading(false));
  }, [user, savedBlogIds]);

  const handleLogout = async () => { try { await authLogout(); } catch (e) { console.log(e); } };
  const handleEditChange = (e) => setEditForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleDownload = async (rowKey, templateId, templateName) => {
    try {
      setDownloadError(null); setDownloadingId(rowKey);
      const res = await TemplateService.downloadTemplate(templateId, templateName);
      if (res?.type === "link" && res.link) window.open(res.link, "_blank", "noopener,noreferrer");
    } catch (err) {
      setDownloadError({ key: rowKey, message: err.message || "Download failed — please try again." });
    }
    finally { setDownloadingId(null); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true); setProfileError(null);
      const res = await updateProfile(editForm);
      if (res.status === "Success" && res.user) { setProfile(res.user); setEditing(false); }
      else setProfileError(res.message || "Failed to update profile");
    } catch (err) { setProfileError(err.message || "Failed to update profile"); }
    finally { setSavingProfile(false); }
  };

  const purchasedItems = orders.flatMap((order) =>
    (order.items || []).map((item, idx) => ({ key: `${order._id}-${idx}`, ...item, orderStatus: order.orderStatus, orderDate: order.createdAt || order.orderDate }))
  );
  const countFor = { purchasedItems: purchasedItems.length, savedBlogs: savedBlogs.length, wishList: wishlistTemplates.length };
  const tabTitle = menu === "purchasedItems" ? "Purchased Items" : menu === "savedBlogs" ? "Saved Blogs" : "Wishlist";

  if (loading) return null;
  const input = "h-11 border-0 border-b border-ink bg-transparent text-[16px] outline-none focus:border-terracotta transition-colors placeholder-faint";

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <div className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-[72px] pb-16 md:pb-28">
        {/* Header */}
        <div className="flex flex-wrap gap-6 items-center justify-between border-b border-ink pb-8 animate-rise">
          <div className="flex gap-6 items-center min-w-0">
            <div className="w-24 h-24 rounded-full bg-terracotta text-cream flex items-center justify-center font-display font-bold tracking-[-.025em] text-[40px] shrink-0">
              {initialsOf(profile?.name || user?.displayName || user?.email)}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[clamp(28px,3.6vw,42px)] leading-none m-0">{profile?.name || user?.displayName || "Your profile"}</h1>
              <div className="flex flex-wrap gap-2.5 items-center mt-2">
                <span className="text-[15px] text-muted2">{user?.email || user?.phoneNumber || "—"}</span>
                <span className="font-mono text-[11px] font-medium tracking-[.08em] border border-terracotta text-terracotta px-2.5 py-0.5 rounded-full">
                  {profile?.role === "admin" ? "ADMIN" : "MEMBER"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2.5">
            {isAdmin && (
              <button onClick={() => navigate("/admin")} className="h-[46px] px-5 rounded-full border border-ink font-semibold text-sm hover:bg-ink hover:text-cream transition-colors">Admin Panel</button>
            )}
            <button onClick={() => setEditing((p) => !p)} className="h-[46px] px-5 rounded-full bg-ink text-cream font-semibold text-sm flex gap-2 items-center hover:bg-terracotta transition-colors">
              <Settings size={16} /> {editing ? "Close" : "Edit"}
            </button>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleSaveProfile} className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-8 gap-y-5 py-8 border-b border-line animate-fadeIn">
            {profileError && <div className="col-span-full flex items-start gap-2 p-3.5 rounded-[14px] bg-errBg border border-errBorder text-errText text-sm"><AlertCircle size={16} className="shrink-0 mt-0.5 text-err" />{profileError}</div>}
            <input type="text" name="name" placeholder="Full name" value={editForm.name} onChange={handleEditChange} className={input} />
            <input type="tel" name="contact" placeholder="Phone number" value={editForm.contact} onChange={handleEditChange} className={input} />
            <input type="text" name="address" placeholder="Address" value={editForm.address} onChange={handleEditChange} className={input} />
            <input type="text" name="city" placeholder="City" value={editForm.city} onChange={handleEditChange} className={input} />
            <input type="text" name="state" placeholder="State" value={editForm.state} onChange={handleEditChange} className={input} />
            <input type="text" name="pincode" placeholder="Pincode" value={editForm.pincode} onChange={handleEditChange} className={input} />
            <button type="submit" disabled={savingProfile} className="h-[50px] rounded-full bg-terracotta text-paper font-semibold hover:bg-ink transition-colors disabled:opacity-50">
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-x-7 items-center border-b border-line my-6 md:my-8">
          {tabs.map((t) => {
            const active = menu === t.key;
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setMenu(t.key)}
                className={`h-14 flex gap-2.5 items-center font-medium text-[15px] border-b-2 transition-colors ${active ? "text-ink border-terracotta" : "text-muted2 border-transparent hover:text-ink"}`}>
                <Icon size={17} /> {t.label}
                {countFor[t.key] > 0 && <span className="font-mono text-[11px] text-muted2">({countFor[t.key]})</span>}
              </button>
            );
          })}
          <button onClick={handleLogout} className="ml-auto h-14 flex gap-2.5 items-center font-medium text-[15px] text-muted2 hover:text-likeRed transition-colors"><LogOut size={17} /> Logout</button>
        </div>

        <h2 className="font-display text-[27px] mb-6 m-0">{tabTitle}</h2>

        {/* Purchased */}
        {menu === "purchasedItems" && (
          ordersLoading ? <p className="text-muted2 py-10">Loading your orders…</p>
          : ordersError ? (
            <ErrorState
              title="We couldn't load your orders"
              message="The server didn't respond. Check your connection and try again."
              onRetry={fetchOrders}
              secondaryLabel="Back to home"
              onSecondary={() => navigate("/")}
            />
          )
          : purchasedItems.length === 0 ? (
            <div className="py-12 text-center text-muted2">You haven't purchased any templates yet.<br />
              <button onClick={() => navigate("/templates")} className="mt-3.5 h-[46px] px-5 rounded-full bg-ink text-cream font-semibold text-sm">Browse Templates</button>
            </div>
          ) : (
            <div className="border-t border-ink">
              {purchasedItems.map((item) => {
                const completed = item.orderStatus === "completed";
                const rowErr = downloadError && downloadError.key === item.key ? downloadError.message : null;
                return (
                  <div key={item.key} className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-x-6 gap-y-3 items-center py-5 border-b border-line">
                    <div className="col-span-2 min-w-0">
                      <p onClick={() => navigate(`/templates/${item.templateId}`)} className="font-display text-[24px] leading-[1.15] cursor-pointer hover:text-terracotta transition-colors m-0">{item.templateName}</p>
                      <p className="font-mono text-[12px] text-muted2 mt-1 m-0">{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : ""}</p>
                      {rowErr ? (
                        <p className="flex items-center gap-1.5 text-[13px] text-err mt-2 m-0"><AlertCircle size={14} className="shrink-0" /> {rowErr}</p>
                      ) : !completed && STATUS_NOTE[item.orderStatus] ? (
                        <p className={`flex items-center gap-1.5 text-[13px] mt-2 m-0 ${item.orderStatus === "failed" ? "text-err" : "text-warnText"}`}>
                          <AlertCircle size={14} className="shrink-0" /> {STATUS_NOTE[item.orderStatus]}
                        </p>
                      ) : null}
                    </div>
                    <span className={`justify-self-start font-mono text-[11px] font-medium tracking-[.06em] uppercase px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[item.orderStatus] || "bg-creamAlt text-muted2"}`}>{item.orderStatus}</span>
                    <span className="font-display text-[26px]">₹{item.price * item.quantity}</span>
                    {completed ? (
                      <button onClick={() => handleDownload(item.key, item.templateId, item.templateName)} disabled={downloadingId === item.key}
                        className={`h-11 px-[18px] rounded-full flex gap-2 items-center justify-center font-semibold text-sm transition-colors disabled:opacity-50 ${rowErr ? "border border-err text-err hover:bg-err hover:text-cream" : "border border-ink hover:bg-ink hover:text-cream"}`}>
                        {rowErr ? <RefreshCw size={16} /> : <Download size={16} />} {downloadingId === item.key ? "Preparing…" : rowErr ? "Retry" : "Download"}
                      </button>
                    ) : (
                      <button disabled title="Available after a successful purchase"
                        className="h-11 px-[18px] rounded-full border border-line text-faint flex gap-2 items-center justify-center font-semibold text-sm cursor-not-allowed">
                        <Lock size={15} /> Download
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Saved blogs */}
        {menu === "savedBlogs" && (
          savedLoading ? <p className="text-muted2 py-10">Loading your saved blogs…</p>
          : savedBlogs.length === 0 ? (
            <div className="py-12 text-center text-muted2">You haven't saved any blogs yet.<br />
              <button onClick={() => navigate("/blogs")} className="mt-3.5 h-[46px] px-5 rounded-full bg-ink text-cream font-semibold text-sm">Browse Blogs</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10">
              {savedBlogs.map((b) => (
                <Card key={b._id} id={b._id} title={b.name} description={(b.content || "").replace(/<[^>]+>/g, " ").slice(0, 100)} category={b.type}
                  likesCount={b.likesCount || 0} isLiked={b.likedByMe || false} imageUrl={getServerAssetUrl(b.imageUrl)} useOptimizedLoading={false} />
              ))}
            </div>
          )
        )}

        {/* Wishlist */}
        {menu === "wishList" && (
          wishlistLoading ? <p className="text-muted2 py-10">Loading your wishlist…</p>
          : wishlistTemplates.length === 0 ? (
            <div className="py-12 text-center text-muted2">Your wishlist is empty.<br />
              <button onClick={() => navigate("/templates")} className="mt-3.5 h-[46px] px-5 rounded-full bg-ink text-cream font-semibold text-sm">Browse Templates</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-12">
              {wishlistTemplates.map((t) => (
                <TemplateCard key={t._id} id={t._id} image={getTemplateImageUrl(t.card_image)} title={t.name}
                  description={t.card_content} category={t.template_category} price={t.template_type === "free" ? 0 : t.price} />
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
