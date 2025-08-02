import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import toast from "react-hot-toast";

const ContentAnalysis = () => {
  const { ophid, songId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState({
    id: "",
    song_id: "",
    OPH_ID: "",
    song_name: "",
    youtube_views: "",
    youtube_engagement: "",
    youtube_avg_view_duration: "",
    youtube_revenue: "",
    insta_engagement: "",
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await axiosApi.get(`/analytics/${songId}`);
        const data = res.data;

        setMetrics({
          song_id: data.song_id || "",
          OPH_ID: data.OPH_ID || "",
          song_name: data.song_name || "",
          youtube_views: data.youtube_views || "",
          youtube_engagement: data.youtube_engagement || "",
          youtube_avg_view_duration: data.youtube_avg_view_duration || "",
          youtube_revenue: data.youtube_revenue || "",
          insta_engagement: data.insta_engagement || "",
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

  const handleSave = async () => {
    try {
    const res = await axiosApi.put(`/update_analytics/${songId}`, {
      youtube_views: metrics.youtube_views,
      youtube_engagement: metrics.youtube_engagement,
      youtube_avg_view_duration: metrics.youtube_avg_view_duration,
      youtube_revenue: metrics.youtube_revenue,
      insta_engagement: metrics.insta_engagement,
    });

    toast.success("📤 Social metrics saved!");
    
    console.log("Updated:", res.data);
  } catch (err) {
    console.error("Update failed", err);
    alert("Failed to update analytics.");
  }

    console.log("Saving metrics:", metrics);
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
        <h1 className="text-xl font-semibold text-[#0d3c44]">Content Analysis</h1>
        <select
          onChange={handlePageChange}
          defaultValue=""
          className="border px-4 py-2 rounded-md bg-white text-gray-700"
        >
          <option value="" disabled>Go to Page...</option>
          <option value={`/ArtistNew/${ophid}`}>Content Manage</option>
          <option value={`/content-analysis/${ophid}/${songId}`}>Content Analysis</option>
          {/* Add more pages here as needed */}
        </select>
      </div>

      {/* Main Form Content */}
      <div className="w-full px-8 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8 space-y-6 w-full">
          <div className="text-lg text-gray-600">
            <strong>OphID:</strong> {ophid} &nbsp; | &nbsp; <strong>SongID:</strong> {songId}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReadOnlyField label="Song ID" value={metrics.song_id} />
            <ReadOnlyField label="OPH ID" value={metrics.OPH_ID} />
            <ReadOnlyField label="Song Name" value={metrics.song_name} />

            <EditableField
              label="YouTube Views"
              name="youtube_views"
              value={metrics.youtube_views}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Engagement"
              name="youtube_engagement"
              value={metrics.youtube_engagement}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Avg. View Duration"
              name="youtube_avg_view_duration"
              value={metrics.youtube_avg_view_duration}
              onChange={handleChange}
            />
            <EditableField
              label="YouTube Revenue"
              name="youtube_revenue"
              value={metrics.youtube_revenue}
              onChange={handleChange}
            />
            <EditableField
              label="Instagram Engagement"
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
    <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
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
    <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
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
