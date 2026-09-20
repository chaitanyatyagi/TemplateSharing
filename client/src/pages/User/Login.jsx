import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase-config";
import { googleSignup } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import MainLogo from "../../assets/main-logo-user.png";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/profile");
    }
  }, [navigate, isAuthenticated]);

  const handleGoogleAuthClick = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await signInWithPopup(auth, googleProvider);
      console.log("Google sign-in successful:", data);

      const response = await googleSignup(data.user.email, data.user.displayName, data.user.uid);
      console.log("User registered successfully:", response);
      navigate("/profile");
    } catch (error) {
      console.error("Error during Google sign-up:", error);
      setError("Failed to sign in with Google. Please try again.");
      // Safe sign-out
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Navbar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <img
              src={MainLogo}
              alt="Main Logo"
              className="h-[40px] w-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-center">Sign in to access your account and continue your productivity journey</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleGoogleAuthClick}
              disabled={loading}
              className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                <path fill="#FBBC05" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c-1.724,1.32-3.873,2.028-6.232,2.028c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44c12.432,0,22.862-8.388,25.28-20.138C47.077,22.478,47.077,21.76,47.077,21.76c0-0.001,0-0.001,0-0.002C47.077,21.758,47.077,21.758,47.077,21.758z"/>
              </svg>
              <span className="font-medium">
                {loading ? "Signing in with Google..." : "Sign in with Google"}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
<task_progress>
- [x] Analyze existing code structure
- [x] Examine current login page implementation
- [x] Study navbar and footer components
- [x] Understand authentication setup
- [x] Design and implement new login page
- [x] Create Google icon asset
- [ ] Integrate Google authentication
- [ ] Test the implementation
</task_progress>
