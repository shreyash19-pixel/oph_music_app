   import React, { useState, useEffect } from "react";
   import axiosApi from "../../../../conf/axios";
   import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
   import ArtistSidebar from "../../../../components/ArtistSidebar";

 
   const Tvpublishing = () => {
     const [tableData, setTableData] = useState([]);
 
     useEffect(() => {
       const fetchData = async () => {
         const res = await axiosApi.get("/getResolveSummaries");
         setTableData(res.data.data);
         console.log(res.data.data);
       };
       
       fetchData();
     }, []);
     return (
       <div>
         <ArtistSidebar>
           <SearchableDynamicTable
             title=" Resolved Tickets"
             data={tableData}
             showStatusIndicator={false}
             pageSize={10}
             excludeColumns={"imageURL"}
             detailsUrl="/ResolvedTickets"
           />
         </ArtistSidebar>
       </div>
     );
   };
 
   export default Tvpublishing;
 