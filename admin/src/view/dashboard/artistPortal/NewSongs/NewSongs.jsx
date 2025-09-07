import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";

const NewSongs = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/get-special-artist-songs-list");

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
          title="Special artist songs"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          detailsUrl="/special-artist-songs"
          excludeColumns={"date,proof,audio_url"}
        />
      </ArtistSidebar>
    </div>
  );
};

export default NewSongs;
