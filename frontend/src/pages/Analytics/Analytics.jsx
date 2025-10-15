import { ChartArea, ChevronDown } from "lucide-react";
import Chart from "../../components/Chart/Chart";
import React,{ useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";

export default function AnalyticsDashboard() {
  const { ophid, headers } = useArtist();
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [contents, setContents] = useState([]);
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
      try {
        const response = await axiosApi.get(`/getMetricByOph?OPH_ID=${ophid}`);

        setContents(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedContentId(null);
          setSelectedContent(null);
          console.log("RES", response.data);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [ophid]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!ophid) return;
      setIsLoading(true);

      try {
        const response = await axiosApi.get(`/getMetricByOph?OPH_ID=${ophid}`);

        if (response.data.success) {
          // Store both DB and S3 metrics in state
          setContents({
            dbMetrics: response.data.data || [],
            s3Metrics: response.data.s3Metrics || [],
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

      if (response.status = 200) {
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
    .map((metric) => ({
      name: metric.song_name,
      date: metric.date || null,
      Id: metric.Id || metric.id,
      song_id: metric.song_id,
      video_url: metric.video_url,
      image_url: metric.image_url,
      credits: metric.credits,
      youtube_views: metric.youtube_views ?? metric.audio_platform_streams ?? 0,
      youtube_engagement: metric.youtube_engagement ?? 0,
      youtube_avg_view_duration: metric.youtube_avg_view_duration ?? "00:00:00",
      youtube_revenue:
        metric.youtube_revenue ?? metric.audio_platform_revenue ?? "0.00",
      insta_engagement: metric.insta_engagement ?? 0,
      Notes: metric.Notes ?? "",
      audio_platform_name: metric.audio_platform_name ?? null,
      audio_platform_streams: metric.audio_platform_streams ?? null,
      audio_platform_revenue: metric.audio_platform_revenue ?? null,
      audioDate: metric.audioDate ?? metric.updated_at ?? null,
    }));

  console.log("Combined metrics:", submitMetric);

  const inrToUsd = (inr, rate = 0.011) => inr * rate;

  const rows = Array.isArray(selectedContent)
    ? selectedContent
    : selectedContent
    ? [selectedContent]
    : [];

  const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    const parts = durationStr.split(":").map(Number);
    const [h = 0, m = 0, s = 0] = parts;
    return h * 3600 + m * 60 + s; // total seconds
  };

  const chartData = Array.isArray(selectedContent)
    ? selectedContent.map((c) => ({
        name: c.date ? new Date(c.date).toLocaleDateString() : "Unknown Date",
        value: c.youtube_views,
        valueEngagement: c.youtube_engagement,
        valueDuration: parseDuration(c.youtube_avg_view_duration),
        valueInstagram: c.insta_engagement,
      }))
    : selectedContent
    ? [
        {
          name: selectedContent.date
            ? new Date(selectedContent.date).toLocaleDateString()
            : "Unknown Date",
          value: selectedContent.youtube_views,
          valueEngagement: selectedContent.youtube_engagement,
          valueInstagram: selectedContent.insta_engagement,
          valueDuration: parseDuration(
            selectedContent.youtube_avg_view_duration
          ),
        },
      ]
    : [];

  const AudiochartData = Array.isArray(selectedContent)
    ? selectedContent.map((c) => ({
        name: c.audio_platform_name,
        date: c.audioDate
          ? new Date(c.audioDate).toLocaleDateString()
          : "Unknown Date",
        value: c.audio_platform_streams,
      }))
    : selectedContent
    ? [
        {
          name: selectedContent.audio_platform_name,
          date: selectedContent.audioDate
            ? new Date(selectedContent.audioDate).toLocaleDateString()
            : "Unknown Date",
          value: selectedContent.audio_platform_streams,
        },
      ]
    : [];

  const totalDurationSeconds = chartData.reduce(
    (sum, d) => sum + (d.valueDuration || 0),
    0
  );

  const engagementMetric = Array.isArray(selectedContent)
    ? selectedContent.reduce((sum, c) => sum + (c.youtube_engagement || 0), 0)
    : selectedContent?.youtube_engagement || 0;

  const InstagramMetric = Array.isArray(selectedContent)
    ? selectedContent.reduce((sum, c) => sum + (c.insta_engagement || 0), 0)
    : selectedContent?.insta_engagement || 0;

  const AudioMetric = Array.isArray(selectedContent)
    ? selectedContent.reduce(
        (sum, c) => sum + (c.audio_platform_streams || 0),
        0
      )
    : selectedContent?.audio_platform_streams || 0;

  const uniqueSongs = Array.from(
    new Map(submitMetric.map((c) => [c.song_id, c])).values()
  );

  // normalize to rows (array) and compute totals

  const totalRevenueINR = rows.reduce((sum, r) => {
    if (selectedStream === "Audio Platform") {
      return sum + Number(r.audio_platform_revenue ?? 0);
    } else if (selectedStream === "YouTube") {
      return sum + Number(r.youtube_revenue ?? 0);
    }
    // you can add Instagram revenue if needed
    return sum;
  }, 0);

  const filterByDuration = (data, dateField) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedDuration);
    return data.filter((d) => d[dateField] && new Date(d[dateField]) >= cutoff);
  };

  const filteredChartData = filterByDuration(chartData, "name");
  const filteredAudioChartData = filterByDuration(AudiochartData, "date");

  const getPaginatedCharts = (charts) => {
    const start = currentPage * chartsPerPage;
    return charts.slice(start, start + chartsPerPage);
  };

  const totalPages = (charts) => Math.ceil(charts.length / chartsPerPage);

  console.log("DEBUG selectedContent:", selectedContent);

  // console.log("testline", chartData.name, chartData.value);

  console.log(
    "testLine",
    AudiochartData.map((d) => ({
      date: d.date,
      value: d.value,
    }))
  );

  console.log(
    "test",
    chartData.map((d) => ({ name: d.name, value: d.valueDuration }))
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
            <div className="flex justify-between items-center">
              <h1 className="text-cyan-400 text-xl font-extrabold mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                ANALYTICS
              </h1>
              <div className="relative">
                <button
                  className="flex items-center px-4 py-2 w-[150px] bg-white/10 border border-white/30 border-cyan-200 rounded-full text-sm text-white-400 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 shadow-lg shadow-white/20"
                  onClick={(e) => {
                    e.preventDefault();
                    const selectElement =
                      e.currentTarget.querySelector("select");
                    if (selectElement) {
                      selectElement.focus();
                      selectElement.click();
                    }
                  }}
                >
                  <select
                    className="bg-transparent border-none focus:ring-0 focus:outline-none w-full"
                    value={selectedDuration}
                    onChange={(e) => {
                      setSelectedDuration(Number(e.target.value));
                      if (streams.length > 0) {
                        handleStreamChange(streams[0].content_stream_id);
                      }
                    }}
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white-400 pointer-events-none" />
                </button>
              </div>
            </div>

            {/* Song Selection and Platform */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <select
                  className="w-full appearance-none bg-gray-800/50 border border-gray-700 rounded-lg p-3 pr-10 text-gray-200 focus:outline-none focus:border-cyan-400 truncate"
                  value={selectedContent?.[0]?.song_id?.toString() ?? ""} // ✅ use id
                  onChange={(e) => {
                    const songId = parseInt(e.target.value, 10);

                    const selectedRows = submitMetric.filter(
                      (metric) => metric.song_id === songId
                    );

                    if (selectedRows.length === 0) {
                      console.error(
                        "Selected content not found in contents array"
                      );
                      return;
                    }

                    setSelectedContent(selectedRows); // ✅ update displayed data immediately
                  }}
                >
                  <option value="" disabled>
                    Select a Song
                  </option>
                  {uniqueSongs.map((uniqueContent) => (
                    <option
                      key={uniqueContent.song_id}
                      value={uniqueContent.song_id.toString()}
                    >
                      {uniqueContent.song_name || uniqueContent.name}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-200 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none border border-gray-700 rounded-lg p-3 pr-10 text-black font-bold focus:outline-none focus:border-[#5dc9de] truncate"
                  style={{ backgroundColor: "#5dc9de" }}
                  value={selectedStream || ""}
                  onChange={(e) => setSelectedStream(e.target.value)}
                >
                  <option value="" disabled>
                    Select Platform
                  </option>
                  {[
                    { key: 1, value: "YouTube" },
                    { key: 2, value: "Instagram" },
                    { key: 3, value: "Audio Platform" },
                  ].map((platform) => (
                    <option key={platform.key} value={platform.value}>
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
                    <video
                      src={videoData.video_url}
                      poster={
                        videoData?.image_url
                          ? JSON.parse(videoData.image_url)[0] // safely extract the actual URL
                          : "/assets/images/ytVideoBg.png"
                      }
                      controls
                      className="w-[400px] h-[200px] object-cover rounded-lg"
                    >
                      Sorry, your browser doesn’t support embedded videos.
                    </video>
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
                            (sum, c) => sum + (Number(c.youtube_views) || 0),
                            0
                          )
                        : Number(selectedContent?.youtube_views || 0)
                      : "--"}{" "}
                    {selectedContent ? "Views" : ""}
                  </p>

                  <p className="text-gray-400 text-sm">
                    {selectedContent?.[0]?.credits ||
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
                    <p className="text-sm text-gray-400">Generated Revenue:</p>
                    <p className="text-xl font-bold text-cyan-400">
                      ${inrToUsd(totalRevenueINR).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-xl font-bold text-cyan-400">
                      INR {totalRevenueINR.toFixed(0)}
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
                          (sum, r) => sum + (r.youtube_views || 0),
                          0
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
                      />,
                      <Chart
                        key="duration"
                        type="area"
                        data={filteredChartData.map((d) => ({
                          ...d,
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
                    chartsArray = [
                      <Chart
                        key="audio"
                        type="area"
                        data={filteredAudioChartData.map((d) => ({
                          name: d.date,
                          value: d.value,
                        }))}
                        title={AudiochartData[0]?.name || "Audio Streams"}
                        subtitle="Count in Millions"
                        metric={AudioMetric}
                        colors={["#22d3ee"]}
                      />,
                    ];
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
                                Math.min(prev + 1, totalPages(chartsArray) - 1)
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
