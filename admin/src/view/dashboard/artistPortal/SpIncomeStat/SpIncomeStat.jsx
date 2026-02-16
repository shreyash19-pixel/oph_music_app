import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const SpIncomeStat = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/get-special-artists-income");

        if (res.data.success === true) {
          console.log("hellll");

          setTableData(res.data.data);
        }
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
          excludeColumns={"content"}
          detailsUrl="/special-artist-income-status"
        />
      </ArtistSidebar>
    </div>
  );
};

export default SpIncomeStat;
