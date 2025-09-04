import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";

const Collab = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/kpi_score");
        console.log("API Response:", res.data);

        const dataObj = res.data.data; // your object keyed by ophid
        const flattened = [];

        Object.values(dataObj).forEach((user) => {
          const { ophid, fullName, kpiScore, songs } = user;
          songs.forEach((song) => {
            flattened.push({
              ophid,
              fullName,
              kpiScore,
              songId: song.songId,
              songName: song.songName,
              primaryArtist: song.primaryArtist,
              audioUrl: song.audioUrl,
              secondaryArtist: song.secondaryArtist,
            });
          });
        });

        setTableData(flattened);
      } catch (err) {
        console.error("Error fetching KPI score:", err);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-10 overflow-auto">
        <SearchableDynamicTable
          title="Collab"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default Collab;
