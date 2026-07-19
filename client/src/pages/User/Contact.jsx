import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import ContactImage from "../../assets/contact-page.png";
import { useState } from "react";
import ContactService from "../../api/contact";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await ContactService.createContact(
        formData.name,
        formData.email,
        formData.comments
      );

      if (response.status === "Success") {
        setSuccess(response.message || "Thanks for reaching out!");
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

  return (
    <>
      <Navbar />
      <div className="w-full min-h-[73vh] flex flex-col md:flex-row justify-center items-center gap-10 py-10 bg-background font-inter">
        
        {/* Left: Contact Form */}
        <div className="w-[90%] md:w-[40%] bg-white rounded-2xl shadow-sm border p-6 flex flex-col gap-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-bluePrimary mb-2">
            Contact Us
          </h1>

          {success && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            />

            <textarea
              name="comments"
              placeholder="Comments...."
              rows="5"
              value={formData.comments}
              onChange={handleChange}
              className="border rounded-md px-3 py-2 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-bluePrimary"
              required
            ></textarea>

            <button
              type="submit"
              disabled={loading}
              className="self-end bg-bluePrimary text-white px-5 py-2 rounded-md hover:bg-blueHover transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

        {/* Right: Image */}
        <div className="w-[90%] md:w-[35%]">
          <img
            src={ContactImage}
            alt="Contact Us"
            className="w-full h-auto rounded-2xl object-cover"
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
