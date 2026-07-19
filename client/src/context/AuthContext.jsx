import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { admin } from "../api/admin";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          // Store token in localStorage (will be replaced with secure cookies later)
          localStorage.setItem("token", authUser.accessToken);
          localStorage.setItem("uid", authUser.uid);

          // Check if user is admin
          try {
            const response = await admin();
            setIsAdmin(response.status === "Success");
          } catch (adminError) {
            console.log("User is not an admin:", adminError);
            setIsAdmin(false);
          }

          // Get user profile from Firebase
          const userProfile = {
            uid: authUser.uid,
            email: authUser.email || "",
            displayName: authUser.displayName || "",
            phoneNumber: authUser.phoneNumber || "",
            photoURL: authUser.photoURL || "",
            emailVerified: authUser.emailVerified || false,
          };

          setUser(userProfile);
        } else {
          // User signed out
          localStorage.removeItem("token");
          localStorage.removeItem("uid");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        setError("Authentication failed. Please try again.");
        localStorage.removeItem("token");
        localStorage.removeItem("uid");
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle logout
  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      setUser(null);
      setIsAdmin(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (role === "admin") return isAdmin;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        error,
        isAuthenticated,
        hasRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
