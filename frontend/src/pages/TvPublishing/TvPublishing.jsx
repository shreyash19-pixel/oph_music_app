import React, { useState, useEffect, useRef } from "react";
import axiosApi from "../../conf/axios";
import { useArtist } from "../auth/API/ArtistContext";
import Loading from "../../components/Loading";

export default function TVPublishing() {
  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const { headers, ophid } = useArtist();
  const [selectedContent, setSelectedContent] = useState(null);
  const [files, setFiles] = useState({ audio: null, video: null });
  const [agreement, setAgreement] = useState(false);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState({ audio: 0, video: 0 });
  const isSubmitted = selectedContent?.status == "Submitted";
  // const status = {
  //   1: "Pending",
  //   2: "Approved",
  //   3: "Published",
  //   4: "Rejected",
  // };


  useEffect(() => {
    const fetchContent = async () => {
      if (!ophid) return;
      try {
        const response = await axiosApi.get(`/TvUser?OPH_ID=${ophid}`);

        setContents(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedContentId(response.data.data[0].id);
          setSelectedContent(response.data.data[0]);
          console.log(response);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
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
      alert("Invalid audio file format.");
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      alert("Invalid video file format.");
      return;
    }
    if (type === "audio" && file.size > 50 * 1024 * 1024) {
      alert("Audio file too large. Max 50MB");
      return;
    }
    if (type === "video" && file.size > 500 * 1024 * 1024) {
      alert("Video file too large. Max 500MB");
      return;
    }

    setFiles((prev) => ({ ...prev, [type]: file }));
  };

  const getFilePreview = (type) => {
    const file = files[type];
    const defaultUrl =
      type === "audio"
        ? selectedContent?.audio_file_url
        : selectedContent?.video_file_url;

    return file ? URL.createObjectURL(file) : defaultUrl;
  };

  // const handleSubmit = async () => {
  //   if (!agreement) {
  //     alert("Please agree to the terms and conditions");
  //     return;
  //   }

  //   if (
  //     (!files.audio && !selectedContent.audio_file_url) ||
  //     (!files.video && !selectedContent.video_file_url)
  //   ) {
  //     alert("Please provide both audio and video files");
  //     return;
  //   }

  //   const formData = new FormData();
  //   if (files.audio) formData.append("audio", files.audio);
  //   if (files.video) formData.append("video", files.video);

  //   try {
  //     setLoading(true);
  //     const response = await axiosApi.put(
  //       `/tv-publishing/content/${selectedContent.id}`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //           ...headers,
  //         },
  //         onUploadProgress: (e) => {
  //           const progress = Math.round((e.loaded * 100) / e.total);
  //           const fileType = e.target?.name;
  //           setUploadProgress((prev) => ({
  //             ...prev,
  //             [fileType]: progress,
  //           }));
  //         },
  //       }
  //     );

  //     if (response.data.success) {
  //       alert("Submitted successfully!");
  //       setFiles({ audio: null, video: null });
  //       setAgreement(false);
  //     } else {
  //       throw new Error(response.data.message || "Submission failed");
  //     }
  //   } catch (error) {
  //     console.error("Submit error:", error);
  //     alert(
  //       error.response?.data?.message ||
  //         "Failed to submit TV publishing request"
  //     );
  //   } finally {
  //     setLoading(false);
  //     setUploadProgress({ audio: 0, video: 0 });
  //   }
  // };

  const handleSubmit = async () => {
    if (!agreement) {
      alert("Please agree to the terms and conditions");
      return;
    }

    if (!files.audio || !files.video) {
      alert("Please upload both audio and video files");
      return;
    }

    const formData = new FormData();
    formData.append("song_id", selectedContent.song_id); // or id depending on your data
    formData.append("audio", files.audio);
    formData.append("video", files.video);

    try {
      setLoading(true);

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

      if (response.data.success) {
        alert("Content uploaded successfully!");
        setFiles({ audio: null, video: null });
        setAgreement(false);
        // Optionally refresh or update state to reflect changes
      } else {
        alert("Upload failed: " + response.data.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading content");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };


  const getStatusColor = (status) => {
    const colorMap = {
      "Open": "border-yellow-400 text-yellow-400",
      "Submitted": "border-blue-400 text-blue-400",
      "Approved": "border-green-400 text-green-400",
      "Rejected": "border-red-400 text-red-400",
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
        <div className="max-w-4xl space-y-8 relative">
          <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            TV PUBLISHING
          </h1>

          {contents.length === 0 ? (
            <p className="text-gray-300 text-xl">
              No content is unlocked for TV publishing
            </p>
          ) : (
            <div>
              <div className="space-y-2 bg-[#191D27]/35 p-4">
                <label className="block text-gray-400">Song Name</label>
                <select
                  value={selectedContentId || ""}
                  onChange={(e) => {
                    const contentId = e.target.value;
                    const content = contents.find(
                      (c) => c.song_id == contentId
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
                    selectedContent?.status
                  )}`}
                >
                  {selectedContent?.status}
                </span>
              </div>

              {["Open", "Submitted", "Rejected"].includes(
                selectedContent?.status
              ) && (
                <div
                  className={`relative space-y-6 mt-6 p-4 border rounded-lg ${
                    selectedContent?.status === "Rejected"
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {selectedContent?.status === "Rejected" && (
                    <div className="absolute inset-0 bg-black/70 z-10 flex items-center justify-center rounded-lg">
                      <p className="text-red-400 text-xl font-bold">
                        This content was rejected. Please contact support.
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
                            <div className="text-4xl text-gray-500 mb-2">+</div>
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
              )}

              {selectedContent?.status == "Open" && (
                <p className="text-gray-300 mt-6">
                  Your TV publishing request is Open.
                </p>
              )}
              {selectedContent?.status == "Submitted" && (
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
