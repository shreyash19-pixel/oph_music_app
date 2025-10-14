import React, { useEffect, useState } from "react";
import axiosApi from "../../../../conf/axios";

const HomePage = () => {
  const [formData, setFormData] = useState({
    total_artists: "",
    total_songs: "",
    total_audience: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch existing numbers on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosApi.get("/getsupport");
        const data = response.data.data?.[0];
        if (data) {
          setFormData({
            total_artists: data.total_artists,
            total_songs: data.total_songs,
            total_audience: data.total_audience,
          });
        }
      } catch (err) {
        console.error("Error fetching supporting numbers:", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axiosApi.post("/updatesupport", formData);
      if (response.data.success) {
        setMessage("Supporting numbers updated successfully ✅");
      } else {
        setMessage("Failed to update supporting numbers ⚠️");
      }
    } catch (err) {
      console.error("Error updating supporting numbers:", err);
      setMessage("Error updating supporting numbers ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-#F3F4F6-500 flex items-center justify-center p-6">
      <div className="bg-gray-800 text-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Update Supporting Numbers</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-gray-300">Total Artists</label>
            <input
              type="number"
              name="total_artists"
              value={formData.total_artists}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Total Songs</label>
            <input
              type="number"
              name="total_songs"
              value={formData.total_songs}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-300">Total Audience</label>
            <input
              type="number"
              name="total_audience"
              value={formData.total_audience}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-bold p-2 rounded hover:bg-gray-200 transition"
          >
            {loading ? "Updating..." : "Update Numbers"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-200 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default HomePage;