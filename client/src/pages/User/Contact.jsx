import { useState } from "react";
import { Mail, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ContactImage from "../../assets/contact-page.png";
import ContactService from "../../api/contact";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", comments: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError(null); setSuccess(null);
      const res = await ContactService.createContact(form.name, form.email, form.comments);
      if (res.status === "Success") { setSuccess(res.message || "Thanks — we'll be in touch soon."); setForm({ name: "", email: "", comments: "" }); }
      else setError(res.message || "Failed to send message");
    } catch (err) { setError(err.message || "Failed to send message"); }
    finally { setLoading(false); }
  };

  const input = "h-11 border-0 border-b border-ink bg-transparent text-[16px] outline-none focus:border-terracotta transition-colors placeholder-faint";

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />
      <section className="flex-1 max-w-[1320px] w-full mx-auto px-5 sm:px-8 lg:px-12 pt-10 md:pt-20 pb-16 md:pb-28 flex flex-wrap gap-10 md:gap-24">
        {/* Left */}
        <div className="flex-1 min-w-0 basis-[440px] flex flex-col gap-6 animate-rise">
          <div className="flex items-center gap-3 font-mono text-[12px] font-medium tracking-[.08em] text-muted2">
            <span className="w-9 h-px bg-ink" />WE'D LOVE TO HEAR FROM YOU
          </div>
          <h1 className="font-display text-[clamp(60px,8vw,120px)] leading-[.9] tracking-[-.02em] m-0">Contact <em className="text-terracotta">us</em></h1>
          <p className="max-w-[440px] text-[18px] text-bodytext m-0">Questions, feedback or a custom request? Send us a message and we'll get back to you.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="border border-line p-5 flex items-start gap-3 bg-paper">
              <Mail size={18} className="text-terracotta mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink text-sm m-0">Email us</p>
                <p className="text-muted2 text-sm mt-0.5 m-0">We reply to every message.</p>
              </div>
            </div>
            <div className="border border-line p-5 flex items-start gap-3 bg-paper">
              <MessageSquare size={18} className="text-terracotta mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-ink text-sm m-0">Custom requests</p>
                <p className="text-muted2 text-sm mt-0.5 m-0">Need a bespoke template? Ask us.</p>
              </div>
            </div>
          </div>
          <img src={ContactImage} alt="Contact us" className="w-full max-w-md mt-2 border border-line" />
        </div>

        {/* Form */}
        <div className="flex-1 min-w-0 basis-[420px] bg-paper border border-ink p-6 sm:p-8 flex flex-col gap-5 [animation:rise_.8s_.1s_both]">
          <h2 className="font-display text-[32px] m-0">Send us a message</h2>
          {success && <div className="flex items-start gap-2 p-3 border border-successGreen text-successGreen text-sm"><CheckCircle2 size={18} className="shrink-0 mt-0.5" />{success}</div>}
          {error && <div className="flex items-start gap-2 p-3 bg-[#F4DEDA] text-likeRed text-sm"><AlertCircle size={18} className="shrink-0 mt-0.5" />{error}</div>}
          <form onSubmit={submit} className="flex flex-col gap-6">
            <input type="text" name="name" placeholder="Your name" value={form.name} onChange={change} className={input} required />
            <input type="email" name="email" placeholder="Email address" value={form.email} onChange={change} className={input} required />
            <textarea name="comments" placeholder="How can we help?" rows="5" value={form.comments} onChange={change}
              className="border-0 border-b border-ink bg-transparent text-[16px] outline-none focus:border-terracotta transition-colors resize-none placeholder-faint pb-2" required />
            <button type="submit" disabled={loading} className="self-start h-14 px-7 rounded-full bg-ink text-cream font-semibold hover:bg-terracotta active:scale-[.98] transition-all disabled:opacity-50">
              {loading ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
