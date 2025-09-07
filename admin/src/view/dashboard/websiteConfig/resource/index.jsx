import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";
import WebConfigSidebar from "../../../../components/WebConfigSidebar";

const CreateResource = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    thumbnail_url: null,
    video_url: null,
    artist_name: "",
    duration_in_minutes: "",
    views: 0,
    credit_name: "",
    keywords: "",
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      const file = files[0];

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Set preview
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
      data.append(key, formData[key]);
    }

    try {
      await axiosApi.post("/createPodcast", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Podcast created successfully!");

      setFormData({
        title: "",
        thumbnail_url: null,
        video_url: null,
        artist_name: "",
        duration_in_minutes: "",
        views: 0,
        credit_name: "",
        keywords: "",
      });
      setThumbnailPreview(null);
      setVideoPreview(null);
    } catch (err) {
      console.error("Error creating podcast:", err);
      alert("Failed to create podcast.");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <WebConfigSidebar />

      <div className="flex-1 p-10 overflow-y-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-2xl mx-auto space-y-6 border border-gray-200"
          encType="multipart/form-data"
        >
          {/* Dropdown */}
          <div>
            <select
              onChange={(e) => navigate(e.target.value)}
              className="border p-2 rounded shadow w-full"
            >
              <option value="">Go to...</option>
              <option value="/Reels">Create Reels</option>
              <option value="/Stories">Create Stories</option>
              <option value="/Learning">Create Learning</option>
              <option value="/allResource">View Podcasts</option>
              <option value="/allReel">View Reels</option>
              <option value="/allStories">View Stories</option>
              <option value="/allLearning">View Learning</option>
            </select>
          </div>

          <h2 className="text-2xl font-bold text-[#0d3c44] text-center">
            Create Podcast
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

          {/* Video Upload + Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Video File *
            </label>
            <div className="relative">
              <input
                type="file"
                name="video_url"
                accept="video/*"
                onChange={handleChange}
                className="hidden"
                id="video-upload"
                required
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

          {/* Thumbnail Upload + Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Thumbnail Image *
            </label>
            <div className="relative">
              <input
                type="file"
                name="thumbnail_url"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="thumbnail-upload"
                required
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#0d3c44] text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-[#0b3239] transition-all duration-150"
          >
            Create Podcast
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateResource;
