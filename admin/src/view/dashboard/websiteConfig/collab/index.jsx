import React, { useState, useEffect } from "react";
import axiosApi from "../../../../conf/axios";
import SearchableDynamicTable from "../../../../components/SearchableDynamicTable";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import { useAuth } from "../../../../auth/AuthProvider";
import { isAccountsPortalViewOnlyRole } from "../../../../utils/roles";
function formatSecondsAsHms(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

const Collab = () => {
  const { user } = useAuth();
  const viewOnly = isAccountsPortalViewOnlyRole(user?.role);
  const [tableData, setTableData] = useState([]);
  const [lastKpiRun, setLastKpiRun] = useState(null);
  const [Loading, setLoading] = useState(true);

 useEffect(() => {
   const fetchData = async () => {
     try {
       setLoading(true);
       const res = await axiosApi.get("/kpi_score");
       console.log("API Response:", res.data);

       setLastKpiRun(res.data.lastKpiRun ?? null);

       const dataObj = res.data.data; // object keyed by ophid
       let flattened = Object.values(dataObj).map((user) => {
         const ophKey =
           user.oph_id ?? user.ophid ?? user.OPH_ID ?? "";
         const { fullName, kpiScore, songs } = user;
         return {
           oph_id: ophKey,
           fullName: fullName ?? user.full_name ?? "",
           kpiScore: parseFloat(kpiScore), // ensure numeric
           totalSongs: songs?.length || 0,
         };
       });

       // Sort by kpiScore (descending)
       flattened.sort((a, b) => b.kpiScore - a.kpiScore);

       // Assign position (1-based)
       flattened = flattened.map((user, index) => ({
         ...user,
         position: index + 1,
       }));

       setTableData(flattened);
     } catch (err) {
       console.error("Error fetching KPI score:", err);
       setTableData([]);
       setLastKpiRun(null);
     } finally {
       setLoading(false);
     }
   };

   fetchData();
 }, []);


  return (
    <WebConfigSidebar>
        {viewOnly && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            View only. Collab KPI data is read-only for accounts roles.
          </div>
        )}
        {lastKpiRun && (
          <div className="mb-6 rounded-xl border border-[#0d3c44]/30 bg-white px-5 py-4 shadow-sm text-gray-800">
            <p className="text-sm font-semibold text-[#0d3c44] uppercase tracking-wide">
              Last normalization caps
            </p>
            {(lastKpiRun.run_at || lastKpiRun.artist_count != null) && (
              <p className="mt-1 text-xs text-gray-500">
                {lastKpiRun.run_at
                  ? new Date(lastKpiRun.run_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : ""}
                {lastKpiRun.run_at && lastKpiRun.artist_count != null
                  ? " · "
                  : ""}
                {lastKpiRun.artist_count != null
                  ? `${lastKpiRun.artist_count} artists in cohort`
                  : ""}
              </p>
            )}
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Traffic
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
                  {Number(lastKpiRun.max_user_traffic).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Songs
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
                  {Number(lastKpiRun.max_song_count).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Views
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
                  {Number(lastKpiRun.max_total_views).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Events
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
                  {Number(lastKpiRun.max_total_accepted_events).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Avg view duration
                </dt>
                <dd className="mt-0.5 text-base font-semibold tabular-nums text-gray-900">
                  {formatSecondsAsHms(lastKpiRun.max_avg_view_seconds)}
                </dd>
              </div>
            </dl>
          </div>
        )}
        {!lastKpiRun && !Loading && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No normalization snapshot yet. After the next KPI batch job runs,
            traffic, songs, views, events, and avg view duration caps will show
            here.
          </div>
        )}
        <SearchableDynamicTable
          title="Collab"
          data={tableData}
          showStatusIndicator={false}
          pageSize={10}
          detailsUrl="/Collab"
        />
    </WebConfigSidebar>
  );
};

export default Collab;
