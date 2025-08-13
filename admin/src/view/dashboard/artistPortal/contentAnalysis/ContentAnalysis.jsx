import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import toast from "react-hot-toast";

const ContentAnalysis = () => {
  const { ophid, songId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    youtube_views: "",
    youtube_engagement: "",
    youtube_avg_view_duration: "00:00:00",
    youtube_revenue: "",
    insta_engagement: "",
  });

  const [originalMetrics, setOriginalMetrics] = useState({
    song_id: "",
    OPH_ID: "",
    song_name: "",
    youtube_views: 0,
    youtube_engagement: 0,
    youtube_avg_view_duration: "00:00:00",
    youtube_revenue: 0,
    insta_engagement: 0,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await axiosApi.get(`/analytics/${songId}`);
        const data = res.data;

        setOriginalMetrics({
          song_id: data.song_id || "",
          OPH_ID: data.OPH_ID || "",
          song_name: data.song_name || "",
          youtube_views: parseInt(data.youtube_views) || 0,
          youtube_engagement: parseInt(data.youtube_engagement) || 0,
          youtube_avg_view_duration:
            data.youtube_avg_view_duration || "00:00:00",
          youtube_revenue: parseFloat(data.youtube_revenue) || 0,
          insta_engagement: parseInt(data.insta_engagement) || 0,
        });

        setMetrics({
          youtube_views: "",
          youtube_engagement: "",
          youtube_avg_view_duration: "00:00:00",
          youtube_revenue: "",
          insta_engagement: "",
        });
      } catch (err) {
        console.error("Failed to fetch metrics", err);
        toast.error("Failed to load metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [ophid, songId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetrics((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addTimes = (t1, t2) => {
    const toSec = (t) => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const totalSec = toSec(t1) + toSec(t2);
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSec % 60).padStart(2, "0");

    return `${hrs}:${mins}:${secs}`;
  };

  const handleSave = async () => {
    try {
      const payload = {
        song_id: originalMetrics.song_id,
        OPH_ID: originalMetrics.OPH_ID,
        song_name: originalMetrics.song_name,
        youtube_views: parseInt(metrics.youtube_views || 0),
        youtube_engagement: parseInt(metrics.youtube_engagement || 0),
        youtube_avg_view_duration:
          metrics.youtube_avg_view_duration || "00:00:00",
        youtube_revenue: parseFloat(metrics.youtube_revenue || 0),
        insta_engagement: parseInt(metrics.insta_engagement || 0),
        // Date: new Date().toISOString(), // or format as needed
      };

      const res = await axiosApi.post(`/update_analytics`, payload);
      toast.success("📤 Social metrics saved!");
      console.log("Inserted:", res.data);
    } catch (err) {
      console.error("Insert failed", err);
      toast.error(err.response.data.details);
    }
  };

  const handlePageChange = (e) => {
    const page = e.target.value;
    if (page) navigate(page);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center w-full border-b">
        <h1 className="text-xl font-semibold text-[#0d3c44]">
          Content Analysis
        </h1>
        <select
          onChange={handlePageChange}
          defaultValue=""
          className="border px-4 py-2 rounded-md bg-white text-gray-700"
        >
          <option value="" disabled>
            Go to Page...
          </option>
          <option value={`/ArtistNew/${ophid}`}>Content Manage</option>
          <option value={`/content-analysis/${ophid}/${songId}`}>
            Content Analysis
          </option>
        </select>
      </div>

      {/* Main Form Content */}
      <div className="w-full px-8 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6 w-full">
          <div className="text-lg text-gray-600">
            <strong>OphID:</strong> {ophid} &nbsp; | &nbsp;{" "}
            <strong>SongID:</strong> {songId}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField label="Song ID" value={originalMetrics.song_id} />
            <ReadOnlyField label="OPH ID" value={originalMetrics.OPH_ID} />
            <ReadOnlyField
              label="Song Name"
              value={originalMetrics.song_name}
            />

            <EditableField
              label="YouTube Views (Add to Current)"
              name="youtube_views"
              value={metrics.youtube_views}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Engagement (Add to Current)"
              name="youtube_engagement"
              value={metrics.youtube_engagement}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Avg. View Duration (Add to Current)"
              name="youtube_avg_view_duration"
              value={metrics.youtube_avg_view_duration}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Revenue (Add to Current)"
              name="youtube_revenue"
              value={metrics.youtube_revenue}
              onChange={handleChange}
            />
            <EditableField
              label="Instagram Engagement (Add to Current)"
              name="insta_engagement"
              value={metrics.insta_engagement}
              onChange={handleChange}
            />
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={handleSave}
              className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33] transition"
            >
              Save Metrics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1">
      {label}
    </label>
    <input
      type="text"
      readOnly
      value={value}
      className="w-full p-2 border rounded-md text-black bg-gray-100"
    />
  </div>
);

const EditableField = ({ label, name, value, onChange }) => (
  <div>
    <label className="block text-gray-700 text-sm font-semibold mb-1">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-md text-black bg-white"
    />
  </div>
);

export default ContentAnalysis;
