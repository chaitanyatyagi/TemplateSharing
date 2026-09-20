import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ContactImage from "../../assets/contact-page.png";
import { useState } from "react";
import { Sparkles, Mail, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";
import ContactService from "../../api/contact";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", comments: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const response = await ContactService.createContact(formData.name, formData.email, formData.comments);
      if (response.status === "Success") {
        setSuccess(response.message || "Thanks for reaching out! We'll get back to you soon.");
        setFormData({ name: "", email: "", comments: "" });
      } else {
        setError(response.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-borderLight rounded-xl px-4 py-3 bg-background focus:outline-none focus:ring-2 focus:ring-bluePrimary focus:border-bluePrimary transition";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Header band */}
      <section className="relative overflow-hidden border-b border-borderLight bg-white">
        <div className="pointer-events-none absolute -top-24 right-10 w-80 h-80 rounded-full bg-lightBlue/50 blur-[110px]" />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 text-center flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 text-bluePrimary bg-lightBlue text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-3">
            <Sparkles size={13} /> We'd love to hear from you
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-textHeading tracking-tight">Contact us</h1>
          <p className="text-textMuted mt-3 text-base sm:text-lg max-w-2xl">
            Questions, feedback or a custom request? Send us a message and we'll get back to you.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-borderLight p-6 sm:p-8 flex flex-col gap-5 order-2 lg:order-1">
          <div>
            <h2 className="text-xl font-bold text-textHeading">Send us a message</h2>
            <p className="text-sm text-textMuted mt-1">We usually respond within a day.</p>
          </div>

          {success && (
            <div className="flex items-start gap-2 p-3 bg-greenAccent/10 text-greenAccent rounded-xl text-sm">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> {success}
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-redAccent/10 text-redAccent rounded-xl text-sm">
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Your name" value={formData.name} onChange={handleChange} className={inputClass} required />
              <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} className={inputClass} required />
            </div>
            <textarea name="comments" placeholder="How can we help?" rows="6" value={formData.comments} onChange={handleChange} className={`${inputClass} resize-none`} required />
            <button
              type="submit"
              disabled={loading}
              className="self-start bg-bluePrimary text-white px-6 py-3 rounded-xl font-semibold hover:bg-blueHover transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>

        {/* Aside */}
        <div className="flex flex-col gap-6 order-1 lg:order-2">
          <img src={ContactImage} alt="Contact us" className="w-full h-auto rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-borderLight rounded-2xl p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lightBlue flex items-center justify-center shrink-0">
                <Mail size={18} className="text-bluePrimary" />
              </div>
              <div>
                <p className="font-semibold text-textHeading text-sm">Email us</p>
                <p className="text-textMuted text-sm mt-0.5">We reply to every message.</p>
              </div>
            </div>
            <div className="bg-white border border-borderLight rounded-2xl p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-lightBlue flex items-center justify-center shrink-0">
                <MessageSquare size={18} className="text-bluePrimary" />
              </div>
              <div>
                <p className="font-semibold text-textHeading text-sm">Custom requests</p>
                <p className="text-textMuted text-sm mt-0.5">Need a bespoke template? Ask us.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
