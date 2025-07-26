import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DynamicTable = ({
  data,
  pageSize = 5,
  detailsUrl = "",
  includeColumns = null,
  excludeColumns = [],
  showStatusIndicator = false,
  statusField = "",
  statusData = [],
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumns, setSortColumns] = useState([]);
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return <p className="text-gray-400 italic">No data available.</p>;
  }

  let columns = Object.keys(data[0]);

  if (includeColumns && includeColumns.length > 0) {
    columns = columns.filter((col) => includeColumns.includes(col));
  } else if (excludeColumns && excludeColumns.length > 0) {
    columns = columns.filter((col) => !excludeColumns.includes(col));
  }

  const handleSort = (col) => {
    setCurrentPage(1); // Reset page

    const existing = sortColumns.find((s) => s.column === col);

    if (!existing) {
      // Add new column ascending
      setSortColumns([...sortColumns, { column: col, order: "asc" }]);
    } else if (existing.order === "asc") {
      // Toggle to descending
      setSortColumns(
        sortColumns.map((s) =>
          s.column === col ? { ...s, order: "desc" } : s
        )
      );
    } else {
      // Remove from sort
      setSortColumns(sortColumns.filter((s) => s.column !== col));
    }
  };

  const sortedData = [...data].sort((a, b) => {
    for (const { column, order } of sortColumns) {
      const valA = a[column] ?? "";
      const valB = b[column] ?? "";

      let comparison = 0;

      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      if (comparison !== 0) {
        return order === "asc" ? comparison : -comparison;
      }
    }
    return 0; // All columns equal
  });

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = sortedData.slice(startIndex, startIndex + pageSize);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const renderValue = (value) => {
    if (typeof value !== "string") return String(value);
    const lowerVal = value.toLowerCase();

    if (lowerVal.match(/\.(jpeg|jpg|png|gif|svg|webp)$/)) {
      return <img src={value} alt="preview" className="w-16 h-16 object-cover rounded" />;
    } else if (lowerVal.match(/\.(mp4|webm|ogg)$/)) {
      return <video src={value} controls className="w-32 h-20 rounded" />;
    } else if (lowerVal.startsWith("http")) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {value}
        </a>
      );
    } else {
      return value;
    }
  };

  const getStatusForRow = (row) => {
    const rowId = row.ophid || row.OPH_ID;
    if (!rowId || !statusData || statusData.length === 0) return "";

    const matched = statusData.find(
      (statusRow) => statusRow.ophid === rowId || statusRow.OPH_ID === rowId
    );

    return matched ? matched[statusField] : "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 h-full overflow-x-auto rounded-2xl shadow-lg border border-gray-300 bg-white text-gray-800 flex flex-col">
        <table className="min-w-full flex-grow">
          <thead>
            <tr>
              {columns.map((col) => {
                const sortInfo = sortColumns.find((s) => s.column === col);
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left font-semibold uppercase cursor-pointer select-none"
                  >
                    {col}
                    {sortInfo && (
                      <span className="ml-1 text-xs">
                        {sortInfo.order === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                );
              })}
              {showStatusIndicator && statusField && (
                <th className="px-4 py-3 border-b border-gray-300 bg-gray-100 text-left font-semibold uppercase">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 transition cursor-pointer"
                onClick={() => {
                  if (detailsUrl) {
                    const ophidValue = row.ophid || row.OPH_ID;
                    const songIdValue = row.song_id || row.songId;

                    if (ophidValue && songIdValue) {
                      navigate(`${detailsUrl}/${ophidValue}/${songIdValue}`);
                    } else if (ophidValue) {
                      navigate(`${detailsUrl}/${ophidValue}`);
                    }
                  }
                }}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 border-b border-gray-200">
                    {renderValue(row[col])}
                  </td>
                ))}
                {showStatusIndicator && statusField && (
                  <td className="px-4 py-3 border-b border-gray-200">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${getStatusForRow(row)?.toLowerCase() === "approved"
                          ? "bg-green-500"
                          : getStatusForRow(row)?.toLowerCase() === "rejected"
                            ? "bg-red-500"
                            : "bg-gray-500"
                        }`}
                    ></span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 py-4 bg-white border-t border-gray-300 rounded-b-2xl">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 text-gray-800 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 transition-transform hover:scale-105"
          >
            Prev
          </button>
          <span className="text-gray-600 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-gray-800 bg-gray-100 rounded-xl shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 transition-transform hover:scale-105"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
