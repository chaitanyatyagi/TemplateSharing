import { useState } from "react";
import NewsletterService from "../api/newsletter";

// Shared newsletter signup. `variant` switches styling between the dark home
// section ("home") and the footer column ("footer"). Logic is identical.
const NewsletterForm = ({ variant = "footer" }) => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const subscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setState("error"); setMessage("Please enter your email."); return; }
    try {
      setState("loading"); setMessage("");
      const res = await NewsletterService.subscribe(email.trim());
      if (res.status === "Success") {
        setState("success"); setMessage(res.message || "You're subscribed!"); setEmail("");
      } else {
        setState("error"); setMessage(res.message || "Subscription failed.");
      }
    } catch (err) {
      setState("error"); setMessage(err.message || "Subscription failed. Please try again.");
    }
  };

  const onChange = (e) => {
    setEmail(e.target.value);
    if (state !== "loading") { setState("idle"); setMessage(""); }
  };

  if (variant === "home") {
    return (
      <div className="flex-1 basis-[360px]">
        <form onSubmit={subscribe} className="flex flex-wrap gap-3 items-stretch">
          <input
            type="email"
            value={email}
            onChange={onChange}
            disabled={state === "loading"}
            placeholder="Enter your email"
            className="flex-1 basis-[220px] h-14 bg-transparent border-b border-muted2 text-cream placeholder-faint text-[18px] outline-none focus:border-terracottaLight transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="h-14 px-7 rounded-full bg-cream text-ink font-semibold text-[15px] hover:bg-terracotta hover:text-paper active:scale-[.97] transition-all disabled:opacity-60"
          >
            {state === "loading" ? "Joining…" : "Subscribe"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-[14px] ${state === "error" ? "text-[#F7B2A8]" : "text-terracottaLight"}`}>{message}</p>
        )}
      </div>
    );
  }

  // Footer variant
  return (
    <div>
      <div className="font-sans text-[11px] font-medium tracking-[.1em] text-faint mb-4">STAY IN THE LOOP</div>
      <p className="text-sm text-[#B9C1DA] mb-3.5">Fresh templates and guides in your inbox. No spam.</p>
      <form className="flex gap-2 border-b border-inkSoft" onSubmit={subscribe}>
        <input
          type="email"
          value={email}
          onChange={onChange}
          disabled={state === "loading"}
          placeholder="Enter your email"
          className="flex-1 min-w-0 h-12 bg-transparent text-cream placeholder-faint outline-none text-[15px] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="text-gold font-semibold text-sm hover:text-cream transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {state === "loading" ? "Joining…" : "Subscribe →"}
        </button>
      </form>
      {message && (
        <p className={`mt-2.5 text-[13px] ${state === "error" ? "text-[#F7B2A8]" : "text-gold"}`}>{message}</p>
      )}
    </div>
  );
};

export default NewsletterForm;
