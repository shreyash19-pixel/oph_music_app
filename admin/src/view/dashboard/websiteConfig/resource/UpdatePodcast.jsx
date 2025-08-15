import React, { useEffect, useState } from "react";
import axiosApi from "../../../../conf/axios";
import toast, { Toaster } from "react-hot-toast";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import { useParams, useNavigate } from "react-router-dom";

const UpdatePodcast = () => {
  const { podcastId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    video_url: null,
    thumbnail_url: null,
    artist_name: "",
    duration_in_minutes: "",
    views: 0,
    credit_name: "",
    keywords: "",
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchPodcast = async () => {
      try {
        const res = await axiosApi.get(`/podcast/${podcastId}`);
        console.log(res);
        const data = res.data.data;

        setFormData({
          title: data.title || "",
          artist_name: data.artist_name || "",
          duration_in_minutes: data.duration_in_minutes || "",
          views: data.views || 0,
          credit_name: data.credit_name || "",
          keywords: data.keywords || "",
          thumbnail_url: null,
          video_url: null,
        });

        setThumbnailPreview(data.thumbnail_url || null);
        setVideoPreview(data.video_url || null);
      } catch (err) {
        toast.error("Failed to fetch podcast.");
      } finally {
        setLoading(false);
      }
    };

    fetchPodcast();
  }, [podcastId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      if (name === "thumbnail_url") {
        setThumbnailPreview(URL.createObjectURL(file));
      }

      if (name === "video_url") {
        setVideoPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    for (const key in formData) {
      if (
        (key === "video_url" && formData[key] === null && videoPreview) ||
        (key === "thumbnail_url" && formData[key] === null && thumbnailPreview)
      ) {
        // Send original string URL if no new file was selected
        data.append(key, key === "video_url" ? videoPreview : thumbnailPreview);
      } else {
        data.append(key, formData[key]);
      }
    }

    try {
      setUpdating(true);
      await axiosApi.put(`/update_podcast/${podcastId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Podcast updated successfully!");
      navigate("/WebConfig/Podcast");
    } catch (error) {
      console.error("Error updating podcast:", error);
      toast.error("Failed to update podcast.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen flex bg-gray-100">
      <WebConfigSidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <Toaster position="top-right" />

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl mx-auto space-y-6 border border-gray-200"
          encType="multipart/form-data"
        >
          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            Update Podcast
          </h2>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
            required
          />

          {/* Video Upload */}
          <div>
            <input
              type="file"
              name="video_url"
              accept="video/*"
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-xl"
            />
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="w-full h-64 mt-2 rounded-xl border"
              />
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <input
              type="file"
              name="thumbnail_url"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-xl"
            />
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail Preview"
                className="w-full h-48 object-contain mt-2 rounded-xl border"
              />
            )}
          </div>

          {/* Artist Name */}
          <input
            type="text"
            name="artist_name"
            placeholder="Artist Name"
            value={formData.artist_name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
          />

          {/* Duration */}
          <input
            type="number"
            name="duration_in_minutes"
            placeholder="Duration (minutes)"
            value={formData.duration_in_minutes}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
          />

          {/* Views */}
          <input
            type="number"
            name="views"
            placeholder="Views"
            value={formData.views}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
          />

          {/* Credit Name */}
          <input
            type="text"
            name="credit_name"
            placeholder="Credit Name"
            value={formData.credit_name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
          />

          {/* Keywords */}
          <input
            type="text"
            name="keywords"
            placeholder="Keywords (comma-separated)"
            value={formData.keywords}
            onChange={handleChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/WebConfig/Podcast")}
              className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-[#0d3c44] hover:bg-[#0b3239] text-white font-semibold transition-all"
            >
              {updating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePodcast;
