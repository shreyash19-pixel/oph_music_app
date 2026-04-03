import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";

function formatSecondsAsHms(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

function fmtNum(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
}

function fmtMoney(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : String(v);
}

const CollabArtistDetail = () => {
  const { ophid } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!ophid) return;
      setLoading(true);
      setError(null);
      try {
        const res = await axiosApi.get(
          `/collab_artist_kpi/${encodeURIComponent(ophid)}`,
        );
        if (cancelled) return;
        if (res.data?.success && res.data.data) {
          setPayload(res.data.data);
        } else {
          setError(res.data?.message || "Failed to load");
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || "Failed to load",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [ophid]);

  const profile = payload?.profile;
  const songMetrics = payload?.songMetrics ?? [];
  const lastKpiRun = payload?.lastKpiRun;

  return (
    <div className="flex h-screen bg-gray-50">
      <WebConfigSidebar />
      <div className="flex-1 ml-10 overflow-auto p-6">
        <Link
          to="/Collab"
          className="inline-flex items-center text-sm font-medium text-[#0d3c44] hover:underline mb-6"
        >
          ← Back to Collab
        </Link>

        {loading && (
          <p className="text-gray-600 text-center py-16">Loading…</p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && profile && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-[#0d3c44]/20 bg-white p-6 shadow-sm">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {profile.personal_photo ? (
                  <img
                    src={profile.personal_photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No photo
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.stage_name || profile.full_name || profile.oph_id}
                </h1>
                <p className="text-gray-600 mt-1">{profile.full_name}</p>
                <p className="text-sm font-mono text-[#0d3c44] mt-2">
                  {profile.oph_id}
                </p>
                {profile.location ? (
                  <p className="text-sm text-gray-500 mt-1">{profile.location}</p>
                ) : null}
              </div>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#0d3c44] mb-4">
                Stored KPI snapshot
              </h2>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    KPI score
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {profile.kpi_score != null
                      ? Number(profile.kpi_score).toFixed(2)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Traffic
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {fmtNum(profile.kpi_user_traffic)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Song count
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {fmtNum(profile.kpi_song_count)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Total views
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {fmtNum(profile.kpi_total_views)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Accepted events
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">
                    {fmtNum(profile.kpi_total_accepted_events)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray-500">
                    Avg view duration
                  </dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums font-mono">
                    {profile.kpi_avg_view_duration || "—"}
                  </dd>
                </div>
              </dl>
            </section>

            {lastKpiRun && (
              <section className="rounded-xl border border-[#0d3c44]/30 bg-white px-5 py-4 shadow-sm">
                <h2 className="text-sm font-semibold text-[#0d3c44] uppercase tracking-wide mb-3">
                  Last normalization caps (cohort)
                </h2>
                <dl className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Traffic</dt>
                    <dd className="font-semibold tabular-nums">
                      {fmtNum(lastKpiRun.max_user_traffic)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Songs</dt>
                    <dd className="font-semibold tabular-nums">
                      {fmtNum(lastKpiRun.max_song_count)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Views</dt>
                    <dd className="font-semibold tabular-nums">
                      {fmtNum(lastKpiRun.max_total_views)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Events</dt>
                    <dd className="font-semibold tabular-nums">
                      {fmtNum(lastKpiRun.max_total_accepted_events)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Avg view duration</dt>
                    <dd className="font-semibold tabular-nums font-mono">
                      {formatSecondsAsHms(lastKpiRun.max_avg_view_seconds)}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm overflow-x-auto">
              <h2 className="text-lg font-semibold text-[#0d3c44] mb-4">
                Per-song social metrics
              </h2>
              {songMetrics.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No song_social_metrics rows for this artist.
                </p>
              ) : (
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 uppercase text-xs">
                      <th className="py-2 pr-4">Song</th>
                      <th className="py-2 pr-4">ID</th>
                      <th className="py-2 pr-4 text-right">YouTube views</th>
                      <th className="py-2 pr-4 text-right">YT engagement</th>
                      <th className="py-2 pr-4">YT avg duration</th>
                      <th className="py-2 pr-4 text-right">YT revenue</th>
                      <th className="py-2 pr-4 text-right">Insta engagement</th>
                      <th className="py-2 pr-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {songMetrics.map((row) => (
                      <tr
                        key={row.song_id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 pr-4 max-w-[200px] truncate">
                          {row.song_name || "—"}
                        </td>
                        <td className="py-2 pr-4 font-mono">{row.song_id}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmtNum(row.youtube_views)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmtNum(row.youtube_engagement)}
                        </td>
                        <td className="py-2 pr-4 font-mono whitespace-nowrap">
                          {row.youtube_avg_view_duration || "—"}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmtMoney(row.youtube_revenue)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums">
                          {fmtNum(row.insta_engagement)}
                        </td>
                        <td className="py-2 pr-4 text-gray-500 whitespace-nowrap">
                          {row.last_updated
                            ? new Date(row.last_updated).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabArtistDetail;
