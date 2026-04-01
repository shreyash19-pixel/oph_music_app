import React, { useEffect, useState } from "react";
import axiosApi from "../../../../conf/axios";
import toast, { Toaster } from "react-hot-toast";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";
import { useParams, useNavigate } from "react-router-dom";

const UpdateLearning = () => {
  const { learningId } = useParams();
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
    audience: "both",
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        const res = await axiosApi.get(`/learning/${learningId}`);
        console.log(res);
        const data = res.data.data;

        setFormData({
          title: data.title || "",
          artist_name: data.artist_name || "",
          duration_in_minutes: data.duration_in_minutes || "",
          views: data.views || 0,
          credit_name: data.credit_name || "",
          keywords: data.keywords || "",
          audience: ["ia", "sa", "both"].includes(
            String(data.audience || "").toLowerCase(),
          )
            ? String(data.audience).toLowerCase()
            : "both",
          thumbnail_url: null,
          video_url: null,
        });

        setThumbnailPreview(data.thumbnail_url || null);
        setVideoPreview(data.video_url || null);
      } catch (err) {
        toast.error("Failed to fetch Learning.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearning();
  }, [learningId]);

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
      await axiosApi.put(`/update_learning/${learningId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Learning updated successfully!");
      navigate("/allLearning");
    } catch (error) {
      console.error("Error updating learning:", error);
      toast.error("Failed to update learning.");
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
            Update Learning
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
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Video File
            </label>
            <div className="relative">
              <input
                type="file"
                name="video_url"
                accept="video/*"
                onChange={handleChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.5C5.137 5.5 5.071 5.5 5 5.5a3 3 0 0 0 0 6h3Z"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> video file
                  </p>
                  <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
                </div>
              </label>
            </div>
            {videoPreview && (
              <div className="mt-3">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-64 rounded-xl border border-gray-200 shadow-sm"
                />
                <p className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Video file selected
                </p>
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail Image
            </label>
            <div className="relative">
              <input
                type="file"
                name="thumbnail_url"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label
                htmlFor="thumbnail-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.5C5.137 5.5 5.071 5.5 5 5.5a3 3 0 0 0 0 6h3Z"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> thumbnail
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                </div>
              </label>
            </div>
            {thumbnailPreview && (
              <div className="mt-3">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail Preview"
                  className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                <p className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Thumbnail image selected
                </p>
              </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Visible to artists (by OPH ID)
            </label>
            <select
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-white"
            >
              <option value="both">
                Both — Independent (-IA-) and Specialist (-SA-)
              </option>
              <option value="ia">Independent only (OPH ID contains -IA-)</option>
              <option value="sa">Specialist only (OPH ID contains -SA-)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Dashboard Learnings list only shows items allowed for the signed-in
              artist&apos;s OPH ID pattern.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/allLearning")}
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

export default UpdateLearning;
