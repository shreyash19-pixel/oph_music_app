  import React, { useState, useEffect } from "react";
  import axiosApi from "../../../../conf/axios";
  import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
  import ArtistSidebar from "../../../../components/ArtistSidebar";

  const Tvpublishing = () => {
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        const res = await axiosApi.get("/getAllTv");
        setTableData(res.data.data);
        console.log(res.data.data);
      };

      fetchData();
    }, []);
    return (
      <div>
        <ArtistSidebar>
          <SearchableDynamicTable
            title="Tv Publishing"
            data={tableData}
            showStatusIndicator={false}
            excludeColumns={"audio_url,video_url,created_at,updated_at"}
            pageSize={10}
            detailsUrl="/TvIndex"
            leadColumns={[
              "OPH_ID",
              "oph_id",
              "song_id",
              "song_name",
              "status",
              "reason",
              "lock",
              "Lock",
            ]}
          />
        </ArtistSidebar>
      </div>
    );
  };

  export default Tvpublishing;
