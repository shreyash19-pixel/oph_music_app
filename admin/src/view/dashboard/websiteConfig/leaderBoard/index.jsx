   import React, { useState, useEffect } from "react";
   import axiosApi from "../../../../conf/axios";
   import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
   import WebConfigSidebar from "../../../../components/WebConfigSidebar";
 
   const LeaderBoard = () => {
     const [tableData, setTableData] = useState([]);
 
     useEffect(() => {
       const fetchData = async () => {
         const res = await axiosApi.get("/leaderboard");
         setTableData(res.data.data);
         console.log(res.data.data);
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
               "stage_name",
               "personal_photo",
               "location",
               "OPH_ID",
               "song_count",
               "score",
               "ranks",
             ]}
             showStatusIndicator={false}
             pageSize={10}
           />
         </div>
       </div>
     );
   };
 
   
   export default LeaderBoard;
 