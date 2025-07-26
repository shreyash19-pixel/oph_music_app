import React, { useState, useEffect } from 'react';
import axiosApi from '../../../../conf/axios';
import SearchableDynamicTable from '../../../../components/SearchableDynamicTable';
import ArtistSidebar from '../../../../components/ArtistSidebar';

const Content_New = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("calling");

        const res = await axiosApi.get("/under-review-songs");
        console.log("api success");

        const formattedData = res.data.data.map(item => {
          // Assuming the date field is named 'date' or similar — update key accordingly
          return {
            ...item,
            // Format all ISO strings to "DD MMM YYYY" (like 27 Jul 2025)
            release_date: item.release_date
              ? new Date(item.release_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              : null,
          };
        });

        setTableData(formattedData);
        console.log(formattedData);
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
          title="New Content"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          excludeColumns="availability_on_music_platform,current_page,status,reject_reason,Lyrics_services"
          detailsUrl="/ContentNew"
        />
      </ArtistSidebar>
    </div>
  );
};

export default Content_New;
