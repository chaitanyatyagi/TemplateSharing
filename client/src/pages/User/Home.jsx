import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import HomeFooter from "../../components/HomeFooter";
import Card from "../../components/blogCard";
import TemplateCard from "../../components/templateCard";
import Home1 from "../../assets/home1.png";
import Home2 from "../../assets/home2.png";
import TemplateService from "../../api/template";
import BlogService from "../../api/blog";
import { getTemplateImageUrl, getServerAssetUrl } from "../../utils/assetUrl";

const HOME_PAGE_ITEM_LIMIT = 4;

const Home = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await TemplateService.getAllTemplates();
        if (response.status === "Success") {
          setTemplates((response.templates || []).slice(0, HOME_PAGE_ITEM_LIMIT));
        }
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setLoadingTemplates(false);
      }
    };

    const fetchBlogs = async () => {
      try {
        const response = await BlogService.getAllBlogs(1, HOME_PAGE_ITEM_LIMIT);
        if (response.status === "Success") {
          setBlogs(response.blogs || []);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoadingBlogs(false);
      }
    };

    fetchTemplates();
    fetchBlogs();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-16 py-10 gap-8 mb-4 bg-white">
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Productivity Templates for Ambitious Teams and Professionals.
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Stop Starting From Scratch. Get a Head Start on Your Best Work. Get productive templates to implement today, plus cutting-edge blogs to lead tomorrow.
          </p>
          <button className="bg-bluePrimary text-white px-6 py-2 rounded-lg font-semibold w-max mt-2" onClick={() => navigate("/templates")} >
            See all templates
          </button>
        </div>
        <div className="flex-1 flex justify-center">
          <img
            src={Home1}
            alt="Hero Illustration"
            className="w-full max-w-md"
          />
        </div>
      </section>

      {/* Templates Section */}
      <section className="w-full px-4 md:px-16 py-10 bg-white mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Find the perfect template</h2>
        <p className="text-gray-500 text-center mb-8">
          Our most popular picks to help you work smarter and deliver exceptional results.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {loadingTemplates ? (
            Array.from({ length: HOME_PAGE_ITEM_LIMIT }).map((_, idx) => (
              <div key={`t-loading-${idx}`} className="w-full max-w-xs border rounded-2xl p-3 animate-pulse">
                <div className="w-full h-[180px] rounded-lg mb-3 bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : templates.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">No templates available yet.</p>
          ) : (
            templates.map((template) => (
              <div key={template._id} className="w-full max-w-xs">
                <TemplateCard
                  id={template._id}
                  image={getTemplateImageUrl(template.card_image)}
                  title={template.name}
                  description={template.card_content}
                  category={template.template_category}
                  price={template.price}
                />
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center mt-6">
          <button className="bg-bluePrimary text-white px-6 py-2 rounded-lg font-semibold" onClick={() => navigate("/templates")}>
            All templates &gt;
          </button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="w-full mb-4 bg-background py-10 px-4 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 flex justify-center">
          <img
            src={Home2}
            alt="Newsletter Illustration"
            className="w-full max-w-md"
          />
        </div>
        <div className="flex-1 flex flex-col items-center md:items-start gap-4">
          <h3 className="text-xl md:text-2xl font-bold text-bluePrimary text-center md:text-left">
            Get productivity tips in your inbox
          </h3>
          <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg px-4 py-2 w-full"
            />
            <button
              type="submit"
              className="bg-bluePrimary text-white px-6 py-2 rounded-lg font-semibold"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center md:text-left">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Blogs Section */}
      <section className="w-full px-4 md:px-16 py-10 bg-white mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
          Accelerate Your Growth with Our Blogs
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Where we break down the latest AI updates and skill shifts into strategies you can actually use.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {loadingBlogs ? (
            Array.from({ length: HOME_PAGE_ITEM_LIMIT }).map((_, idx) => (
              <div key={`b-loading-${idx}`} className="w-full max-w-xs border rounded-xl p-3 animate-pulse">
                <div className="w-full h-[150px] rounded-lg mb-3 bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : blogs.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">No blogs available yet.</p>
          ) : (
            blogs.map((blog) => (
              <div key={blog._id} className="w-full max-w-xs">
                <Card
                  id={blog._id}
                  title={blog.name}
                  description={(blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 100) + "..."}
                  category={blog.type}
                  likesCount={blog.likesCount || 0}
                  isLiked={blog.likedByMe || false}
                  imageUrl={getServerAssetUrl(blog.imageUrl)}
                  useOptimizedLoading={true}
                />
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center mt-6">
          <button className="bg-bluePrimary text-white px-6 py-2 rounded-lg font-semibold" onClick={() => navigate("/blogs")}>
            All Blogs &gt;
          </button>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
};

export default Home;
