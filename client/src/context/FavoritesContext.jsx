import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import FavoritesService from "../api/favorites";

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlistIds, setWishlistIds] = useState([]);
  const [savedBlogIds, setSavedBlogIds] = useState([]);

  // Load the user's favorites once authenticated; clear them on logout.
  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistIds([]);
      setSavedBlogIds([]);
      return;
    }
    try {
      const wishlist = await FavoritesService.getWishlist();
      if (wishlist.status === "Success") {
        setWishlistIds((wishlist.templates || []).map((t) => t._id));
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
    try {
      const saved = await FavoritesService.getSavedBlogs();
      if (saved.status === "Success") {
        setSavedBlogIds((saved.blogs || []).map((b) => b._id));
      }
    } catch (error) {
      console.error("Failed to load saved blogs:", error);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (id) => wishlistIds.includes(String(id)),
    [wishlistIds]
  );

  const isSaved = useCallback(
    (id) => savedBlogIds.includes(String(id)),
    [savedBlogIds]
  );

  const toggleWishlist = async (templateId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const id = String(templateId);
    const previous = wishlistIds;
    // Optimistic update
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    try {
      const res = await FavoritesService.toggleWishlist(id);
      if (res.status === "Success") {
        setWishlistIds(res.wishlist);
      } else {
        setWishlistIds(previous);
      }
    } catch (error) {
      console.error("Toggle wishlist failed:", error);
      setWishlistIds(previous);
    }
  };

  const toggleSaved = async (blogId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const id = String(blogId);
    const previous = savedBlogIds;
    // Optimistic update
    setSavedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    try {
      const res = await FavoritesService.toggleSavedBlog(id);
      if (res.status === "Success") {
        setSavedBlogIds(res.savedBlogs);
      } else {
        setSavedBlogIds(previous);
      }
    } catch (error) {
      console.error("Toggle saved blog failed:", error);
      setSavedBlogIds(previous);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        wishlistIds,
        savedBlogIds,
        isWishlisted,
        isSaved,
        toggleWishlist,
        toggleSaved,
        refresh,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
