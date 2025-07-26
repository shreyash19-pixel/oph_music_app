import React,{useState,useEffect} from 'react'
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';

const Content_Manage = () => {
  const [tableData, setTableData] = useState([]);
  
    useEffect(() => {
      const fetchData = async () => {
        console.log("calling");
        
        const res = await axiosApi.get("/approved-songs");
        console.log("api success");
        
  
        
        setTableData(res.data.songs);
        console.log(res.data.data);
      };
  
      fetchData();
    }, []);
    return (
      <div>
        <ArtistSidebar>
           <SearchableDynamicTable
          title="Manage Content"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          excludeColumns={"availability_on_music_platform, current_page,song_register_journey,audio_song_name,language,genre,sub_genre,mood,lyrics,primary_artist,featuring,lyricist,composer,producer,audio_url,audio_reject_reason,audio_status,credits,image_url,video_url,created_at,video_reject_reason,video_status"}
          detailsUrl="/ContentManage"
        />
        </ArtistSidebar>
        
      </div>
    )
}

export default Content_Manage
