import React, { useState, useEffect } from "react";
import DynamicTable from "./DynamicTable";

const SearchableDynamicTable = ({
  data,
  pageSize = 5,
  detailsUrl = "",
  includeColumns = null,
  excludeColumns = [],
  showStatusIndicator = false,
  statusField = "",
  statusData = [],
  detailsPrefer = null,
  title = "New SignUp",
  showSearch = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredData(data);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    const filtered = data.filter((row) =>
      Object.values(row).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(lowerQuery)
      )
    );

    setFilteredData(filtered);
  }, [searchQuery, data]);

  return (
    <div className="min-h-screen flex flex-col">
      {title ? (
        <div className="px-8 py-6 bg-gradient-to-r from-[#0d3c44] to-[#145058] text-white rounded-none shadow-lg mb-4">
          <h2 className="text-3xl font-extrabold tracking-wide leading-tight drop-shadow-sm">{title}</h2>
        </div>
      ) : null}

      {showSearch ? (
        <div className="flex justify-end mb-6 px-8">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 pr-10 bg-[#0d3c44] border border-transparent rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#145058] transition shadow-sm"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
                />
              </svg>
            </div>
          </div>
        </div>
      ) : null}

      <DynamicTable
        data={filteredData}
        pageSize={pageSize}
        detailsUrl={detailsUrl}
        includeColumns={includeColumns}
        excludeColumns={excludeColumns}
        showStatusIndicator={showStatusIndicator}
        statusField={statusField}
        statusData={statusData}
        detailsPrefer={detailsPrefer}
      />
    </div>
  );
};

export default SearchableDynamicTable;
