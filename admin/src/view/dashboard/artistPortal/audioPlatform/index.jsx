import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';

const AudioPlatform = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axiosApi.get("/get_song_metrics");

      
      setTableData(res.data.data);
      console.log(res.data);
    };

    fetchData();
  }, []);
  return (
    <div>
      <ArtistSidebar>
         <SearchableDynamicTable
        title="Audio Platform"
        data={tableData}
        showStatusIndicator={false}
        // includeColumns={"OPH_ID,song_id,song_name"}
        excludeColumns={"id,song_id,audio_platform_name,audio_platform_streams,audio_platform_revenue,updated_at"}
        pageSize={10}
        detailsUrl="/Audio_metrics"
        detailsPrefer="song" // Use "song" to prefer song_id in details navigation
      />
      </ArtistSidebar>
      
    </div>
  )
}

export default AudioPlatform
