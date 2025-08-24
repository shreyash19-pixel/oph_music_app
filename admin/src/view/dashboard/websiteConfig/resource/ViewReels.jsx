import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import toast from "react-hot-toast";

const ViewReels = () => {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await axiosApi.get("/allReels");
      console.log(response);
      setReels(response.data.data || []);
    } catch (err) {
      console.error("Error fetching Reels:", err);
      toast.error("Failed to load Reels.");
    }
  };

  const handleDelete = (id) => {
    toast.custom((t) => (
      <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <p className="text-gray-800 font-medium mb-3">
          Are you sure you want to delete this reel?
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosApi.delete(`/delete_reel/${id}`);
                setReels((prev) => prev.filter((reel) => reel._id !== id));
                toast.success("reel deleted successfully.");
              } catch (err) {
                console.error("Error deleting reel:", err);
                toast.error("Failed to delete reel.");
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
              <option value="/allStories">View Stories</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            All Reels
          </h2>

          {/* reel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reels.map((reel) => (
              <div
                key={reel.id}
                onClick={() => navigate(`/update_reel/${reel.id}`)}
                className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-5 space-y-3 cursor-pointer hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                {reel.thumbnail_url && (
                  <img
                    src={reel.thumbnail_url}
                    alt={reel.title}
                    className="w-full h-48 object-cover rounded-xl border"
                  />
                )}

                {/* Video preview (optional) */}
                {reel.video_url && (
                  <video
                    src={reel.video_url}
                    controls
                    className="w-full h-48 object-cover rounded-xl border"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {/* Info */}
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0d3c44]">
                    {reel.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    <strong>Artist:</strong> {reel.artist_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Duration:</strong> {reel.duration_in_minutes || 0}{" "}
                    min
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Views:</strong> {reel.views || 0}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Credit:</strong> {reel.credit_name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Keywords:</strong> {reel.keywords || "N/A"}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleDelete(reel.id);
                  }}
                  className="w-full mt-3 bg-red-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-600 transition-all duration-150"
                >
                  Delete Reels
                </button>
              </div>
            ))}

            {reels.length === 0 && (
              <p className="text-center col-span-full text-gray-500">
                No Reels found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReels;
