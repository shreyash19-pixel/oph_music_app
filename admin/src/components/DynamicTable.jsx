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
  detailsPrefer = null, // NEW prop: "ophid" | "song" | null
  hideIdColumns = ["id"], // NEW prop: array of ID column names to hide
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

  // Filter out ID columns that should be hidden
  if (hideIdColumns && hideIdColumns.length > 0) {
    columns = columns.filter((col) => !hideIdColumns.includes(col));
  }

  // Reorder columns to ensure createdat and updatedat appear at the end
  const reorderColumns = (cols) => {
    const timestampFields = ['createdat', 'created_at', 'updatedat', 'updated_at', 'modified_at', 'modifiedat'];
    const timestampCols = [];
    const regularCols = [];
    
    cols.forEach(col => {
      if (timestampFields.includes(col.toLowerCase())) {
        timestampCols.push(col);
      } else {
        regularCols.push(col);
      }
    });
    
    return [...regularCols, ...timestampCols];
  };
  
  columns = reorderColumns(columns);

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

  // === Date detection & formatting logic ===
  const isDateField = (col) => {
    if (!col) return false;
          const dateFields = [
        "createdat", "created_at", "modified_at", "updated_at", "updatedat", "modifiedat",
        "datetime", "date_time", "event_date", "event_time", "eventdatetime"
      ];
    return dateFields.includes(col.toLowerCase());
  };

  const isDateOnlyField = (col) => {
    if (!col) return false;
    const dateOnlyFields = [
      "registrationstart", "registrationend"
    ];
    return dateOnlyFields.includes(col.toLowerCase());
  };

  const formatDateTime = (value) => {
    if (value === null || value === undefined || value === "") return "";

    // Accept Date object, numeric timestamp, or ISO-like string
    let dateObj;
    if (value instanceof Date) {
      dateObj = value;
    } else if (typeof value === "number") {
      dateObj = new Date(value);
    } else {
      // handle numeric strings that look like timestamps
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber) && String(value).trim().length >= 10 && String(value).trim().length <= 13) {
        dateObj = new Date(asNumber);
      } else {
        dateObj = new Date(String(value));
      }
    }

    if (isNaN(dateObj.getTime())) {
      return String(value); // fallback to original if invalid
    }

    // Enhanced formatting for better readability
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === dateObj.toDateString();
    
    let dateStr = "";
    if (isToday) {
      dateStr = "Today";
    } else if (isTomorrow) {
      dateStr = "Tomorrow";
    } else {
      dateStr = dateObj.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }

    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });

    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{dateStr}</div>
        <div className="text-gray-600">{timeStr}</div>
      </div>
    );
  };

  const formatDateOnly = (value) => {
    if (value === null || value === undefined || value === "") return "";

    // Accept Date object, numeric timestamp, or ISO-like string
    let dateObj;
    if (value instanceof Date) {
      dateObj = value;
    } else if (typeof value === "number") {
      dateObj = new Date(value);
    } else {
      // handle numeric strings that look like timestamps
      const asNumber = Number(value);
      if (!Number.isNaN(asNumber) && String(value).trim().length >= 10 && String(value).trim().length <= 13) {
        dateObj = new Date(asNumber);
      } else {
        dateObj = new Date(String(value));
      }
    }

    if (isNaN(dateObj.getTime())) {
      return String(value); // fallback to original if invalid
    }

    // Date-only formatting
    const now = new Date();
    const isToday = dateObj.toDateString() === now.toDateString();
    const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === dateObj.toDateString();
    
    if (isToday) {
      return <span className="text-sm font-medium text-green-600">Today</span>;
    } else if (isTomorrow) {
      return <span className="text-sm font-medium text-blue-600">Tomorrow</span>;
    } else {
      return (
        <span className="text-sm font-medium text-gray-900">
          {dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric"
          })}
        </span>
      );
    }
  };
  // === end date logic ===

  const renderValue = (value, col) => {
    // Check if this is a lock column
    if (col === "Lock" || col === "lock") {
      if (value === 1 || value === "1") {
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else if (value === 0 || value === "0") {
        return (
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v2h2V7a5 5 0 00-5-5zM8 7v2h4V7a2 2 0 00-4 0z" />
              <path d="M8 12a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
          </div>
        );
      }
    }

    // Check if this is a lyrics_services column
    if (col === "lyrics_services" || col === "lyricsServices" || col === "lyrics_services" || col === "Lyrics_services") {
      if (value === 1 || value === "1") {
        return (
          <div className="flex items-center justify-start w-full h-full pl-6">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      } else if (value === 0 || value === "0") {
        return (
          <div className="flex items-center justify-start w-full h-full pl-6">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      }
    }

    // Date-only fields (registration dates)
    if (isDateOnlyField(col)) {
      return formatDateOnly(value);
    }

    // Date and time fields (event datetime)
    if (isDateField(col)) {
      return formatDateTime(value);
    }

    if (value === null || value === undefined) return "";

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
    const rowId = row.ophid || row.OPH_ID || row.ophID;
    if (!rowId || !statusData || statusData.length === 0) return "";

    const matched = statusData.find(
      (statusRow) =>
        statusRow.ophid === rowId ||
        statusRow.OPH_ID === rowId ||
        statusRow.ophID === rowId
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
                // ... existing code ...
                onClick={() => {
                  if (detailsUrl) {
                    const ophidValue = row.ophid || row.OPH_ID || row.ophID;  
                    const songIdValue = row.song_id || row.songId;
                    const ticketIdValue = row.ticketNumber || row.ticketNumber;

                    if (ophidValue && songIdValue) {
                      console.log(detailsPrefer)
                      if (detailsPrefer === "ophid") {
                        navigate(`${detailsUrl}/${ophidValue}`);
                      } else if (detailsPrefer === "song") {
                        navigate(`${detailsUrl}/${songIdValue}`);
                      } else {
                        navigate(`${detailsUrl}/${ophidValue}/${songIdValue}`);
                      }
                    } else if (ophidValue && ticketIdValue) {
                      navigate(`${detailsUrl}/${ophidValue}/${ticketIdValue}`);
                    } else if (ophidValue) {
                      navigate(`${detailsUrl}/${ophidValue}`);
                    } else if (songIdValue) {
                      navigate(`${detailsUrl}/${songIdValue}`);
                    }
                  
                  }
                }}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-3 border-b border-gray-200">
                    {renderValue(row[col], col)}
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
