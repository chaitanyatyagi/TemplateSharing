import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { loading, isAuthenticated, hasRole, user } = useAuth();

  console.log("ProtectedRoute - loading:", loading);
  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - isAuthenticated:", isAuthenticated());

  if (loading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bluePrimary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    console.log("Redirecting to login - not authenticated");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect to home if user doesn't have required role
    console.log(`Redirecting to home - missing role: ${requiredRole}`);
    return <Navigate to="/" replace />;
  }

  console.log("Access granted to protected route");
  return children;
};

export default ProtectedRoute;
