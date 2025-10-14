import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const ContentRelease = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let res = await axiosApi.get("/get-song-release-list");

        res = res.data.data.map((item) => {
          if ("release_date" in item) {
            return {
              ...item,
              release_date: item.release_date
                ? new Date(item.release_time).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "N/A",
            };
          }
          // If the key doesn't exist, return item as is
          return item;
        });

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
          excludeColumns={[
            "youtube_release_time",
            "spotify_release_time",
            "apple_release_time",
            "instagram_release_time",
            "facebook_release_time",
            "share_url",
            "release_time",
            "youtube_url",
            "spotify_url",
            "apple_url",
            "instagram_url",
            "facebook_url",
          ]}
        />
      </ArtistSidebar>
    </div>
  );
};

export default ContentRelease;
