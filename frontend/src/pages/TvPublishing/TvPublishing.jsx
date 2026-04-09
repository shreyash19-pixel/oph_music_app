import React, { useState, useEffect, useRef } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import NavbarRight from "../../components/Navbar/NavbarRight";

export default function TVPublishing() {
  const [loading, setLoading] = useState(false);
  const { contents, setContents } = useOutletContext();
  const [selectedContentId, setSelectedContentId] = useState(null);
  const { headers, ophid } = useArtist();
  const [selectedContent, setSelectedContent] = useState(null);
  const [files, setFiles] = useState({ audio: null, video: null });
  const [agreement, setAgreement] = useState(false);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState({ audio: 0, video: 0 });
  const isSubmitted = selectedContent?.status?.toLowerCase() === "submitted";
  // const status = {
  //   1: "Pending",
  //   2: "Approved",
  //   3: "Published",
  //   4: "Rejected",
  // };

  useEffect(() => {
    const fetchContent = async () => {
      console.log("[TVPublishing] ophid:", ophid);
      if (!ophid) return;
      try {
        const response = await axiosApi.get(`/TvUser?OPH_ID=${ophid}`);
        console.log("[TVPublishing] API response:", response.data);
        console.log("[TVPublishing] contents array:", response.data.data);

        setContents(response.data.data);
        if (response.data.data.length > 0) {
          const first = response.data.data[0];
          console.log("[TVPublishing] first item keys:", Object.keys(first));
          console.log("[TVPublishing] first item:", first);
          console.log(
            "[TVPublishing] first.id:",
            first.id,
            "| first.song_id:",
            first.song_id,
            "| first.status:",
            first.status,
          );
          console.log("[TVPublishing] first.reason:", first.reason);
          setSelectedContentId(first.song_id);
          setSelectedContent(first);
        } else {
          console.warn("[TVPublishing] No contents returned from API");
        }
      } catch (error) {
        console.error("[TVPublishing] Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [ophid]);

  const handleFileChange = (type) => (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (type === "audio" && !file.type.startsWith("audio/")) {
      toast.error("Invalid audio file format.");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      toast.error("Invalid video file format.");
      return;
    }
    if (type === "audio" && file.size > 50 * 1024 * 1024) {
      toast.error("Audio file too large. Max 50MB");
      return;
    }
    if (type === "video" && file.size > 1024 * 1024 * 1024) {
      toast.error("Video file too large. Max 1GB");
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: file }));
    toast.success(
      `${type === "audio" ? "Audio" : "Video"} file selected successfully!`,
    );
  };

  const getFilePreview = (type) => {
    const file = files[type];
    const defaultUrl =
      type === "audio"
        ? selectedContent?.audio_file_url
        : selectedContent?.video_file_url;

    return file ? URL.createObjectURL(file) : defaultUrl;
  };

  const handleSubmit = async () => {
    if (!agreement) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!files.audio || !files.video) {
      toast.error("Please upload both audio and video files");
      return;
    }

    const formData = new FormData();
    formData.append("song_id", selectedContent.song_id); // or id depending on your data
    formData.append("audio", files.audio);
    formData.append("video", files.video);

    try {
      setLoading(true);
      toast.loading("Uploading content...", { id: "upload" });

      const response = await axiosApi.post("/content", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (e) => {
          const progress = Math.round((e.loaded * 100) / e.total);
          // you can show overall progress or split by files if needed
          setUploadProgress(progress);
        },
      });

      toast.dismiss("upload");

      if (response.data.success) {
        toast.success("Content uploaded successfully!");
        setFiles({ audio: null, video: null });
        setAgreement(false);
        // Optionally refresh or update state to reflect changes
        // Refresh the content list
        const refreshResponse = await axiosApi.get(`/TvUser?OPH_ID=${ophid}`);
        setContents(refreshResponse.data.data);
        const updatedContent = refreshResponse.data.data.find(
          (c) => c.song_id === selectedContent.song_id,
        );
        if (updatedContent) {
          setSelectedContent(updatedContent);
        }
      } else {
        toast.error("Upload failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss("upload");
      toast.error("Error uploading content. Please try again.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const UnlockIcon = () => (
    <svg
      width="250"
      height="250"
      viewBox="0 0 24 24"
      fill="#5DC9DE"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 1C9.24 1 7 3.24 7 6V9H6C4.9 9 4 9.9 4 11V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V11C20 9.9 19.1 9 18 9H17V6C17 3.24 14.76 1 12 1ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V9H9V6ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17Z" />
    </svg>
  );

  const getStatusColor = (status) => {
    const colorMap = {
      Open: "border-yellow-400 text-yellow-400",
      Submitted: "border-blue-400 text-blue-400",
      Approved: "border-green-400 text-green-400",
      Rejected: "border-red-400 text-red-400",
    };
    return colorMap[status] || "text-gray-400 border-gray-400/30";
  };

  const getFileInfo = (type) => {
    const file = files[type];
    return file
      ? { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + "MB" }
      : null;
  };

  const handleRemoveFile = (type) => {
    setFiles((prev) => ({ ...prev, [type]: null }));
  };

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 p-6">
      {loading && <Loading />}
      {!loading && (
        <div
          className={`space-y-8 relative ${
            contents.length === 0 ? "" : "w-full"
          }`}
        >
          <div className="flex justify-between items-center  mb-8">
            <h2 className="text-[#00B8D9] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
              TV PUBLISHING
            </h2>
            <NavbarRight />
          </div>

          {contents.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh] flex-col gap-6">
              <UnlockIcon />
              <p className="text-center text-cyan-300">You can submit your songs to request access to this section. If your song meets the eligibility criteria for TV,<br/>  the OPH Community Administration team will review your submission and unlock the section for you. Thank you.</p>
            </div>
          ) : (
            <div className="max-w-4xl">
              <div className="space-y-2 mb-6 rounded-xl border px-4 py-4 sm:px-5 sm:py-5 border-[#5DC9DE]/35 bg-gray-800/50 ring-1 ring-[#5DC9DE]/25 p-4">
                <label className="block text-gray-400">Song Name</label>
                <select
                  value={selectedContentId || ""}
                  onChange={(e) => {
                    const contentId = e.target.value;
                    const content = contents.find(
                      (c) => c.song_id == contentId,
                    );
                    console.log("dd", content);
                    setSelectedContentId(contentId);
                    setSelectedContent(content);
                    setFiles({ audio: null, video: null });
                  }}
                  className="bg-[#191D27]/35 text-white p-2 rounded"
                >
                  {contents.map((content) => (
                    <option key={content.song_id} value={content.song_id}>
                      {content.song_name}
                    </option>
                  ))}
                </select>
                <span
                  className={`px-4 mx-10 py-1 rounded-full text-sm border ${getStatusColor(
                    selectedContent?.status,
                  )}`}
                >
                  {selectedContent?.status}
                </span>
              </div>

              {(() => {
                const shouldShowForm = [
                  "Open",
                  "Submitted",
                  "Rejected",
                  "open",
                  "submitted",
                  "rejected",
                ].includes(selectedContent?.status);
                console.log(
                  "[TVPublishing Render] selectedContent:",
                  selectedContent,
                );
                console.log(
                  "[TVPublishing Render] selectedContent?.status:",
                  selectedContent?.status,
                );
                console.log(
                  "[TVPublishing Render] shouldShowForm:",
                  shouldShowForm,
                );
                console.log(
                  "[TVPublishing Render] Status check - Open:",
                  selectedContent?.status === "Open",
                );
                console.log(
                  "[TVPublishing Render] Status check - Submitted:",
                  selectedContent?.status === "Submitted",
                );
                console.log(
                  "[TVPublishing Render] Status check - Rejected:",
                  selectedContent?.status === "Rejected",
                );
                console.log(
                  "[TVPublishing Render] Status check - rejected (lowercase):",
                  selectedContent?.status === "rejected",
                );

                return (
                  shouldShowForm && (
                    <div className="relative space-y-6 mt-6 p-4 border rounded-lg">
                      {(selectedContent?.status === "Rejected" ||
                        selectedContent?.status === "rejected") &&
                        selectedContent?.reason && (
                          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                            <p className="text-red-400 font-semibold mb-2">
                              ❌ Rejection Reason:
                            </p>
                            <p className="text-gray-300">
                              {selectedContent.reason}
                            </p>
                            <p className="text-yellow-400 text-sm mt-2">
                              Please reupload your files and resubmit.
                            </p>
                          </div>
                        )}
                      {(selectedContent?.status === "Rejected" ||
                        selectedContent?.status === "rejected") &&
                        !selectedContent?.reason && (
                          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
                            <p className="text-red-400 font-semibold mb-2">
                              ❌ This content was rejected.
                            </p>
                            <p className="text-yellow-400 text-sm mt-2">
                              Please reupload your files and resubmit.
                            </p>
                          </div>
                        )}

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* VIDEO UPLOAD */}
                        <div className="space-y-4">
                          <h2 className="text-2xl font-semibold text-cyan-400">
                            Video File
                          </h2>
                          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                            {getFilePreview("video") ? (
                              <>
                                <video
                                  src={getFilePreview("video")}
                                  className="w-full h-full object-cover"
                                  controls
                                />
                                <button
                                  onClick={() => {
                                    handleRemoveFile("video");
                                    videoInputRef.current?.click();
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                                >
                                  Reupload
                                </button>
                              </>
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center cursor-pointer"
                                onClick={() => videoInputRef.current?.click()}
                              >
                                <div className="text-center">
                                  <div className="text-4xl text-gray-500 mb-2">
                                    +
                                  </div>
                                  <div className="text-gray-500">
                                    Upload Video File
                                  </div>
                                </div>
                              </div>
                            )}
                            {getFilePreview("video") && (
                              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-sm">
                                {getFileInfo("video")?.name}
                              </div>
                            )}
                            {uploadProgress.video > 0 && (
                              <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-sm">
                                Uploading: {uploadProgress.video}%
                              </div>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="video/*"
                              ref={videoInputRef}
                              onChange={handleFileChange("video")}
                              disabled={isSubmitted}
                            />
                          </div>
                        </div>

                        {/* AUDIO UPLOAD */}
                        <div className="space-y-4">
                          <h2 className="text-2xl font-semibold text-cyan-400">
                            Audio File
                          </h2>
                          <div className="border-2 border-dashed border-gray-700 rounded-lg aspect-video flex flex-col items-center justify-center hover:border-cyan-400 transition-colors">
                            {getFilePreview("audio") ? (
                              <div className="w-full p-4">
                                <audio
                                  src={getFilePreview("audio")}
                                  controls
                                  className="w-full mb-2"
                                />
                                <button
                                  onClick={() => {
                                    handleRemoveFile("audio");
                                    audioInputRef.current?.click();
                                  }}
                                  className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
                                >
                                  Reupload
                                </button>
                              </div>
                            ) : (
                              <div
                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                                onClick={() => audioInputRef.current?.click()}
                              >
                                <div className="text-4xl text-gray-500 mb-2">
                                  +
                                </div>
                                <div className="text-gray-500">
                                  Upload Audio File
                                </div>
                              </div>
                            )}
                            {getFilePreview("audio") && (
                              <div className="text-center text-sm text-gray-400 mt-2">
                                {getFileInfo("audio")?.name}
                              </div>
                            )}
                            {uploadProgress.audio > 0 && (
                              <div className="text-center text-sm text-gray-400 mt-2">
                                Uploading: {uploadProgress.audio}%
                              </div>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="audio/*"
                              ref={audioInputRef}
                              onChange={handleFileChange("audio")}
                              disabled={isSubmitted}
                            />
                          </div>
                        </div>
                      </div>

                      {/* AGREEMENT */}
                      <div className="space-y-4">
                        <h2 className="text-2xl font-semibold text-cyan-400">
                          Agreement
                        </h2>
                        <label className="flex items-center gap-3 text-gray-300">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-gray-600 bg-gray-800/50 text-cyan-400 focus:ring-cyan-400"
                            checked={agreement}
                            onChange={(e) => setAgreement(e.target.checked)}
                          />
                          <span>Agree with terms and conditions.</span>
                        </label>
                      </div>

                      {/* SUBMIT */}
                      <button
                        type="submit"
                        className="w-full md:w-auto px-8 py-3 bg-cyan-400 text-gray-900 rounded-full font-semibold hover:bg-cyan-300 transition-colors"
                        onClick={handleSubmit}
                        disabled={loading}
                      >
                        {loading ? "Submitting..." : "Submit for TV Publishing"}
                      </button>
                    </div>
                  )
                );
              })()}

              {selectedContent?.status?.toLowerCase() === "open" && (
                <p className="text-gray-300 mt-6">
                  Your TV publishing request is Open.
                </p>
              )}
              {selectedContent?.status?.toLowerCase() === "submitted" && (
                <p className="text-gray-300 mt-6">
                  Your content has been published on TV!
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
