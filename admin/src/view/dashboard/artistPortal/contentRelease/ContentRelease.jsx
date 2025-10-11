import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const ContentRelease = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/get-song-release-list");
        console.log(res);
        

        setTableData(res.data.data);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <ArtistSidebar>
        <SearchableDynamicTable
          title="Song Release"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          detailsUrl="/ContentRelease"
          excludeColumns={["youtube_release_time", "spotify_release_time", "apple_release_time", "instagram_release_time", "facebook_release_time", "share_url", "release_time", "youtube_url", "spotify_url", "apple_url", "instagram_url", "facebook_url"]}
        />
      </ArtistSidebar>
    </div>
  );
};

export default ContentRelease;
