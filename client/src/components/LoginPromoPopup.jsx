import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// Shows a login/signup CTA to guests after they've been on the site for 10s,
// promising a free template. Never shown to logged-in users, and only once per
// browser session (dismissal remembered in sessionStorage).
const DELAY_MS = 10000;
const DISMISS_KEY = "freeTemplatePromoDismissed";
const HIDDEN_PREFIXES = ["/login", "/admin"];

const LoginPromoPopup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return; // wait for auth check; never for logged-in users
    if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return;
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // sessionStorage unavailable — just proceed
    }
    const timer = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, loading, location.pathname]);

  const dismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  const goToLogin = () => {
    dismiss();
    navigate("/login");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={dismiss} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 text-grayLight hover:text-textHeading transition"
        >
          <X size={20} />
        </button>

        <div className="bg-darkBg px-6 py-8 text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-bluePrimary/20 flex items-center justify-center">
            <Gift size={28} className="text-lightBlue" />
          </div>
          <h3 className="text-white text-xl sm:text-2xl font-bold">
            Get a free template 🎁
          </h3>
          <p className="text-white/70 text-sm mt-2">
            Sign up in seconds and claim a free premium template — plus new drops,
            guides and productivity tips.
          </p>
        </div>

        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={goToLogin}
            className="w-full bg-bluePrimary text-white py-3 rounded-lg font-semibold hover:bg-blueHover transition"
          >
            Sign up / Log in &amp; claim it
          </button>
          <button
            onClick={dismiss}
            className="w-full text-textMuted text-sm py-1 hover:text-textHeading transition"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromoPopup;
