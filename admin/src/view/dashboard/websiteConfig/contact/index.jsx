import React, { useState, useEffect } from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import WebConfigSidebar from "../../../../components/WebConfigSidebar";


export const Contact = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/get_contact_us");
      setTableData(res.data.result);
      console.log(res.data.result);
    };

    fetchData();
  }, []);
  return (
    <div>
      <WebConfigSidebar>
         <SearchableDynamicTable
        title="Contact Us"
        data={tableData}
        showStatusIndicator={false}
        excludeColumns = {"createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step"}
        pageSize={10}
        detailsUrl="/ContactUs"
      />
      </WebConfigSidebar>
      
    </div>
  )
  
}
  

export default Contact;