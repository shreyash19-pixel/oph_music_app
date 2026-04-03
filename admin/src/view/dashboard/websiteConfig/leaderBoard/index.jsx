   import React, { useState, useEffect } from "react";
   import axiosApi from "../../../../conf/axios";
   import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
   import WebConfigSidebar from "../../../../components/WebConfigSidebar";
 
   const LeaderBoard = () => {
     const [tableData, setTableData] = useState([]);
 
     useEffect(() => {
       const fetchData = async () => {
         const res = await axiosApi.get("/leaderboard");
         const rows = Array.isArray(res.data?.data) ? res.data.data : [];
         const viewsRaw = (row) =>
           row.total_views ?? row.Total_views ?? row.totalViews ?? null;
         setTableData(
           rows.map((row) => {
             const v = viewsRaw(row);
             const viewsDisplay =
               v == null || v === ""
                 ? "—"
                 : Number.isFinite(Number(v))
                   ? Number(v).toLocaleString()
                   : String(v);
             return {
               ranks: row.ranks,
               ophid: row.oph_id ?? row.OPH_ID ?? row.ophid ?? "",
               stage_name: row.stage_name,
               personal_photo: row.personal_photo,
               location: row.location,
               song_count: row.song_count,
               views: viewsDisplay,
               score: row.score,
             };
           }),
         );
       };
 
       fetchData();

     }, []);
     return (
       <div className="flex h-screen bg-gray-50">
         <WebConfigSidebar />
         <div className="flex-1 ml-10 overflow-auto">
           <SearchableDynamicTable
             title="LeaderBoard"
             data={tableData}
             includeColumns={[
               "ranks",
               "ophid",
               "stage_name",
               "personal_photo",
               "location",
               "song_count",
               "views",
               "score",
             ]}
             showStatusIndicator={false}
             pageSize={10}
           />
         </div>
       </div>
     );
   };
 
   
   export default LeaderBoard;
 