import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const ViewLearning = () => {
  const navigate = useNavigate();
  const [learning, setLearning] = useState([]);

  useEffect(() => {
    fetchLearning();
  }, []);

  const fetchLearning = async () => {
    try {
      const response = await axiosApi.get("/allLearning");
      console.log(response);
      setLearning(response.data.data || []);
    } catch (err) {
      console.error("Error fetching Learning:", err);
      toast.error("Failed to load Learning");
    }
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <p className="text-gray-800 font-medium mb-3">
          Are you sure you want to delete this Learning?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosApi.delete(`/delete_learning/${id}`);
                setLearning((prev) => prev.filter((learning) => learning.id !== id));
                toast.success("Learning deleted successfully.");
              } catch (err) {
                console.error("Error deleting Learning:", err);
                toast.error("Failed to delete Learning.");
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
              <option value="/allStories">View Stories</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            All Learning
          </h2>

          {/* learning Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {learning.map((learningItem) => (
              <div
                key={learningItem.id}
                onClick={() => navigate(`/update_learning/${learningItem.id}`)}
                className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-5 space-y-3 cursor-pointer hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                {learningItem.thumbnail_url && (
                  <img
                    src={learningItem.thumbnail_url}
                    alt={learningItem.title}
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                )}

                {/* Video preview (optional) */}
                {learningItem.video_url && (
                  <video
                    src={learningItem.video_url}
                    controls
                    className="w-full h-48 object-cover rounded-xl border"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0d3c44]">
                    {learningItem.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Artist:</strong> {learningItem.artist_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Duration:</strong> {learningItem.duration_in_minutes || 0}{" "}
                    min
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Views:</strong> {learningItem.views || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Credit:</strong> {learningItem.credit_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Keywords:</strong> {learningItem.keywords || "N/A"}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDelete(learningItem.id);
                  }}
                  className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all duration-150"
                >
                  Delete Learning
                </button>
              </div>
            ))}

            {learning.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No Learning found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLearning;
