import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
const Collab = () => {
  const [tableData, setTableData] = useState([]);
  const [Loading, setLoading] = useState();

 useEffect(() => {
   const fetchData = async () => {
     try {
       const res = await axiosApi.get("/kpi_score");
       console.log("API Response:", res.data);

       const dataObj = res.data.data; // object keyed by ophid
       let flattened = Object.values(dataObj).map((user) => {
         const { ophid, fullName, kpiScore, songs } = user;
         return {
           ophid,
           fullName,
           kpiScore: parseFloat(kpiScore), // ensure numeric
           totalSongs: songs?.length || 0,
         };
       });

       // Sort by kpiScore (descending)
       flattened.sort((a, b) => b.kpiScore - a.kpiScore);

       // Assign position (1-based)
       flattened = flattened.map((user, index) => ({
         ...user,
         position: index + 1,
       }));

       setTableData(flattened);
     } catch (err) {
       console.error("Error fetching KPI score:", err);
       setTableData([]);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, []);


  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-10 overflow-auto">
        <SearchableDynamicTable
          title="Collab"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default Collab;
