import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import ArtistSidebar from "../../../../components/ArtistSidebar";
import { useAuth } from "../../../../auth/AuthProvider";
import { ROLES } from "../../../../utils/roles";

/** Columns hidden on /artist/new for both under-review and rejected-onboarding lists */
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
];

const sortByFormFill = (rows) =>
  [...(rows || [])].sort((a, b) => (b.form_fill_count || 0) - (a.form_fill_count || 0));

const Artist_new = () => {
  const [tableData, setTableData] = useState([]);
  const [rejectedData, setRejectedData] = useState([]);
  const { user } = useAuth();

  const isSalesMember = user?.role === ROLES.SALES_MEMBER;
  const isSalesHead = user?.role === ROLES.SALES_HEAD;
  /** Sales head / member: only artists with personal, professional, or documentation rejected */
  const useRejectedOnboardingOnly = isSalesMember || isSalesHead;
  /** Super admin: under-review list plus optional second table of rejected onboarding */
  const showRejectedSecondTable = user?.role === ROLES.SUPER_ADMIN;

  useEffect(() => {
    if (!user?.role) return;

    const fetchData = async () => {
      try {
        const url = useRejectedOnboardingOnly
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
  }, [user?.role, useRejectedOnboardingOnly]);

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
            excludeColumns={artistNewExcludeColumns}
            pageSize={10}
            detailsUrl="/ArtistNew"
          />
          {showRejectedSecondTable && rejectedData.length > 0 && (
            <SearchableDynamicTable
              title={null}
              showSearch={false}
              data={rejectedData}
              showStatusIndicator={false}
              excludeColumns={artistNewExcludeColumns}
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
