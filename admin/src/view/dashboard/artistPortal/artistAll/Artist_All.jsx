import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const Artist_All = () => {
   const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/completed");
      setTableData(res.data.userDetails);
      console.log(res.data.userDetails);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>
         <SearchableDynamicTable
        title="All Artist"
        data={tableData}
        showStatusIndicator={false}
        excludeColumns = {"createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step,artist_story,artist_story_video"}
        pageSize={10}
        detailsUrl="/ArtistAll"
        leadColumns={[
          "oph_id",
          "OPH_ID",
          "registration_payment_status",
          "registration_payment_reject_reason",
        ]}
      />
      </ArtistSidebar>
      
    </div>
  )
  
}

export default Artist_All
