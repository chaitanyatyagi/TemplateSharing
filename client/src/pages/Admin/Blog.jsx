import { useEffect, useState } from "react"
import Table from "../../components/Table"
import AddBlog from "../../components/AddBlog"
import EditBlog from "../../components/EditBlog"
import BlogService from "../../api/blog";

const Blog = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Blog");
  const [error, setError] = useState(null);

  const fetchBlogs = async () => {
    try {
      setError(null);
      const response = await BlogService.getAllBlogs(1, 100);

      if (response.status === "Success") {
        const cols = ["S.NO", "BLOG HEADING", "CATEGORIES", "LIKES", "STATUS", "ACTIONS"];

        const blogData = response.blogs.map((blog, index) => ({
          "S.NO": index + 1,
          "BLOG ID": blog._id,
          "BLOG HEADING": blog.name,
          CATEGORIES: blog.type,
          LIKES: blog.likesCount || 0,
          STATUS: blog.status === "draft" ? "Draft" : "Published",
          ACTIONS: "Edit/Delete"
        }));

        setHeaders(cols);
        setData(blogData);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message || "Failed to fetch blogs");
      setHeaders(["S.NO", "BLOG HEADING", "CATEGORIES", "VIEWS", "LIKES", "ACTIONS"]);
      setData([]);
    }
  };

  useEffect(() => {
    if (activeMenu === "Blog") {
      fetchBlogs();
    }
  }, [activeMenu]);

  const handleDeleteBlog = async (blogId) => {
    try {
      const response = await BlogService.deleteBlog(blogId);
      if (response.status === "Success") {
        fetchBlogs();
      } else {
        alert("Failed to delete blog: " + response.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting blog: " + err.message);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All category");
  const [searchQuery, setSearchQuery] = useState("");

  // Category options derived from the actual blogs.
  const categories = [
    "All category",
    ...Array.from(new Set(data.map((row) => row.CATEGORIES).filter(Boolean))).sort(),
  ];

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const filteredData = data.filter((row) => {
    const matchesCategory =
      selectedCategory === "All category" || row.CATEGORIES === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(row["BLOG HEADING"] || "").toLowerCase().includes(q) ||
      String(row.CATEGORIES || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
      {/* ======= Header Row (Recent UserDatas Section) ======= */}

      {
        activeMenu === "Blog" ? (
          <>
            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center mt-8 shadow-sm p-4 rounded-md bg-paper">Blog Management</div>
            {error && (
              <div className="mt-4 p-3 bg-[#F4DEDA] text-likeRed rounded-md text-sm">{error}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 shadow-sm p-2 rounded-md bg-paper relative">
              {/* Left: Dropdown + Search */}
              <div className="flex flex-row gap-4 justify-start items-center w-full sm:w-auto">
                {/* Dropdown */}
                <div className="relative">
                  <div
                    className="flex items-center justify-between border border-line rounded-md px-3 py-2 w-[150px] cursor-pointer hover:border-ink transition"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-sm text-ink">
                      {selectedCategory}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-muted2 transform transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-paper border border-line rounded-md shadow-md">
                      {categories.map((cat, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelect(cat)}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-creamAlt ${selectedCategory === cat ? "text-terracotta font-semibold" : "text-ink"
                            }`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search box */}
                <div className="flex items-center border border-line rounded-md px-3 py-2 w-full sm:w-[250px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-faint"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search blogs..."
                    className="ml-2 w-full outline-none text-sm placeholder-faint"
                  />
                </div>
              </div>

              {/* Right: Button */}
              <div
                className="bg-ink text-white text-sm rounded-md px-4 py-2 mt-3 sm:mt-0 cursor-pointer hover:bg-terracotta transition"
                onClick={() => setActiveMenu("Add Blog")}
              >
                + New Blog
              </div>
            </div>            {/* ======= Responsive Table ======= */}
            <div className="mt-4">
              {activeMenu === "Blog" && (
                <Table
                  headers={headers}
                  data={filteredData}
                  setActiveMenu={setActiveMenu}
                  activeMenu={"Add Blog"}
                  idKey="BLOG ID"
                  editStorageKey="editBlogId"
                  editMenuLabel="Edit Blog"
                  onDelete={handleDeleteBlog}
                />
              )}
            </div>
          </>
        ) : activeMenu === "Edit Blog" ? (
          <EditBlog setActiveMenu={setActiveMenu} />
        ) : (
          <AddBlog activeMenu={"Blog"}  setActiveMenu={setActiveMenu} />
        )
      }
    </div>
  );
}

export default Blog;
