import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import WebConfigSidebar from "../../../../components/WebConfigSidebar";


const EventParticipation = () => {
   const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/getParticipant");
      setTableData(res.data.data);
      console.log(res.data.data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <SearchableDynamicTable
        title="Event Participation"
        data={tableData}
        showStatusIndicator={false}
        pageSize={10}
      />
    </div>
  );
  
}

export default EventParticipation;
