import React, { useEffect, useState } from "react";

const Table = ({
  headers = [],
  data = [],
  setActiveMenu,
  activeMenu,
  idKey = "ID",
  editStorageKey,
  editMenuLabel,
  onDelete,
}) => {
  const [finalHeaders, setFinalHeaders] = useState([]);

  // ✅ Dynamically set headers if not provided
  useEffect(() => {
    if (data.length > 0 && headers.length === 0) {
      setFinalHeaders(Object.keys(data[0]));
    } else {
      setFinalHeaders(headers);
    }
  }, [data, headers]);

  // ✅ Render cell content instead of mixing JSX & class strings
  const renderCellContent = (header, value, row) => {
    switch (header.toLowerCase()) {
      case "membership":
        return (
          <span
            className={`border rounded-lg px-2 py-1 text-center font-bold font-inter ${
              value?.toLowerCase() === "premium member"
                ? "text-greenAccent"
                : "text-bluePrimary"
            }`}
          >
            {value}
          </span>
        );

      case "reorder":
        return (
          <span
            className={`border rounded-lg px-2 py-1 text-center font-bold font-inter ${
              value?.toLowerCase() === "yes"
                ? "text-greenAccent"
                : "text-red-500"
            }`}
          >
            {value}
          </span>
        );

      case "categories":
        return (
          <span className="border rounded-lg px-2 py-1 text-center font-bold text-bluePrimary font-inter">
            {value}
          </span>
        );

      case "actions":
        return (
          <div className="flex justify-start gap-2">
            <button
              onClick={() => {
                const itemId = row[idKey];
                if (itemId && editStorageKey && editMenuLabel) {
                  localStorage.setItem(editStorageKey, itemId);
                  setActiveMenu(editMenuLabel);
                } else {
                  setActiveMenu(activeMenu);
                }
              }}
              className="text-bluePrimary border border-bluePrimary px-3 py-1 rounded-md text-sm font-inter hover:bg-lightBlue transition"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                const itemId = row[idKey];
                if (itemId && window.confirm("Are you sure you want to delete this item?")) {
                  if (onDelete) {
                    await onDelete(itemId);
                  }
                }
              }}
              className="text-red-500 border border-red-500 px-3 py-1 rounded-md text-sm font-inter hover:bg-red-50 transition"
            >
              Delete
            </button>
          </div>
        );

      default:
        return <span className="text-textDark font-inter">{value ?? "-"}</span>;
    }
  };

  return (
    <div className="w-full mt-1 overflow-x-auto font-inter">
      {/* ✅ Table for medium and larger screens */}
      <table className="hidden md:table min-w-full border-collapse border border-gray-300 text-left text-sm font-inter">
        <thead>
          <tr>
            {finalHeaders.map((header, i) => (
              <th
                key={i}
                className="border border-gray-300 bg-bluePrimary text-white px-4 py-3 font-semibold capitalize font-inter"
              >
                {header.replace(/_/g, " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="bg-white hover:bg-gray-50 transition-colors"
              >
                {finalHeaders.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className="border border-gray-300 px-4 py-3 text-sm text-center md:text-left font-inter"
                  >
                    {renderCellContent(header, row[header], row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={finalHeaders.length}
                className="text-center py-4 text-gray-500 font-inter"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Card layout for small screens */}
      <div className="md:hidden flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="border border-gray-300 rounded-xl p-4 shadow-sm bg-white font-inter"
            >
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                {finalHeaders.map((header, colIndex) => (
                  <React.Fragment key={colIndex}>
                    <span className="font-semibold text-gray-600 capitalize font-inter">
                      {header.replace(/_/g, " ")}
                    </span>
                    <span>{renderCellContent(header, row[header], row)}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4 font-inter">
            No data available
          </p>
        )}
      </div>
    </div>
  );
};

export default Table;
