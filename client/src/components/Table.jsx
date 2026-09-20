import React, { useEffect, useState } from "react";

const chip = "inline-block rounded-md px-2.5 py-1 text-xs font-semibold";

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

  useEffect(() => {
    if (data.length > 0 && headers.length === 0) {
      setFinalHeaders(Object.keys(data[0]));
    } else {
      setFinalHeaders(headers);
    }
  }, [data, headers]);

  const renderCellContent = (header, value, row) => {
    switch (header.toLowerCase()) {
      case "membership":
        return (
          <span className={`${chip} ${value?.toLowerCase() === "premium member" ? "bg-greenAccent/10 text-greenAccent" : "bg-lightBlue text-bluePrimary"}`}>
            {value}
          </span>
        );

      case "reorder":
        return (
          <span className={`${chip} ${value?.toLowerCase() === "yes" ? "bg-greenAccent/10 text-greenAccent" : "bg-background text-textMuted"}`}>
            {value}
          </span>
        );

      case "categories":
        return <span className={`${chip} bg-lightBlue text-bluePrimary capitalize`}>{value}</span>;

      case "status":
        return (
          <span className={`${chip} ${value === "Draft" ? "bg-amberAccent/10 text-amberAccent" : "bg-greenAccent/10 text-greenAccent"}`}>
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
              className="text-bluePrimary border border-bluePrimary/40 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-lightBlue transition"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                const itemId = row[idKey];
                if (itemId && window.confirm("Are you sure you want to delete this item?")) {
                  if (onDelete) await onDelete(itemId);
                }
              }}
              className="text-redAccent border border-redAccent/40 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-redAccent/10 transition"
            >
              Delete
            </button>
          </div>
        );

      default:
        return <span className="text-textDark">{value ?? "—"}</span>;
    }
  };

  return (
    <div className="w-full mt-1 font-inter">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-borderLight bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-background border-b border-borderLight">
              {finalHeaders.map((header, i) => (
                <th key={i} className="px-4 py-3.5 font-semibold uppercase tracking-wide text-xs text-textMuted whitespace-nowrap">
                  {header.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-borderLight last:border-0 hover:bg-background transition-colors">
                  {finalHeaders.map((header, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 align-middle whitespace-nowrap">
                      {renderCellContent(header, row[header], row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={finalHeaders.length} className="text-center py-8 text-textMuted">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((row, rowIndex) => (
            <div key={rowIndex} className="border border-borderLight rounded-2xl p-4 shadow-sm bg-white">
              <div className="grid grid-cols-2 gap-y-2.5 text-sm items-center">
                {finalHeaders.map((header, colIndex) => (
                  <React.Fragment key={colIndex}>
                    <span className="font-semibold text-textMuted capitalize text-xs uppercase tracking-wide">
                      {header.replace(/_/g, " ")}
                    </span>
                    <span>{renderCellContent(header, row[header], row)}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-textMuted py-4">No data available</p>
        )}
      </div>
    </div>
  );
};

export default Table;
