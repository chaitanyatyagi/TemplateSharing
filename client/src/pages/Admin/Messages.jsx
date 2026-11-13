import { useEffect, useState, useCallback } from "react";
import { Mail, AlertCircle, RefreshCw } from "lucide-react";
import ContactService from "../../api/contact";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await ContactService.getAllContacts();
      if (res.status === "Success") setMessages(res.contacts || []);
      else setError(res.message || "Failed to load messages");
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-rise">
        <div>
          <div className="font-mono text-[12px] font-medium tracking-[.08em] text-muted2">CONTACT FORM</div>
          <h1 className="font-display text-[clamp(28px,4vw,42px)] leading-[.95] tracking-[-.02em] my-1.5 m-0">Messages</h1>
        </div>
        <div className="flex items-center gap-3">
          {!loading && <span className="font-mono text-[12px] text-muted2">{String(messages.length).padStart(2, "0")} total</span>}
          <button
            onClick={fetchMessages}
            className="h-10 px-4 rounded-full border border-ink flex items-center gap-2 text-sm font-medium hover:bg-ink hover:text-cream transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 p-3.5 rounded-[14px] bg-errBg border border-errBorder text-errText text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-err" />{error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-lg border border-line bg-paper animate-pulse" />)}
        </div>
      ) : messages.length === 0 && !error ? (
        <div className="mt-10 py-16 flex flex-col items-center text-center border-t border-b border-line">
          <div className="w-14 h-14 rounded-[18px] bg-creamAlt text-faint flex items-center justify-center mb-4 -rotate-6"><Mail size={26} /></div>
          <h3 className="font-display text-[24px] m-0">No messages yet</h3>
          <p className="text-muted2 text-sm mt-2 m-0">Contact-form submissions will show up here.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map((m) => (
            <div key={m._id} className="border border-ink rounded-lg bg-cream p-5 flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-[20px] leading-tight m-0 truncate">{m.name || "—"}</p>
                  <a href={`mailto:${m.email}`} className="text-terracotta text-sm break-all hover:underline">{m.email}</a>
                </div>
                <span className="font-mono text-[11px] text-muted2 whitespace-nowrap">{fmtDate(m.createdAt)}</span>
              </div>
              <p className="text-bodytext text-[15px] leading-relaxed whitespace-pre-wrap break-words m-0 border-t border-line pt-3">
                {m.comments}
              </p>
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to SmartTemp")}`}
                className="self-start h-9 px-4 rounded-full bg-ink text-cream text-sm font-semibold flex items-center gap-2 hover:bg-terracotta transition-colors"
              >
                <Mail size={15} /> Reply
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
