import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

const artistTableExcludeColumns = [
  "createdAt",
  "updatedAt",
  "user_pass",
  "step_status",
  "reject_reason",
  "personal_photo",
  "location",
  "current_step",
  "rejected_step",
  "traffic",
  "artist_story",
  "artist_story_video",
  "Notes",
];

/** Same as new-artist list but keep profile step / reason visible for rejections */
const rejectedOnboardingExcludeColumns = artistTableExcludeColumns.filter(
  (c) => c !== "step_status" && c !== "reject_reason"
);

const sortByFormFill = (rows) =>
  [...(rows || [])].sort((a, b) => (b.form_fill_count || 0) - (a.form_fill_count || 0));

const Artist_new = () => {
  const [tableData, setTableData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const { user } = useAuth();

  const isSalesMember = user?.role === ROLES.SALES_MEMBER;
  /** Second table: sales head (and super admin) see rejected queue in addition to under-review list */
  const showRejectedSecondTable =
    user?.role === ROLES.SALES_HEAD || user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!user?.role) return;

    const fetchData = async () => {
      try {
        const url = isSalesMember
          ? "/any-rejected-onboarding"
          : "/any-under-review";
        const res = await axiosApi.get(url);
        setTableData(sortByFormFill(res.data.userDetails || []));
      } catch (error) {
        if (error.response?.status === 404) {
          setTableData([]);
        } else {
          console.error("Error fetching data:", error);
          setTableData([]);
        }
      }
    };

    fetchData();
  }, [user?.role, isSalesMember]);

  useEffect(() => {
    if (!showRejectedSecondTable) {
      setRejectedData([]);
      return;
    }

    const fetchRejected = async () => {
      try {
        const res = await axiosApi.get("/any-rejected-onboarding");
        setRejectedData(sortByFormFill(res.data.userDetails || []));
      } catch (e) {
        setRejectedData([]);
      }
    };

    fetchRejected();
  }, [showRejectedSecondTable]);

  return (
    <div>
      <ArtistSidebar>
        <div className="space-y-10">
          <SearchableDynamicTable
            title="New Artist"
            data={tableData}
            showStatusIndicator={false}
            excludeColumns={
              isSalesMember
                ? rejectedOnboardingExcludeColumns
                : artistTableExcludeColumns
            }
            pageSize={10}
            detailsUrl="/ArtistNew"
          />
          {showRejectedSecondTable && rejectedData.length > 0 && (
            <SearchableDynamicTable
              title={null}
              showSearch={false}
              data={rejectedData}
              showStatusIndicator={false}
              excludeColumns={rejectedOnboardingExcludeColumns}
              pageSize={10}
              detailsUrl="/ArtistNew"
            />
          )}
        </div>
      </ArtistSidebar>
    </div>
  );
};

export default Artist_new;
