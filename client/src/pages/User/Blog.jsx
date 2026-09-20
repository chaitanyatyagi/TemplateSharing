import { useState, useEffect } from "react";
import Dropdown from "../../components/DropDown";
import Footer from "../../components/Footer"
import Navbar from "../../components/Navbar"
import Card from "../../components/blogCard";
import BlogCarousel from "../../components/BlogCarousel";
import BlogService from "../../api/blog";
import { getServerAssetUrl } from "../../utils/assetUrl";

const Blog = () => {
    const [category, setCategory] = useState("all");
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const options = [
        { value: "all", label: "All Category" },
        { value: "technology", label: "Technology" },
        { value: "business", label: "Business" },
        { value: "health", label: "Health" },
        { value: "lifestyle", label: "Lifestyle" },
        { value: "education", label: "Education" },
        { value: "entertainment", label: "Entertainment" },
    ];

    // Fetch blogs based on category
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError(null);

                let response;
                if (category === "all") {
                    response = await BlogService.getAllBlogs(1, 10);
                } else {
                    response = await BlogService.getBlogsByCategory(category, 1, 10);
                }

                if (response.status === "Success") {
                    setBlogs(response.blogs || []);
                } else {
                    setError(response.message || "Failed to fetch blogs");
                }
            } catch (err) {
                console.error("Error fetching blogs:", err);
                setError(err.message || "Failed to fetch blogs");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [category]);

return (
    <div className="min-h-screen">
      <Navbar />

      <div className="w-full flex flex-col justify-start items-center mx-auto bg-background">
        
        {/* Hero Blog Carousel */}
        <div className="w-full flex justify-center">
          <BlogCarousel />
        </div>

        {/* Latest Blogs Section */}
        <div className="flex flex-col gap-4 w-[90%] sm:w-[85%] lg:w-[80%] my-8">
          
          {/* Header Row */}
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3">
            <p className="text-xl sm:text-2xl font-bold text-textDark">
              Latest Blogs
            </p>
            <div className="w-full xs:w-auto">
              <Dropdown
                id="main-category"
                label="Category"
                options={options}
                value={category}
                onChange={setCategory}
              />
            </div>
          </div>

          {/* Blog Cards Grid */}
          {error ? (
            <div className="w-full text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-bluePrimary text-white rounded-md hover:bg-blueHover transition"
              >
                Retry
              </button>
            </div>
          ) : !loading && blogs.length === 0 ? (
            <div className="w-full text-center py-8">
              <p className="text-gray-500">No blogs found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 justify-items-center">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`loading-${idx}`}
                    className="border border-borderLight rounded-2xl p-3 bg-white animate-pulse"
                  >
                    <div className="w-full h-[150px] rounded-lg mb-3 bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3 w-1/3"></div>
                  </div>
                ))
              ) : (
                blogs.map((blog) => (
                  <Card
                    key={blog._id}
                    id={blog._id}
                    title={blog.name}
                    description={(blog.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 100) + "..."}
                    category={blog.type}
                    likesCount={blog.likesCount || 0}
                    isLiked={blog.likedByMe || false}
                    imageUrl={getServerAssetUrl(blog.imageUrl || blog.imageUrls?.thumbnail)}
                    useOptimizedLoading={true}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Blog;
