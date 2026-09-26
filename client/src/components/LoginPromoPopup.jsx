import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Gift } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const DELAY_MS = 10000;
const DISMISS_KEY = "freeTemplatePromoDismissed";
const HIDDEN_PREFIXES = ["/login", "/admin"];

const LoginPromoPopup = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (loading || user) return;
    if (HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))) return;
    try { if (sessionStorage.getItem(DISMISS_KEY)) return; } catch { /* ignore */ }
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [user, loading, location.pathname]);

  const dismiss = () => {
    setOpen(false);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
  };
  const go = () => { dismiss(); navigate("/login"); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={dismiss} />
      <div className="relative w-full max-w-md bg-cream border border-ink shadow-[12px_12px_0_#B4532A] animate-rise">
        <button onClick={dismiss} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-muted2 hover:text-ink transition-colors">
          <X size={20} />
        </button>
        <div className="p-8 sm:p-10 text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full border border-ink flex items-center justify-center">
            <Gift size={26} className="text-terracotta" />
          </div>
          <div className="font-mono text-[12px] font-medium tracking-[.1em] uppercase text-terracotta">Free for members</div>
          <h3 className="font-display text-[clamp(34px,5vw,48px)] leading-none text-ink m-0">Get a free template</h3>
          <p className="text-bodytext text-[15px] max-w-[340px] m-0">
            Sign up in seconds and claim a free premium template — plus new drops, guides and productivity tips.
          </p>
          <button onClick={go} className="mt-2 w-full h-14 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta active:scale-[.98] transition-all">
            Sign up / Log in &amp; claim it
          </button>
          <button onClick={dismiss} className="text-muted2 text-sm hover:text-ink transition-colors">Maybe later</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromoPopup;
