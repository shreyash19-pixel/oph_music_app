import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const ViewStories = () => {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetchStroy();
  }, []);

  const fetchStroy = async () => {
    try {
      const response = await axiosApi.get("/allStories");
      console.log(response);
      setStories(response.data.data || []);
    } catch (err) {
      console.error("Error fetching Story:", err);
      toast.error("Failed to load Story");
    }
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <p className="text-gray-800 font-medium mb-3">
          Are you sure you want to delete this Story?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosApi.delete(`/delete_story/${id}`);
                setStories((prev) => prev.filter((story) => story.id !== id));
                toast.success("Stroy deleted successfully.");
              } catch (err) {
                console.error("Error deleting Story:", err);
                toast.error("Failed to delete Story.");
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
              <option value="/allResource">View Podcasts</option>
              <option value="/allReel">View Reel</option>
              <option value="/allLearning">View Learning</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            All Stories
          </h2>

          {/* story Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigate(`/update_story/${story.id}`)}
                className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-5 space-y-3 cursor-pointer hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                {story.thumbnail_url && (
                  <img
                    src={story.thumbnail_url}
                    alt={story.title}
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                )}

                {/* Video preview (optional) */}
                {story.video_url && (
                  <video
                    src={story.video_url}
                    controls
                    className="w-full h-48 object-cover rounded-xl border"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0d3c44]">
                    {story.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Artist:</strong> {story.artist_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Duration:</strong> {story.duration_in_minutes || 0}{" "}
                    min
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Views:</strong> {story.views || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Credit:</strong> {story.credit_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Keywords:</strong> {story.keywords || "N/A"}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDelete(story.id);
                  }}
                  className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all duration-150"
                >
                  Delete Stories
                </button>
              </div>
            ))}

            {stories.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No Stroies found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStories;
