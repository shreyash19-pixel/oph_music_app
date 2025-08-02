import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';


const Content_Analysis = () => {
   const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/allanalytics");

      
      setTableData(res.data);
      console.log(res.data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>
         <SearchableDynamicTable
        title="Content Analysis"
        data={tableData}
        showStatusIndicator={false}
        includeColumns={"OPH_ID,song_id,song_name"}
        pageSize={10}
        detailsUrl="/Content_Analysis"
      />
      </ArtistSidebar>
      
    </div>
  )
  
}

export default Content_Analysis
