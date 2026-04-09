import { ChartArea, ChevronDown } from "lucide-react";
import Chart from "../../components/Chart/Chart";
import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import CustomVideoPlayer from "../../components/CustomVideoPlayer/CustomVideoPlayer";
import NavbarRight from "../../components/Navbar/NavbarRight";
import "./styles.css";

const AUDIO_CHART_COLORS = [
  "#22d3ee",
  "#8959D3",
  "#34a853",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

function sameSongId(metricSongId, selectedId) {
  if (metricSongId == null || selectedId == null) return false;
  const a = Number(metricSongId);
  const b = Number(selectedId);
  return Number.isFinite(a) && Number.isFinite(b) && a === b;
}

/** API/DB often returns numeric fields as strings; `0 + "1500"` becomes `"01500"` (wrong). */
function toNum(v) {
  if (v == null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const AUDIO_TZ = "Asia/Kolkata";

/** YYYY-MM in AUDIO_TZ for sorting / bucketing. */
function audioMonthKeyFromDate(isoOrDate) {
  if (isoOrDate == null || isoOrDate === "") return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AUDIO_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  return y && m ? `${y}-${m}` : "";
}

/** X-axis label: month + year only (no day). */
function audioMonthLabelFromKey(monthKey) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return "Unknown";
  const [ys, ms] = monthKey.split("-");
  const y = Number(ys);
  const m = Number(ms);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-GB", {
    timeZone: AUDIO_TZ,
    month: "short",
    year: "numeric",
  });
}

