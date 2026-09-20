import { useEffect, useState } from "react"
import Table from "../../components/Table"
import AddTemplate from "../../components/AddTemplate"
import EditTemplate from "../../components/EditTemplate"
import TemplateService from "../../api/template";

const Template = () => {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Template");
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setError(null);
      const response = await TemplateService.getAllTemplates();

      if (response.status === "Success") {
        const cols = ["S.NO", "TEMPLATE HEADING", "CATEGORIES", "PRICE", "TYPE", "STATUS", "ACTIONS"];

        const templateData = response.templates.map((template, index) => ({
          "S.NO": index + 1,
          "TEMPLATE ID": template._id,
          "TEMPLATE HEADING": template.name,
          CATEGORIES: template.template_category || "—",
          PRICE: template.template_type === "free" ? "Free" : `Rs ${template.price}`,
          TYPE: template.template_type,
          STATUS: template.status === "draft" ? "Draft" : "Published",
          ACTIONS: "Edit/Delete",
        }));

        setHeaders(cols);
        setData(templateData);
      }
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError(err.message || "Failed to fetch templates");
      setHeaders(["S.NO", "TEMPLATE HEADING", "CATEGORIES", "PRICE", "TYPE", "ACTIONS"]);
      setData([]);
    }
  };

  useEffect(() => {
    if (activeMenu === "Template") {
      fetchTemplates();
    }
  }, [activeMenu]);

  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await TemplateService.deleteTemplate(templateId);
      if (response.status === "Success") {
        fetchTemplates();
      } else {
        alert("Failed to delete template: " + response.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting template: " + err.message);
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All category");
  const [searchQuery, setSearchQuery] = useState("");

  // Category options derived from the actual templates (not a hardcoded list).
  const categories = [
    "All category",
    ...Array.from(
      new Set(data.map((row) => row.CATEGORIES).filter((c) => c && c !== "—"))
    ).sort(),
  ];

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  // Apply category filter + text search over heading/category.
  const filteredData = data.filter((row) => {
    const matchesCategory =
      selectedCategory === "All category" || row.CATEGORIES === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      String(row["TEMPLATE HEADING"] || "").toLowerCase().includes(q) ||
      String(row.CATEGORIES || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-10 py-6 overflow-y-auto">
      {/* ======= Header Row (Recent UserDatas Section) ======= */}

      {
        activeMenu === "Template" ? (
          <>
            <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center mt-8 shadow-sm p-4 rounded-md bg-white font-inter">Template Management</div>
            {error && (
              <div className="mt-4 p-3 bg-redAccent/10 text-redAccent rounded-md text-sm">{error}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 shadow-sm p-2 rounded-md bg-white font-inter relative">
              {/* Left: Dropdown + Search */}
              <div className="flex flex-row gap-4 justify-start items-center w-full sm:w-auto">
                {/* Dropdown */}
                <div className="relative">
                  <div
                    className="flex items-center justify-between border border-borderLight rounded-md px-3 py-2 w-[150px] cursor-pointer hover:border-border transition"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-sm text-textDark font-inter">
                      {selectedCategory}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-textMuted transform transition-transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
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
                    <div className="absolute z-10 mt-1 w-full bg-white border border-borderLight rounded-md shadow-md">
                      {categories.map((cat, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSelect(cat)}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-lightBlue ${selectedCategory === cat ? "text-bluePrimary font-semibold" : "text-textDark"
                            }`}
                        >
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search box */}
                <div className="flex items-center border border-borderLight rounded-md px-3 py-2 w-full sm:w-[250px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-grayLight"
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
                    placeholder="Search templates..."
                    className="ml-2 w-full outline-none text-sm font-inter placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Right: Button */}
              <div
                className="bg-bluePrimary text-white text-sm font-inter rounded-md px-4 py-2 mt-3 sm:mt-0 cursor-pointer hover:bg-blueHover transition"
                onClick={() => setActiveMenu("Add Template")}
              >
                + New Template
              </div>
            </div>            {/* ======= Responsive Table ======= */}
            <div className="mt-4">
              {activeMenu === "Template" && (
                <Table
                  headers={headers}
                  data={filteredData}
                  setActiveMenu={setActiveMenu}
                  activeMenu={"Add Template"}
                  idKey="TEMPLATE ID"
                  editStorageKey="editTemplateId"
                  editMenuLabel="Edit Template"
                  onDelete={handleDeleteTemplate}
                />
              )}
            </div>
          </>
        ) : activeMenu === "Edit Template" ? (
          <EditTemplate setActiveMenu={setActiveMenu} />
        ) : (
          <AddTemplate activeMenu={"Template"} setActiveMenu={setActiveMenu} />
        )
      }
    </div>
  );
}

export default Template;
