import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const ViewPodcasts = () => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await axiosApi.get("/allPodcasts");
      setPodcasts(response.data.data || []);
    } catch (err) {
      console.error("Error fetching podcasts:", err);
      toast.error("Failed to load podcasts.");
    }
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <p className="text-gray-800 font-medium mb-3">
          Are you sure you want to delete this podcast?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosApi.delete(`/delete_podcast/${id}`);
                setPodcasts((prev) =>
                  prev.filter((podcast) => podcast.id !== id),
                );
                toast.success("Podcast deleted successfully.");
              } catch (err) {
                console.error("Error deleting podcast:", err);
                toast.error("Failed to delete podcast.");
              }
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <WebConfigSidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-7xl mx-auto border border-gray-200 space-y-6">
          {/* Dropdown Navigation */}
          <div>
            <select
              onChange={(e) => navigate(e.target.value)}
              className="border p-2 rounded shadow w-full"
            >
              <option value="">Go to...</option>
              <option value="/allReel">View Reels</option>
              <option value="/allStories">View Stories</option>
              <option value="/allLearning">View Learning</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            All Podcasts
          </h2>

          {/* Podcast Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((podcast) => (
              <div
                key={podcast._id}
                onClick={() => navigate(`/update_podcast/${podcast.id}`)}
                className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-5 space-y-3 cursor-pointer hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                {podcast.thumbnail_url && (
                  <img
                    src={podcast.thumbnail_url}
                    alt={podcast.title}
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                )}

                {/* Video preview (optional) */}
                {podcast.video_url && (
                  <video
                    src={podcast.video_url}
                    controls
                    className="w-full h-48 object-cover rounded-xl border"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0d3c44]">
                    {podcast.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Artist:</strong> {podcast.artist_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Duration:</strong>{" "}
                    {podcast.duration_in_minutes || 0} min
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Views:</strong> {podcast.views || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Credit:</strong> {podcast.credit_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Keywords:</strong> {podcast.keywords || "N/A"}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDelete(podcast.id);
                  }}
                  className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all duration-150"
                >
                  Delete Podcast
                </button>
              </div>
            ))}

            {podcasts.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No podcasts found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPodcasts;
