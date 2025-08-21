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
          console.log("RES", response.data.data);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [ophid]);

  const submittedMetric =
    contents.length > 0
      ? contents.map((metric) => ({
          name: metric.song_name,
          date: metric.date,
          Id: metric.Id,
          song_id: metric.song_id,
          youtube_views: metric.youtube_views,
          youtube_engagement: metric.youtube_engagement,
          youtube_avg_view_duration: metric.youtube_avg_view_duration,
          youtube_revenue: metric.youtube_revenue,
          insta_engagement: metric.insta_engagement,
          Notes: metric.Notes,
        }))
      : null;

  console.log("s", submittedMetric);

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
        valueInstagram: c.insta_engagement
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
  
  const uniqueSongs = Array.from(
    new Map(contents.map((c) => [c.song_id, c])).values()
  );

  // normalize to rows (array) and compute totals

  const totalRevenueINR = rows.reduce(
    (sum, r) => sum + Number(r.youtube_revenue ?? 0),
    0
  );

  console.log("DEBUG selectedContent:", selectedContent);

  // console.log("testline", chartData.name, chartData.value);

  console.log(
    "testLine",
    chartData.map((d) => ({ name: d.name, value: d.value }))
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

                    const selectedRows = contents.filter(
                      (content) => content.song_id === songId
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
            <div className="overflow-hidden flex items-stretch justify-start">
              <div className="relative">
                <img
                  src={
                    selectedContent?.thumbnails
                      ? selectedContent?.thumbnails[0]
                      : "/assets/images/ytVideoBg.png"
                  }
                  alt="Video thumbnail"
                  className="w-[400px] h-[200px] object-cover rounded-lg"
                />
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
                  {selectedContent?.bio || "No description available"}
                </p>
              </div>
            </div>

            {/* Revenue Section */}
            <div className="bg-gray-800/50 rounded-lg p-4">
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

            {/* Charts */}
            <div className="space-y-6">
              {/* Views chart */}
              {selectedStream === "YouTube" && (
                <Chart
                  type="line"
                  data={chartData.map((d) => ({
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
                />
              )}

              {selectedStream === "YouTube" && (
                <Chart
                  type="bar"
                  data={chartData.map((d) => ({
                    name: d.name,
                    value: d.valueEngagement,
                  }))}
                  title="Engagement"
                  subtitle="Count in Millions"
                  metric={engagementMetric}
                  colors={["#8959D3"]}
                />
              )}

              {selectedStream === "YouTube" && (
                <Chart
                  type="area"
                  data={chartData.map((d) => ({
                    ...d,
                    value: d.valueDuration, // numeric for chart
                  }))}
                  title="Average View Duration"
                  subtitle="Total Seconds"
                  metric={totalDurationSeconds} // <-- plain number (e.g., 324000)
                  colors={["#34a853"]}
                />
              )}

              {selectedStream === "Instagram" && (
                <Chart
                  type="bar"
                  data={chartData.map((d) => ({
                    name: d.name,
                    value: d.valueInstagram,
                  }))}
                  title="Instagram"
                  subtitle="Count in Millions"
                  metric={InstagramMetric}
                  colors={["#22d3ee"]}
                />
              )}

              {selectedStream === "Audio Platform" && (
                <Chart
                  type="bar"
                  data={chartData.map((d) => ({
                    name: d.name,
                    value: d.valueInstagram,
                  }))}
                  title="Instagram"
                  subtitle="Count in Millions"
                  metric={InstagramMetric}
                  colors={["#22d3ee"]}
                />
              )}

              {/* <Chart
                type="area"
                data={analyticsData.incomeData}
                title="Income"
                subtitle="In Rupees"
                metric={`₹${totalIncome.toLocaleString()}`}
                colors={["#22c55e"]}
              /> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
