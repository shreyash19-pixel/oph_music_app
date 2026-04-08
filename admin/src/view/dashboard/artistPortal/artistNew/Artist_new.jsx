import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useAuth } from "../../../../auth/AuthProvider";

/** Columns hidden on /artist/new (unified queue includes professional/documentation step fields). */
const artistNewExcludeColumns = [
  "createdAt",
  "updatedAt",
  "user_pass",
  "step_status",
  "reject_reason",
  "professional_step_status",
  "professional_reject_reason",
  "documentation_step_status",
  "documentation_reject_reason",
  "personal_photo",
  "location",
  "current_step",
  "rejected_step",
  "traffic",
  "artist_story",
  "artist_story_video",
  "Notes",
  "registration_payment_status",
  "registration_payment_reject_reason",
];

const sortByFormFill = (rows) =>
  [...(rows || [])].sort((a, b) => (b.form_fill_count || 0) - (a.form_fill_count || 0));

const Artist_new = () => {
  const [tableData, setTableData] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.role) return;

    const fetchData = async () => {
      try {
        const res = await axiosApi.get("/new-artist-unified-queue");
        setTableData(sortByFormFill(res.data.userDetails || []));
      } catch (error) {
        console.error("Error fetching new artist queue:", error);
        setTableData([]);
      }
    };

    fetchData();
  }, [user?.role]);

  return (
    <div>
      <ArtistSidebar>
        <div className="space-y-10">
          <SearchableDynamicTable
            title="New Artist"
            data={tableData}
            showStatusIndicator={false}
            excludeColumns={artistNewExcludeColumns}
            pageSize={10}
            detailsUrl="/ArtistNew"
            leadColumns={["oph_id", "OPH_ID"]}
          />
        </div>
      </ArtistSidebar>
    </div>
  );
};

export default Artist_new;
