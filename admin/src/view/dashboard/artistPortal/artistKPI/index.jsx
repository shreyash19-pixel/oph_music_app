import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';

const Artist_Kpi = () => {
    const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/get_kpi_model");

      
      setTableData(res.data);
      console.log(res);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>

        <SearchableDynamicTable
        title="Artist KPI"
        data={tableData}
        showStatusIndicator={false}
        excludeColumns = {"createdAt,updatedAt,user_pass,step_status,reject_reason,personal_photo,location,current_step,rejected_step, "}
        pageSize={10}
        detailsUrl="/AddNote"
      />
      </ArtistSidebar>
      
    </div>
  )
}

export default Artist_Kpi






