import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
const Artist_new = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/any-under-review");

      const sortedData = res.data.userDetails.sort(
        (a, b) => b.form_fill_count - a.form_fill_count,
      );

      setTableData(sortedData);
      console.log(sortedData);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>
        <SearchableDynamicTable
          title="New Artist"
          data={tableData}
          showStatusIndicator={false}
          excludeColumns={
            "createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step,traffic"
          }
          pageSize={10}
          detailsUrl="/ArtistNew"
        />
      </ArtistSidebar>
    </div>
  );
};

export default Artist_new;