function prevAudioMonthKey(monthKey) {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return "";
  const [y0, m0] = monthKey.split("-").map(Number);
  let m = m0 - 1;
  let y = y0;
  if (m < 1) {
    m = 12;
    y -= 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Latest snapshot per calendar month (same platform). */
function aggregateAudioPointsByMonth(points) {
  const byMonth = new Map();
  for (const p of points) {
    const key = p.monthKey || "";
    if (!key) continue;
    const t = p.date ? new Date(p.date).getTime() : 0;
    const cur = byMonth.get(key);
    if (!cur || t >= new Date(cur.date).getTime()) {
      byMonth.set(key, {
        monthKey: key,
        monthLabel: p.monthLabel || audioMonthLabelFromKey(key),
        value: toNum(p.value),
        date: p.date,
      });
    }
  }
  return Array.from(byMonth.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
}

/** First month with streams > 0: prepend previous month @ 0 for a visible ramp. */
function audioChartDataWithBaseline(monthPoints) {
  if (!monthPoints.length) return [];
  const sorted = [...monthPoints].sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
  const mapped = sorted.map((p) => ({
    name: p.monthLabel,
    value: toNum(p.value),
    monthKey: p.monthKey,
  }));
  const first = mapped[0];
  if (first.value <= 0) {
    return mapped.map(({ name, value }) => ({ name, value }));
  }
  const prevKey = prevAudioMonthKey(first.monthKey);
  const baselineLabel = prevKey ? audioMonthLabelFromKey(prevKey) : "Start";
  return [
    { name: baselineLabel, value: 0 },
    ...mapped.map(({ name, value }) => ({ name, value })),
  ];
}

export default function AnalyticsDashboard() {
  const { ophid, headers } = useArtist();
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [contents, setContents] = useState({
    dbMetrics: [],
    s3Metrics: [],
  });
  const [selectedContent, setSelectedContent] = useState("");
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("");
  const [totalViews, setTotalViews] = useState(0);
  const [totalEngagement, setTotalEngagement] = useState(0);
  const [avgDuration, setAvgDuration] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [videoData, setVideoData] = useState(null);
  const [exchangeRate] = useState(1 / 92.7); // Fixed conversion rate: 1 USD = 92.7 INR, so 1 INR = 0.01079 USD
  const chartsPerPage = 3;

  const [analyticsData, setAnalyticsData] = useState({
    viewsData: [],
    engagementData: [],
    durationData: [],
    incomeData: [],
  });
  const [revenue, setRevenue] = useState({
    usd: 0,
    inr: 0,
  });
  const [durationOptions] = useState([
    { label: "Last 7 Day", value: 7 },
    { label: "Last 10 Days", value: 10 },
    { label: "Last 15 Days", value: 15 },
    { label: "Last 30 Days", value: 30 },
  ]);
  const [selectedDuration, setSelectedDuration] = useState(7);

  useEffect(() => {
    const fetchContent = async () => {
      if (!ophid) return;
      setIsLoading(true);

      try {
        const response = await axiosApi.get(`/getMetricByOph?OPH_ID=${ophid}`);

        if (response.data.success) {
          const db = response.data.data;
          setContents({
            dbMetrics: Array.isArray(db) ? db : [],
            s3Metrics: Array.isArray(response.data.s3Metrics)
              ? response.data.s3Metrics
              : [],
          });

          // Optionally reset selection
          setSelectedContentId(null);
          setSelectedContent(null);

          console.log("Fetched content:", response.data);
        } else {
          console.warn("No metrics found for OPH_ID:", ophid);
          setContents({ dbMetrics: [], s3Metrics: [] });
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setContents({ dbMetrics: [], s3Metrics: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [ophid]);

  useEffect(() => {
    const fetchBySongId = async () => {
      if (!selectedContent || !selectedContent[0]?.song_id) return; // ✅ Wait until a song is selected

      const songId = selectedContent[0].song_id;

      try {
        console.log("Fetching video data for song:", songId);
        setIsLoading(true);

        const response = await axiosApi.get(`/getVideoyId/${songId}`);
        console.log("res", response.data);

        if (response.status === 200) {
          setVideoData(response.data); // ✅ store separately for reuse
          console.log("✅ Fetched content by song ID:", response.data);
        } else {
          console.warn("⚠️ No data found for this song ID:", songId);
          setVideoData(null);
        }
      } catch (error) {
        console.error("❌ Error fetching data by song_id:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBySongId();
  }, [selectedContent]);

  console.log("Video Data Available:", videoData);

  const submitMetric = (contents.dbMetrics || [])
    .concat(contents.s3Metrics || [])
    .map((metric) => {
      const streams =
        metric.audio_platform_streams != null &&
        metric.audio_platform_streams !== ""
          ? Number(metric.audio_platform_streams)
          : null;
      const revenueRaw = metric.audio_platform_revenue;
      const revenueNum =
        revenueRaw != null && revenueRaw !== "" ? Number(revenueRaw) : null;
      return {
        name: metric.song_name,
        date: metric.updated_at || null,
        Id: metric.Id || metric.id,
        song_id: metric.song_id,
        video_url: metric.video_url,
        image_url: metric.image_url,
        credits: metric.credits,
        youtube_views: toNum(metric.youtube_views),
        youtube_engagement: toNum(metric.youtube_engagement),
        youtube_avg_view_duration:
          metric.youtube_avg_view_duration ?? "00:00:00",
        youtube_revenue: metric.youtube_revenue ?? "0.00",
        insta_engagement: toNum(metric.insta_engagement),
        Notes: metric.Notes ?? "",
        audio_platform_name: metric.audio_platform_name ?? null,
        audio_platform_streams: Number.isFinite(streams) ? streams : null,
        audio_platform_revenue: Number.isFinite(revenueNum) ? revenueNum : null,
        audioDate:
          metric.audioDate ?? metric.updated_at ?? metric.created_at ?? null,
      };
    });

  console.log("Combined metrics:", submitMetric);

  const inrToUsd = (inr) => inr * exchangeRate;

  const rows = Array.isArray(selectedContent)
    ? selectedContent
    : selectedContent
      ? [selectedContent]
      : [];

  const audioChartRows = rows.filter(
    (c) =>
      toNum(c.audio_platform_streams) > 0 &&
      c.audio_platform_name != null &&
      String(c.audio_platform_name).trim() !== "",
  );

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":").map(Number);
    const [h = 0, m = 0, s = 0] = parts;
    return h * 3600 + m * 60 + s; // total seconds
  };

  const chartData = Array.isArray(selectedContent)
    ? (() => {
        const dataMap = new Map();
        selectedContent.forEach((c) => {
          const dateKey = c.date
            ? new Date(c.date).toLocaleDateString("en-GB", {
                timeZone: "Asia/Kolkata",
              })
            : "Unknown Date";
          const existing = dataMap.get(dateKey);
          const newData = {
            name: dateKey,
            date: c.date,
            value: c.youtube_views || 0,
            valueEngagement: c.youtube_engagement || 0,
            valueDuration: parseDuration(c.youtube_avg_view_duration),
            valueInstagram: c.insta_engagement || 0,
          };

          if (
            !existing ||
            new Date(c.date).getTime() > new Date(existing.date).getTime()
          ) {
            dataMap.set(dateKey, newData);
          }
        });
        return Array.from(dataMap.values()).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
      })()
    : selectedContent
      ? [
          {
            name: selectedContent.date
              ? new Date(selectedContent.date).toLocaleDateString("en-GB", {
                  timeZone: "Asia/Kolkata",
                })
              : "Unknown Date",
            date: selectedContent.date,
            value: selectedContent.youtube_views,
            valueEngagement: selectedContent.youtube_engagement,
            valueInstagram: selectedContent.insta_engagement,
            valueDuration: parseDuration(
              selectedContent.youtube_avg_view_duration,
            ),
          },
        ]
      : [];

  const AudiochartData = audioChartRows.map((c) => {
    const monthKey = audioMonthKeyFromDate(c.audioDate);
    return {
      name: c.audio_platform_name,
      date: c.audioDate,
      monthKey,
      monthLabel: monthKey ? audioMonthLabelFromKey(monthKey) : "Unknown",
      value: Number(c.audio_platform_streams) || 0,
    };
  });

  const totalDurationSeconds = chartData.reduce(
    (sum, d) => sum + toNum(d.valueDuration),
    0,
  );

  const engagementMetric = Array.isArray(selectedContent)
    ? selectedContent.reduce((sum, c) => sum + toNum(c.youtube_engagement), 0)
    : toNum(selectedContent?.youtube_engagement);

  const InstagramMetric = Array.isArray(selectedContent)
    ? selectedContent.reduce((sum, c) => sum + toNum(c.insta_engagement), 0)
    : toNum(selectedContent?.insta_engagement);

  /** Dedupe by string id — Map treats 23 and "23" as different keys, which duplicated <option> keys. */
  const uniqueSongs = Array.from(
    new Map(
      submitMetric.flatMap((c) => {
        const sid = c.song_id;
        if (sid != null && String(sid).trim() !== "") {
          return [[String(sid), c]];
        }
        const fid = c.Id ?? c.id;
        if (fid != null && String(fid).trim() !== "") {
          return [[`id-${String(fid)}`, { ...c, song_id: fid }]];
        }
        return [];
      }),
    ).values(),
  );

  // normalize to rows (array) and compute totals

  const totalRevenueINR = rows.reduce((sum, r) => {
    if (selectedStream === "Audio Platform") {
      return sum + toNum(r.audio_platform_revenue);
    }
    if (selectedStream === "YouTube") {
      return sum + toNum(r.youtube_revenue);
    }
    return sum;
  }, 0);

  const filterByDuration = (data, dateField) => {
    const currentDate = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(currentDate.getDate() - selectedDuration);

    return data.filter((d) => {
      if (!d[dateField]) return false;
      const itemDate = new Date(d[dateField]);
      return itemDate >= cutoffDate && itemDate <= currentDate;
    });
  };

  const filteredChartData = filterByDuration(chartData, "date");
  const filteredAudioChartData = filterByDuration(AudiochartData, "date");

  /** One chart per audio platform (S3 / DB rows), sorted by total streams desc. */
  const audioPlatformChartGroups = (() => {
    const byPlatform = new Map();
    for (const d of filteredAudioChartData) {
      const label =
        d.name != null && String(d.name).trim() !== ""
          ? String(d.name).trim()
          : "Unknown platform";
      if (!byPlatform.has(label)) byPlatform.set(label, []);
      byPlatform.get(label).push(d);
    }
    for (const pts of byPlatform.values()) {
      pts.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    return Array.from(byPlatform.entries())
      .map(([label, pts]) => [label, aggregateAudioPointsByMonth(pts)])
      .sort((a, b) => {
        const latest = (arr) =>
          arr.length ? toNum(arr[arr.length - 1].value) : 0;
        return latest(b[1]) - latest(a[1]);
      });
  })();

  console.log("🔍 FILTER RESULTS:", {
    originalChartData: chartData.length,
    filteredChartData: filteredChartData.length,
    selectedStream,
    data: filteredChartData,
  });

  const getPaginatedCharts = (charts) => {
    const start = currentPage * chartsPerPage;
    return charts.slice(start, start + chartsPerPage);
  };

  const totalPages = (charts) => Math.ceil(charts.length / chartsPerPage);

  console.log("DEBUG selectedContent:", selectedContent);

  console.log(
    "testLine",
    AudiochartData.map((d) => ({
      date: d.date,
      value: d.value,
    })),
  );

  console.log(
    "test",
    chartData.map((d) => ({ name: d.name, value: d.valueDuration })),
  );

  console.log(chartData);

  return (
    <>
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-cyan-400">Loading Analytics...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}
      {!isLoading && !error && (
        <div className="min-h-[calc(100vh-70px)] px-8 py-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center  mb-4">
              <h2 className="text-[#00B8D9] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                ANALYTICS
              </h2>
              <NavbarRight />
            </div>

            <div className="flex justify-end">
              <button
                className="flex items-center px-4 py-2 w-[150px]   text-sm text-white-400 appearance-none focus:outline-none "
                onClick={(e) => {
                  e.preventDefault();
                  const selectElement = e.currentTarget.querySelector("select");
                  if (selectElement) {
                    selectElement.focus();
                    selectElement.click();
                  }
                }}
              >
                <select
                  className="w-full appearance-none bg-[#191D27]/80 border border-gray-700 rounded-lg p-3 pr-10 text-gray-200 focus:outline-none focus:border-[#5dc9de]"
                  value={selectedDuration}
                  onChange={(e) => {
                    setSelectedDuration(Number(e.target.value));
                    if (streams.length > 0) {
                      handleStreamChange(streams[0].content_stream_id);
                    }
                  }}
                >
                  {durationOptions.map((option) => (
                    <option
                      key={`duration-${option.value}`}
                      value={option.value}
                      className="bg-[#191D27] text-gray-200"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white-400 pointer-events-none" />
              </button>
            </div>

            {/* Song Selection and Platform */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <select
                  className="w-full appearance-none bg-[#191D27]/80 border border-gray-700 rounded-lg p-3 pr-10 text-gray-200 focus:outline-none focus:border-cyan-400"
                  value={selectedContent?.[0]?.song_id?.toString() ?? ""}
                  onChange={(e) => {
                    const songId = parseInt(e.target.value, 10);

                    const selectedRows = submitMetric.filter((metric) =>
                      sameSongId(metric.song_id, songId),
                    );

                    if (selectedRows.length === 0) {
                      console.error(
                        "Selected content not found in contents array",
                      );
                      return;
                    }

                    setSelectedContent(selectedRows);
                  }}
                >
                  <option
                    value=""
                    disabled
                    className="bg-[#191D27] text-gray-400"
                  >
                    Select a Song
                  </option>

                  {uniqueSongs.map((uniqueContent, songIdx) => (
                    <option
                      key={`song-${String(uniqueContent.song_id)}-${songIdx}`}
                      value={String(uniqueContent.song_id)}
                      className="bg-[#191D27] text-gray-200"
                    >
                      {uniqueContent.song_name || uniqueContent.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none bg-[#191D27]/80 border border-gray-700 rounded-lg p-3 pr-10 text-gray-200 font-medium focus:outline-none focus:border-[#5dc9de]"
                  value={selectedStream || ""}
                  onChange={(e) => setSelectedStream(e.target.value)}
                >
                  <option
                    value=""
                    disabled
                    className="bg-[#191D27] text-gray-400"
                  >
                    Select Platform
                  </option>

                  {[
                    { key: "yt", value: "YouTube" },
                    { key: "ig", value: "Instagram" },
                    { key: "audio", value: "Audio Platform" },
                  ].map((platform) => (
                    <option
                      key={platform.key}
                      value={platform.value}
                      className="bg-[#191D27] text-gray-200"
                    >
                      {platform.value}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black pointer-events-none" />
              </div>
            </div>

            {/* Video Preview */}
            {selectedStream !== "Audio Platform" && (
              <div className="overflow-hidden flex items-stretch justify-start">
                <div className="relative">
                  {videoData?.video_url ? (
                    <CustomVideoPlayer
                      src={videoData.video_url}
                      poster={
                        videoData?.image_url
                          ? JSON.parse(videoData.image_url)[0]
                          : "/assets/images/ytVideoBg.png"
                      }
                      className="w-[400px] h-[200px] object-cover rounded-lg"
                      pauseOtherVideos={true}
                    />
                  ) : (
                    <img
                      src={
                        videoData?.image_url
                          ? JSON.parse(videoData.image_url)[0]
                          : "/assets/images/ytVideoBg.png"
                      }
                      alt="Video thumbnail"
                      className="w-[400px] h-[200px] object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="px-4 py-1">
                  <h3 className="text-lg font-semibold">
                    {selectedContent?.[0]?.song_name ||
                      selectedContent?.[0]?.name ||
                      "No content selected"}
                  </h3>

                  <p className="text-sm text-cyan-400">
                    {selectedContent
                      ? Array.isArray(selectedContent)
                        ? selectedContent.reduce(
                            (sum, c) => sum + toNum(c.youtube_views),
                            0,
                          )
                        : Number(selectedContent?.youtube_views || 0)
                      : "--"}{" "}
                    {selectedContent ? "Views" : ""}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {videoData?.credits ||
                      selectedContent?.[0]?.credits ||
                      "No description available"}
                  </p>
                </div>
              </div>
            )}

            {/* Revenue Section */}
            {(selectedStream === "YouTube" ||
              selectedStream === "Audio Platform") && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400">
                      Generated Revenue (USD):
                    </p>
                    <p className="text-xl font-bold text-cyan-400">
                      ${inrToUsd(totalRevenueINR).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-sm text-gray-400">
                      Generated Revenue (INR):
                    </p>
                    <p className="text-xl font-bold text-cyan-400">
                      ₹{totalRevenueINR}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            {/* Charts */}
            <div className="space-y-6">
              {selectedStream &&
                rows.length > 0 &&
                (() => {
                  let chartsArray = [];

                  if (selectedStream === "YouTube") {
                    chartsArray = [
                      <Chart
                        key="views"
                        type="line"
                        data={filteredChartData.map((d) => ({
                          name: d.name,
                          value: d.value,
                        }))}
                        title="Views"
                        subtitle="Count in Millions"
                        metric={rows.reduce(
                          (sum, r) => sum + toNum(r.youtube_views),
                          0,
                        )}
                        colors={["#22d3ee"]}
                      />,
                      <Chart
                        key="engagement"
                        type="bar"
                        data={filteredChartData.map((d) => ({
                          name: d.name,
                          value: d.valueEngagement,
                        }))}
                        title="Engagement"
                        subtitle="Count in Millions"
                        metric={engagementMetric}
                        colors={["#8959D3"]}
                        showLegend={true}
                        legendLabel={
                          selectedContent?.[0]?.song_name ||
                          selectedContent?.[0]?.name ||
                          "Song"
                        }
                      />,
                      <Chart
                        key="duration"
                        type="area"
                        data={filteredChartData.map((d) => ({
                          name: d.name,
                          value: d.valueDuration,
                        }))}
                        title="Average View Duration"
                        subtitle="Total Seconds"
                        metric={totalDurationSeconds}
                        colors={["#34a853"]}
                      />,
                    ];
                  }

                  if (selectedStream === "Instagram") {
                    chartsArray = [
                      <Chart
                        key="instagram"
                        type="bar"
                        data={filteredChartData.map((d) => ({
                          name: d.name,
                          value: d.valueInstagram,
                        }))}
                        title="Instagram Engagement"
                        subtitle="Count in Millions"
                        metric={InstagramMetric}
                        colors={["#22d3ee"]}
                      />,
                    ];
                  }

                  if (selectedStream === "Audio Platform") {
                    chartsArray = audioPlatformChartGroups
                      .filter(([, pts]) => pts.length > 0)
                      .map(([platformLabel, points], idx) => (
                        <Chart
                          key={`audio-${platformLabel}-${idx}`}
                          type="area"
                          data={audioChartDataWithBaseline(points)}
                          title={platformLabel}
                          subtitle="Streams by month"
                          metric={
                            points.length
                              ? toNum(points[points.length - 1].value)
                              : 0
                          }
                          yFromZero
                          colors={[
                            AUDIO_CHART_COLORS[idx % AUDIO_CHART_COLORS.length],
                          ]}
                        />
                      ));
                  }

                  const paginatedCharts = getPaginatedCharts(chartsArray);

                  return (
                    <>
                      {paginatedCharts.map((chart, idx) => (
                        <div key={idx}>{chart}</div>
                      ))}

                      {chartsArray.length > chartsPerPage && (
                        <div className="flex justify-between mt-4">
                          <button
                            disabled={currentPage === 0}
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 0))
                            }
                            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            disabled={
                              currentPage >= totalPages(chartsArray) - 1
                            }
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages(chartsArray) - 1),
                              )
                            }
                            className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
