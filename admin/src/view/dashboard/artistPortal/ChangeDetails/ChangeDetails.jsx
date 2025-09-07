import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const ChangeDetails = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get(
          "/get-special-artists-requested-details"
        );

        const formattedData = res.data.data.map((item) => {
          return {
            ...item,
            // Format all ISO strings to "DD MMM YYYY" (like 27 Jul 2025)
            date: item.date
              ? new Date(item.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : null,
          };
        });

        setTableData(formattedData);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <ArtistSidebar>
        <SearchableDynamicTable
          title="Change Details"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          excludeColumns = {"content"}
          detailsUrl="/change-details"
        />
      </ArtistSidebar>
    </div>
  );
};

export default ChangeDetails;
