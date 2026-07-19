import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Dropdown from "../../components/DropDown";
import Footer from "../../components/Footer"
import TemplateCard from "../../components/templateCard";
import TemplateService from "../../api/template";
import { getTemplateImageUrl } from "../../utils/assetUrl";

const Template = () => {
    const [category, setCategory] = useState("all");
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const options = [
        { value: "all", label: "All Category" },
        { value: "finance", label: "Finance" },
        { value: "portfolio", label: "Portfolio" },
        { value: "business", label: "Business" },
    ];

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                setError(null);

                const response =
                    category === "all"
                        ? await TemplateService.getAllTemplates()
                        : await TemplateService.getTemplatesByCategory(category);

                if (response.status === "Success") {
                    setTemplates(response.templates || []);
                } else {
                    setError(response.message || "Failed to fetch templates");
                }
            } catch (err) {
                console.error("Error fetching templates:", err);
                setError(err.message || "Failed to fetch templates");
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [category]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="min-h-[73vh] w-full flex flex-col justify-start items-center mx-auto bg-white">
                <div className="w-full flex flex-col justify-center items-center text-center gap-3 py-8 px-4 mb-6">
                    <p className="text-xl sm:text-2xl font-bold text-textDark">Find the perfect template</p>
                    <p className="text-textDark">Unlock smarter workflows and achieve superior results with our best resources.</p>
                </div>
                <div className="flex flex-col gap-4 w-[90%] sm:w-[85%] lg:w-[80%] my-8">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 w-full">
                        <p className="text-xl sm:text-2xl font-bold text-textDark">
                            Latest Templates
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
                    ) : !loading && templates.length === 0 ? (
                        <div className="w-full text-center py-8">
                            <p className="text-gray-500">No templates found in this category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 justify-items-center">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <div
                                        key={`loading-${idx}`}
                                        className="border border-borderLight rounded-2xl p-3 bg-white w-full animate-pulse"
                                    >
                                        <div className="w-full h-[180px] rounded-lg mb-3 bg-gray-200"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-6 bg-gray-200 rounded mb-3 w-1/3"></div>
                                    </div>
                                ))
                            ) : (
                                templates.map((template) => (
                                    <TemplateCard
                                        key={template._id}
                                        id={template._id}
                                        image={getTemplateImageUrl(template.card_image)}
                                        title={template.name}
                                        description={template.card_content}
                                        category={template.template_category}
                                        price={template.price}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default Template;
