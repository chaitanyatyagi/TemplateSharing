import React from "react";

const Dropdown = ({
  id = "category-select",
  label = "Category",
  options = [
    { value: "all", label: "All Category" },
    { value: "finance", label: "Finance" },
    { value: "portfolio", label: "Portfolio" },
    { value: "business", label: "Business" },
  ],
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:gap-3 ${className}`}>
      <div className="relative flex-1 sm:flex-none">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full appearance-none rounded-xl border border-borderLight bg-white px-4 py-2.5 text-sm text-textDark
                     focus:outline-none focus:ring-2 focus:ring-lightBlue focus:border-bluePrimary
                     hover:border-bluePrimary cursor-pointer pr-8"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Simple Chevron Icon */}
        <svg
          className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-grayLight"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Dropdown;
