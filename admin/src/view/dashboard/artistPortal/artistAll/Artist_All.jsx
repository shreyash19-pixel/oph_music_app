import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';
import { all } from 'axios';


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
        excludeColumns = {"createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step"}
        pageSize={10}
        detailsUrl="/ArtistAll"
      />
      </ArtistSidebar>
      
    </div>
  )
  
}

export default Artist_All
