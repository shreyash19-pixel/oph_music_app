  import React, { useEffect, useState, useRef } from "react";
  import { useParams } from "react-router-dom";
  import axiosApi from "../../../../conf/axios";
  import { Lock, Unlock } from "lucide-react";
  // import { toast } from "react-toastify";
  import toast, { Toaster } from "react-hot-toast";
  import { useAuth } from "../../../../auth/AuthProvider";
  import {
    canLockUnlockTvPublishing,
    canApproveTvPublishing,
  } from "../../../../utils/roles";

  const TvIndex = () => {
    const { user } = useAuth();
    const canLockUnlock = canLockUnlockTvPublishing(user?.role);
    const canApproveReject = canApproveTvPublishing(user?.role);
    const { song_id } = useParams();
    const [tvData, setTvData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Page-wide unlock state (backend lock)
    const [unlock, setunlock] = useState(false);
    const [unlocking, setUnlocking] = useState(false);

    // Lock for audio/video editing (local)
    const [locked, setLocked] = useState(true);

    // Reject mode toggle for showing reason input
    const [isRejecting, setIsRejecting] = useState(false);

    // Local editable states
    const [audioPreview, setAudioPreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [reason, setReason] = useState("");

    // Store original URLs for revert or upload
    const [originalAudioURL, setOriginalAudioURL] = useState(null);
    const [originalVideoURL, setOriginalVideoURL] = useState(null);

    // Refs for hidden file inputs
    const audioInputRef = useRef();
    const videoInputRef = useRef();

    // Selected status: "Submitted" (default), "Accepted", or "Rejected"
    const [selectedStatus, setSelectedStatus] = useState("Submitted");

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axiosApi.get(`/getTv?song_id=${song_id}`);
          if (
            res.data &&
            Array.isArray(res.data.data) &&
            res.data.data.length > 0
          ) {
            const data = res.data.data[0];
            setTvData(data);
            setReason(data.reason || "");
            setAudioPreview(data.audio_url || null);
            setVideoPreview(data.video_url || null);
            setOriginalAudioURL(data.audio_url || null);
            setOriginalVideoURL(data.video_url || null);

            // Set page-wide unlock state from backend lock
            setunlock(data.lock === 1);

            // If locked (lock = 0), lock audio/video editing by default
            setLocked(data.lock === 0);

            // Set status from data if available, else Submitted
            setSelectedStatus(data.status || "Submitted");
          } else {
            setTvData(null);
          }
        } catch (err) {
          console.error("Error fetching TV data:", err);
          setTvData(null);
        } finally {
          setLoading(false);
        }
      };

      if (song_id) {
        fetchData();
      }
    }, [song_id]);

    // === PAGE-LEVEL UNLOCK LOGIC ===
    const handleUnlock = async () => {
      try {
        setUnlocking(true);
        await axiosApi.post("/updateLockStatus", {
          song_id,
          lock: 1,
          status: "Open",
        });
        setunlock(true); // Unlock page
        // Also unlock editing
        setLocked(false);
        // Update tvData.lock to 1 and status to Open locally
        setTvData((prev) => ({ ...prev, lock: 1, status: "Open" }));
        setSelectedStatus("Open");
        toast.success("Record unlocked and status set to Open!");
      } catch (err) {
        console.error("Error unlocking:", err);
        toast.error("Failed to unlock. Try again.");
      } finally {
        setUnlocking(false);
      }
    };

    // === AUDIO/VIDEO EDIT LOCK TOGGLE (local, independent of page lock) ===
    const toggleLock = () => {
      setLocked((prev) => !prev);
      setIsRejecting(false);
    };

    const handleFileChange = (e, field) => {
      const file = e.target.files[0];
      if (file) {
        const previewURL = URL.createObjectURL(file);
        if (field === "audio_url") {
          setAudioPreview(previewURL);
        } else if (field === "video_url") {
          setVideoPreview(previewURL);
        }
      }
    };

  const handleRejectClick = () => {
    console.log("[handleRejectClick] Called");
    console.log("[handleRejectClick] tvData.status:", tvData.status);
    console.log("[handleRejectClick] selectedStatus:", selectedStatus);
    console.log("[handleRejectClick] isRejecting:", isRejecting);
    
    // Check if already rejected (case-insensitive)
    if (tvData.status?.toLowerCase() === "rejected" || selectedStatus?.toLowerCase() === "rejected") {
      console.log("[handleRejectClick] Already rejected, showing error");
      toast.error("This song has already been rejected.");
      return;
    }
    console.log("[handleRejectClick] Setting isRejecting to true");
    setIsRejecting(true);
  };

  const handleSubmitDecision = async (status) => {
    console.log("[handleSubmitDecision] Called with status:", status);
    console.log("[handleSubmitDecision] Current tvData.status:", tvData.status);
    console.log("[handleSubmitDecision] Current selectedStatus:", selectedStatus);
    console.log("[handleSubmitDecision] Reason:", reason);
    
    if (status === "Rejected" && (!reason || reason.trim() === "")) {
      console.log("[handleSubmitDecision] No reason provided, showing error");
      toast.error("Please provide a reason for rejection.");
      return;
    }

    try {
      setSubmitting(true);
      console.log("[handleSubmitDecision] Sending API request to update status");
      
      await axiosApi.post("/updateTvStatus", {
        song_id: tvData.song_id,
        status,
        reason: status === "Rejected" ? reason : null,
      });

      console.log("[handleSubmitDecision] API request successful");
      
      // Update tvData immediately to reflect the new status
      setTvData((prev) => {
        const updated = {
          ...prev,
          status,
          reason: status === "Rejected" ? reason : null,
        };
        console.log("[handleSubmitDecision] Updated tvData:", updated);
        return updated;
      });
      
      console.log("[handleSubmitDecision] Setting selectedStatus to:", status);
      setSelectedStatus(status);
      
      console.log("[handleSubmitDecision] Setting isRejecting to false");
      setIsRejecting(false); // Close the rejection form

      if (status === "Accepted") {
        toast.success("Song has been approved successfully!");
      } else if (status === "Rejected") {
        toast.success("Song has been rejected successfully!");
      }

      console.log("[handleSubmitDecision] Scheduling page reload in 2.5 seconds");
      // Delay reload to allow toast to be seen
      setTimeout(() => {
        window.location.reload();
      }, 2500); // 2.5 seconds
    } catch (err) {
      console.error("[handleSubmitDecision] Error updating status:", err);
      toast.error("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


    const handleSaveChanges = async () => {
      try {
        setSubmitting(true);

        const formData = new FormData();
        formData.append("song_id", tvData.song_id);
        if (audioInputRef.current?.files[0]) {
          formData.append("audio_url", audioInputRef.current.files[0]);
        }
        if (videoInputRef.current?.files[0]) {
          formData.append("video_url", videoInputRef.current.files[0]);
        }

        if (!formData.has("audio_url") && !formData.has("video_url")) {
          toast.error("No file selected to update.");
          return;
        }
        const res = await axiosApi.post("/updateTvFiles", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(res);

        if (res.status === 200) {
          toast.success("Files updated successfully.");
          setTimeout(() => window.location.reload(), 1000);
        } else {
          toast.error("Failed to update files.");
        }
      } catch (err) {
        console.error("Error updating files:", err);
        toast.error("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) return <div>Loading...</div>;
    if (!tvData) return <div>No data found for Song ID: {song_id}</div>;

    // If page locked (lock=0) and not unlock yet, show overlay
    if (tvData.lock === 0 && !unlock) {
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ fontSize: 24, marginBottom: 20 }}>This page is locked.</p>
          {canLockUnlock ? (
            <button
              onClick={handleUnlock}
              disabled={unlocking}
              style={{
                padding: "12px 24px",
                fontSize: 18,
                cursor: unlocking ? "not-allowed" : "pointer",
                backgroundColor: "#007bff",
                border: "none",
                borderRadius: 6,
                color: "white",
              }}
            >
              {unlocking ? "Unlocking..." : "Unlock"}
            </button>
          ) : canApproveReject ? (
            <p style={{ fontSize: 16, maxWidth: 420, textAlign: "center", lineHeight: 1.5 }}>
              This page is locked. A super admin or administrative head must unlock it before you can
              approve or reject.
            </p>
          ) : (
            <p style={{ fontSize: 16, maxWidth: 420, textAlign: "center", lineHeight: 1.5 }}>
              Only a super admin or administrative head can unlock and manage this TV publishing
              record.
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-[#0d3c44]">
          TV Publishing Details
        </h2>

        {/* Song & OPH IDs */}
        <div className="mb-6">
          <p>
            <strong>Song ID:</strong> {tvData.song_id}
          </p>
          <p>
            <strong>OPH ID:</strong> {tvData.OPH_ID}
          </p>
        </div>

        {/* Audio and Video Section */}
        <div className="mb-8 space-y-6">
          {/* Audio */}
          <div>
            <label className="block font-semibold mb-2">Audio</label>
            <div className="flex items-center gap-4">
              {audioPreview ? (
                <audio controls src={audioPreview} className="max-w-xs" />
              ) : (
                <div className="text-gray-400">No audio available</div>
              )}
              <div className="relative">
                {canLockUnlock ? (
                  <>
                    <button
                      onClick={toggleLock}
                      className="p-2 border rounded-md flex items-center gap-1"
                      title={locked ? "Unlock to edit" : "Lock"}
                      disabled={!unlock}
                    >
                      {locked ? <Lock size={18} /> : <Unlock size={18} />}
                      {locked ? "Locked" : "unlock"}
                    </button>
                    {!locked && unlock && (
                      <input
                        type="file"
                        accept="audio/*"
                        ref={audioInputRef}
                        onChange={(e) => handleFileChange(e, "audio_url")}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        title="Select audio file"
                      />
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">View only</span>
                )}
              </div>
            </div>
          </div>

          {/* Video */}
          <div>
            <label className="block font-semibold mb-2">Video</label>
            <div className="flex items-center gap-4">
              {videoPreview ? (
                <video
                  controls
                  src={videoPreview}
                  className="max-w-xs rounded-md border"
                />
              ) : (
                <div className="text-gray-400">No video available</div>
              )}
              <div className="relative">
                {canLockUnlock ? (
                  <>
                    <button
                      onClick={toggleLock}
                      className="p-2 border rounded-md flex items-center gap-1"
                      title={locked ? "Unlock to edit" : "Lock"}
                      disabled={!unlock}
                    >
                      {locked ? <Lock size={18} /> : <Unlock size={18} />}
                      {locked ? "Locked" : "unlock"}
                    </button>
                    {!locked && unlock && (
                      <input
                        type="file"
                        accept="video/*"
                        ref={videoInputRef}
                        onChange={(e) => handleFileChange(e, "video_url")}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        title="Select video file"
                      />
                    )}
                  </>
                ) : (
                  <span className="text-sm text-gray-500">View only</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Approve / Reject — super admin, administrative head, administrative member (not lock/upload) */}
        {(() => {
          const shouldShowMessage = 
            tvData.status?.toLowerCase() === "accepted" || 
            tvData.status?.toLowerCase() === "rejected" || 
            selectedStatus?.toLowerCase() === "accepted" || 
            selectedStatus?.toLowerCase() === "rejected";
          
          if (!canApproveReject) {
            return shouldShowMessage ? (
              <div className="mb-6 text-gray-700 font-semibold flex items-center gap-2">
                <span className="text-lg">
                  {(tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted") ? "✅" : "❌"}
                </span>
                <span>
                  This song has already been{" "}
                  <span
                    className={
                      (tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted")
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {(tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted") ? "accepted" : "rejected"}.
                  </span>
                </span>
              </div>
            ) : (
              <p className="mb-6 text-sm text-gray-600">
                Approving or rejecting this record is not available for your role.
              </p>
            );
          }

          return shouldShowMessage ? (
            <div className="mb-6 text-gray-700 font-semibold flex items-center gap-2">
              <span className="text-lg">
                {(tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted") ? "✅" : "❌"}
              </span>
              <span>
                This song has already been{" "}
                <span
                  className={
                    (tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted")
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  {(tvData.status?.toLowerCase() === "accepted" || selectedStatus?.toLowerCase() === "accepted") ? "accepted" : "rejected"}.
                </span>
              </span>
            </div>
          ) : (
            <>
              {!isRejecting ? (
                <div className="mb-6 flex gap-4">
                  <button
                    onClick={() => handleSubmitDecision("Accepted")}
                    className="px-6 py-2 rounded-md font-semibold bg-green-600 text-white hover:bg-green-700"
                    disabled={submitting || locked || !unlock}
                  >
                    {submitting ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={handleRejectClick}
                    className="px-6 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700"
                    disabled={submitting || locked || !unlock}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block font-semibold mb-2 text-red-700">
                    Rejection Reason
                  </label>
                  <textarea
                    className="w-full p-2 border border-red-600 rounded-md mb-4"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={locked || !unlock}
                    placeholder="Enter reason for rejection"
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleSubmitDecision("Rejected")}
                      className="px-6 py-2 rounded-md font-semibold bg-red-600 text-white hover:bg-red-700"
                      disabled={submitting || locked || !unlock}
                    >
                      {submitting ? "Processing..." : "Submit Rejection"}
                    </button>
                    <button
                      onClick={() => {
                        console.log("[Cancel] Clicked, resetting isRejecting and reason");
                        setIsRejecting(false);
                        setReason("");
                      }}
                      className="px-6 py-2 rounded-md font-semibold bg-gray-500 text-white hover:bg-gray-600"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        {canApproveReject && !canLockUnlock ? (
          <p className="mb-4 text-xs text-gray-500">
            Unlocking this page and editing audio/video files is limited to a super admin or administrative head.
          </p>
        ) : null}

        {/* Save button */}
        {canLockUnlock ? (
          <div className="text-right">
            <button
              onClick={handleSaveChanges}
              className="bg-[#0d3c44] text-white px-6 py-2 rounded-md hover:bg-[#0a2d33]"
              disabled={locked || !unlock}
            >
              Save Changes
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  export default TvIndex;
