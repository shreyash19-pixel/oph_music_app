import React, { useEffect, useState } from "react";
import DynamicTable from '../components/DynamicTable'
import SearchableDynamicTable from "../components/SearchableDynamicTable";
import DashBoardSidebar from "../components/DashBoardSidebar";
import axiosApi from "../conf/axios";


const NewSignup = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/newsignup");

      
      setTableData(res.data.userDetails);
      console.log(res.data.userDetails);
    };

    fetchData();
  }, []);


  return (
    
      
      <div>
      <DashBoardSidebar>
      <SearchableDynamicTable
        title="New SignUp"
        data={tableData}
        showStatusIndicator={false}
        excludeColumns = {"createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step"}
        pageSize={8}
        detailsUrl="/newsignup"
      />
      </DashBoardSidebar>
      </div>
     
   
  );
};

export default NewSignup;



