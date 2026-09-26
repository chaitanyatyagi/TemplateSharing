import React, { useEffect, useState } from "react";

const STATUS = {
  Published: "bg-[#E3EEE5] text-successGreen",
  completed: "bg-[#E3EEE5] text-successGreen",
  Draft: "bg-[#F3E9D6] text-[#A86B12]",
  pending: "bg-[#F3E9D6] text-[#A86B12]",
  failed: "bg-[#F4DEDA] text-likeRed",
};

const Table = ({ headers = [], data = [], setActiveMenu, activeMenu, idKey = "ID", editStorageKey, editMenuLabel, onDelete }) => {
  const [finalHeaders, setFinalHeaders] = useState([]);

  useEffect(() => {
    if (data.length > 0 && headers.length === 0) setFinalHeaders(Object.keys(data[0]));
    else setFinalHeaders(headers);
  }, [data, headers]);

  const cell = (header, value, row) => {
    switch (header.toLowerCase()) {
      case "membership":
        return <span className={`font-mono text-[11px] font-medium uppercase px-2.5 py-1 ${value?.toLowerCase() === "premium member" ? "text-successGreen" : "text-terracotta"}`}>{value}</span>;
      case "reorder":
        return <span className={`font-mono text-[11px] font-medium uppercase ${value?.toLowerCase() === "yes" ? "text-successGreen" : "text-muted2"}`}>{value}</span>;
      case "categories":
        return <span className="font-mono text-[11px] font-medium tracking-[.08em] uppercase text-terracotta">{value}</span>;
      case "status":
        return <span className={`inline-block font-mono text-[11px] font-medium uppercase px-2.5 py-1 rounded-full ${STATUS[value] || "bg-creamAlt text-muted2"}`}>{value}</span>;
      case "actions":
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const id = row[idKey];
                if (id && editStorageKey && editMenuLabel) { localStorage.setItem(editStorageKey, id); setActiveMenu(editMenuLabel); }
                else setActiveMenu(activeMenu);
              }}
              className="text-ink border border-ink px-3 py-1.5 rounded-full text-sm font-medium hover:bg-ink hover:text-cream transition-colors">
              Edit
            </button>
            <button
              onClick={async () => { const id = row[idKey]; if (id && window.confirm("Delete this item?") && onDelete) await onDelete(id); }}
              className="text-likeRed border border-likeRed/50 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-[#F4DEDA] transition-colors">
              Delete
            </button>
          </div>
        );
      default:
        return <span className="text-ink">{value ?? "—"}</span>;
    }
  };

  return (
    <div className="w-full mt-1">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto border border-ink bg-cream">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink">
              {finalHeaders.map((h, i) => (
                <th key={i} className="px-4 py-3.5 font-mono font-medium uppercase tracking-[.08em] text-[11px] text-muted2 whitespace-nowrap">{h.replace(/_/g, " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row, ri) => (
              <tr key={ri} className="border-b border-line last:border-0 hover:bg-paper transition-colors">
                {finalHeaders.map((h, ci) => <td key={ci} className="px-4 py-3.5 align-middle whitespace-nowrap">{cell(h, row[h], row)}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={finalHeaders.length} className="text-center py-10 text-muted2 font-mono text-[13px]">No data available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {data.length > 0 ? data.map((row, ri) => (
          <div key={ri} className="border border-ink bg-cream p-4">
            <div className="grid grid-cols-2 gap-y-2.5 text-sm items-center">
              {finalHeaders.map((h, ci) => (
                <React.Fragment key={ci}>
                  <span className="font-mono text-[10px] uppercase tracking-[.08em] text-muted2">{h.replace(/_/g, " ")}</span>
                  <span>{cell(h, row[h], row)}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )) : <p className="text-center text-muted2 py-4 font-mono text-[13px]">No data available</p>}
      </div>
    </div>
  );
};

export default Table;
