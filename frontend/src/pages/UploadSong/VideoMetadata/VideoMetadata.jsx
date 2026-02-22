import React, { useState, useEffect, useRef } from "react";
import { Camera, Plus, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosApi from "../../../conf/axios";
import { useArtist } from "../../auth/API/ArtistContext";
import Loading from "../../../components/Loading";
import { toast, ToastContainer } from "react-toastify";
import CustomVideoPlayer from "../../../components/CustomVideoPlayer/CustomVideoPlayer";
import { socket } from "../../../../hook/socket";

export default function VideoMetadataForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [payStat, setPayStat] = useState("");

  console.log(location);
  
  
  // Get song_id from location state (e.g. from upload flow or when returning from payment cancel)
  const contentId = location.state?.song_id;

  const [nextPage, setNextPage] = useState("");
  const releaseDateRaw = location.state?.release_date ?? location.state?.booking_date;
  const release_date = releaseDateRaw
    ? new Date(releaseDateRaw).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata" })
    : "";

  const year = release_date ? release_date.split("/")[2] : "";
  const month = release_date ? release_date.split("/")[0] : "";
  const day = release_date ? release_date.split("/")[1] : "";
  const formattedDate = year && month && day ? `${year}-${month}-${day}` : "";

  const [songName, setSongName] = useState(location.state?.songName || "");
  const projectType = localStorage.getItem("projectType") || "";
  const { headers, ophid } = useArtist();
  const [formData, setFormData] = useState({
    credits: "",
    thumbnails: [],
    video_file: null,
    existing_thumbnails: [],
    existing_video_url: null,
    reject_reason: null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPaidForLyricalVideo, setHasPaidForLyricalVideo] = useState(false); // Add state for lyrical video payment
  
  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState({
    percentage: 0,
    loadedMB: 0,
    totalMB: 0,
    speed: 0,
    time: 0,
    isUploading: false,
  });

  const [checkBookingDates, setCheckBookingDates] = useState([]);
  const [navigateToSongReg, setNavigateToSongReg] = useState(false);
  const [videoMetadataLoaded, setVideoMetadataLoaded] = useState(false);
  const [showPayNowAfterSubmit, setShowPayNowAfterSubmit] = useState(false);
  const progressCleanupRef = useRef(null);

  // Video is in rejected list (from status page) = user must submit video changes first
  const isVideoRejected = location.state?.rejectedSections?.some(
    (s) => s.section === "video"
  );
  // Paid in advance without lyrical: never show Pay now (no payment needed)
  const isPaidInAdvanceNoLyricalCheck =
    projectType === "paid in advance" &&
    (location.state?.lyrical_services !== true && location.state?.lyrical_services !== "true");
  // Only payment rejected = payment needed AND video was already submitted (so show read-only + Pay now)
  const onlyPaymentRejected =
    !isPaidInAdvanceNoLyricalCheck &&
    videoMetadataLoaded &&
    (nextPage === "repayment" || nextPage === "payment") &&
    formData.reject_reason === null &&
    !isVideoRejected &&
    !!formData.existing_video_url; // must have submitted video before showing read-only
  // After audio resubmit when both audio and payment were rejected: land here with read-only + Pay now
  const showPayNowOnVideoFromState = location.state?.showPayNowOnVideo === true && !isPaidInAdvanceNoLyricalCheck;
  // Show read-only + Pay now when: (1) video already submitted and only payment left, (2) user just submitted on this page, or (3) came from audio resubmit (audio+payment rejected)
  // Never show for paid in advance without lyrical
  const showReadOnlyAndPayNow = !isPaidInAdvanceNoLyricalCheck && (onlyPaymentRejected || showPayNowAfterSubmit || showPayNowOnVideoFromState);

  const urlToFile = async (url, fileName, mimeType) => {
    try {
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }
      const buffer = await res.blob();
      return new File([buffer], fileName, { type: mimeType });
    } catch (error) {
      console.error(`Error converting URL to file (${url}):`, error);
      // Return null instead of throwing to prevent breaking the component
      return null;
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.thumbnails.length + files.length > 3) {
      toast.error("Maximum 3 thumbnails allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      thumbnails: [...prev.thumbnails, ...files].slice(0, 3),
    }));
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      thumbnails: prev.thumbnails.filter((_, i) => i !== index),
    }));
  };

  const removeExistingPhoto = async (index) => {
    try {
      setIsRemoving(true);
      setFormData((prev) => ({
        ...prev,
        existing_thumbnails: prev.existing_thumbnails.filter(
          (_, i) => i !== index
        ),
      }));
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Failed to remove photo");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        video_file: file,
      }));
    }
  };

  const checkPaymentStaus = async () => {
    try {
      const response = await axiosApi.get("/check-payment-status", {
        headers: headers,
        params: { contentId, ophid },
      });

      if (response.data.success) {
        const nextPagePath = response.data.data?.nextPagePath;
        const rejectReason = response.data.data?.reject_reason;
        
        setNextPage(nextPagePath || "");
        setPayStat(rejectReason || "");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (
      formData.thumbnails.length === 0 &&
      formData.existing_thumbnails.length === 0
    ) {
      toast.error("At least one thumbnail is required");
      return;
    }

    if (
      !location.state.lyrical_services &&
      !hasPaidForLyricalVideo &&
      !formData.video_file &&
      !formData.existing_video_url
    ) {
      toast.error("Video file is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setIsLoading(true);

      const formDataToSend = new FormData();
      formDataToSend.append("song_id", contentId);
      formDataToSend.append("ophid", ophid);
      formDataToSend.append("credits", formData.credits);

      // Send existing thumbnails as JSON (URLs that are already on S3)
      if (formData.existing_thumbnails && formData.existing_thumbnails.length > 0) {
        formDataToSend.append("existing_thumbnails", JSON.stringify(formData.existing_thumbnails));
      }

      if (formData.video_file) {
        formDataToSend.append("video_file", formData.video_file);
      }

      // Only send NEW thumbnails (File objects), not existing ones that were converted from URLs
      // Filter out thumbnails that are actually existing ones (check if they have a name that matches existing URLs)
      const newThumbnails = formData.thumbnails.filter(thumbnail => {
        // If thumbnail is a File object (has .name and .size), it's a new upload
        // If it was converted from URL, it might not have proper File properties
        // Check if it's actually a new file by seeing if it exists in existing_thumbnails
        if (thumbnail instanceof File) {
          const isExisting = formData.existing_thumbnails?.some(existingUrl => {
            const existingFileName = existingUrl.split("/").pop();
            return thumbnail.name === existingFileName;
          });
          return !isExisting; // Only include if it's NOT an existing thumbnail
        }
        return true; // Include if it's not a File (shouldn't happen, but be safe)
      });

      newThumbnails.forEach((thumbnail) => {
        formDataToSend.append("thumbnails", thumbnail);
      });
      
      console.log(`[Frontend] Sending ${newThumbnails.length} new thumbnail(s) and ${formData.existing_thumbnails?.length || 0} existing thumbnail URL(s)`);

      // Calculate total file size for progress tracking
      let totalSize = 0;
      if (formData.video_file) {
        totalSize += formData.video_file.size;
      }
      newThumbnails.forEach((thumb) => {
        if (thumb instanceof File) {
          totalSize += thumb.size;
        }
      });

      const startTime = Date.now();
      const totalMBInitial = formData.video_file
        ? (formData.video_file.size / (1024 * 1024)).toFixed(2)
        : totalSize ? (totalSize / (1024 * 1024)).toFixed(2) : "0";
      setUploadProgress({
        percentage: 0,
        loadedMB: 0,
        totalMB: parseFloat(totalMBInitial),
        speed: 0,
        time: 0,
        isUploading: true,
      });

      // Real S3 progress from backend via socket (matches backend logs)
      if (formData.video_file && socket) {
        const handler = (data) => {
          setUploadProgress((prev) => ({
            ...prev,
            percentage: data.percent ?? prev.percentage,
            loadedMB: data.loadedMB ?? prev.loadedMB,
            totalMB: data.totalMB ?? prev.totalMB,
            speed: data.speed ?? prev.speed,
            time: data.time ?? prev.time,
            isUploading: true,
          }));
        };
        socket.on("video-upload-progress", handler);
        progressCleanupRef.current = () => socket.off("video-upload-progress", handler);
      }

      const response = await axiosApi.post(`/video-details`, formDataToSend, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          // For video uploads progress comes from socket; only use this for thumbnails-only
          if (formData.video_file) return;
          if (progressEvent.total) {
            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const percentage = Math.round((loaded / total) * 100);
            const loadedMB = (loaded / (1024 * 1024)).toFixed(2);
            const totalMB = (total / (1024 * 1024)).toFixed(2);
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const speed = elapsed > 0 ? (loaded / (1024 * 1024) / parseFloat(elapsed)).toFixed(2) : 0;
            setUploadProgress((prev) => ({
              ...prev,
              percentage,
              loadedMB: parseFloat(loadedMB),
              totalMB: parseFloat(totalMB),
              speed: parseFloat(speed),
              time: parseFloat(elapsed),
              isUploading: true,
            }));
          }
        },
      });

      // Paid in advance + lyrical NOT selected: no payment, go directly to success
      const isPaidInAdvanceNoLyrical =
        projectType === "paid in advance" &&
        (location.state?.lyrical_services === false || location.state?.lyrical_services === undefined || !location.state?.lyrical_services);
      if (isPaidInAdvanceNoLyrical) {
        const response = await axiosApi.post(
          "/insert-calender-song-project",
          {
            oph_id: ophid,
            song_name: location.state.songName,
            project_type: projectType,
            release_date: location.state.release_date,
            song_id: contentId,
          },
          {
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          setIsLoading(false);
          const paymentUpdateResponse = await axiosApi.post(
            "/insert-songid-payment",
            { ophid: ophid, song_id: contentId },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (paymentUpdateResponse.data.success) {
            navigate("/dashboard/success", {
              state: {
                heading: "Your Song Registration has been done successfully!",
                btnText: "Back to Home",
                redirectTo: "/dashboard",
              },
            });
          }
        }
        return;
      }
      // "paid in advance" + lyrical_services: do not redirect here; fall through to success
      // so we stay on page with read-only form + Pay now

      if (response.data.success) {
        setIsLoading(false);

        // Refetch video metadata so read-only view shows saved thumbnails and video URLs
        const refetchForReadOnly = async () => {
          try {
            const res = await axiosApi.get(`/video-details`, { headers, params: { contentId } });
            if (res.data?.success && res.data?.data?.video_metadata?.[0]) {
              const d = res.data.data.video_metadata[0];
              let imageUrls = [];
              const rawImageUrl = d.image_url ?? d.image_URL;
              if (rawImageUrl != null) {
                if (Array.isArray(rawImageUrl)) imageUrls = rawImageUrl;
                else if (typeof rawImageUrl === "string") {
                  try {
                    const parsed = JSON.parse(rawImageUrl);
                    imageUrls = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
                  } catch {
                    imageUrls = [rawImageUrl].filter(Boolean);
                  }
                }
              }
              const videoUrl = d.video_url ?? d.video_URL ?? null;
              setFormData((prev) => ({
                ...prev,
                credits: d.credits || prev.credits,
                existing_thumbnails: imageUrls,
                existing_video_url: videoUrl || prev.existing_video_url,
                video_file: null,
                thumbnails: [],
              }));
            }
          } catch (e) {
            console.warn("Refetch video metadata after submit:", e);
          }
        };

        // Paid in advance: only require payment when lyrical services (399) is checked
        // Checkbox unchecked = no payment → already handled above (direct success)
        const isPaidInAdvanceWithLyrical =
          projectType === "paid in advance" &&
          (location.state?.lyrical_services === true || location.state?.lyrical_services === "true");
        if (isPaidInAdvanceWithLyrical) {
          await refetchForReadOnly();
          setShowPayNowAfterSubmit(true);
          return;
        }

        // Check if there's a redirect path from backend (for rejected sections)
        if (response.data.redirectPath) {
          if (response.data.redirectPath === '/dashboard/success') {
            navigate("/dashboard/success", {
              state: {
                heading: "Your song registration has been completed successfully!",
                btnText: "Back to Home",
                redirectTo: "/dashboard",
              },
            });
          } else if (response.data.redirectPath === '/dashboard/upload-song/audio-metadata/') {
            // Redirect to audio metadata
            navigate("/dashboard/upload-song/audio-metadata/", {
              state: {
                song_id: contentId,
                songName: response.data.songName || location.state.songName,
                release_date: location.state.release_date,
                project_type: location.state.project_type,
                lyrical_services: location.state.lyrical_services,
                isFixingRejected: true,
              },
            });
          } else if (response.data.redirectPath === '/dashboard/upload-song/video-metadata/') {
            // Redirect to video metadata (shouldn't happen after submitting video, but handle it)
            navigate("/dashboard/upload-song/video-metadata/", {
              state: {
                song_id: contentId,
                songName: response.data.songName || location.state.songName,
                release_date: location.state.release_date,
                project_type: location.state.project_type,
                lyrical_services: location.state.lyrical_services,
                isFixingRejected: true,
              },
            });
          } else if (response.data.redirectPath === '/auth/payment') {
            await refetchForReadOnly();
            setShowPayNowAfterSubmit(true);
          } else {
            // Fallback to default navigation
            navigate(response.data.redirectPath);
          }
        } else {
          // Default: when next step is payment, stay on page with read-only form + Pay now
          if (nextPage === "repayment" || nextPage === "payment") {
            await refetchForReadOnly();
            setShowPayNowAfterSubmit(true);
          } else if (nextPage === "pending") {
            navigate("/dashboard/pending", {
              state: {
                heading: "Your video details are under review",
                btnText: "Upload a new song",
                redirectTo: "/dashboard/upload-song",
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error uploading video metadata:", error);
      toast.error("Failed to upload video metadata. Please try again.");
    } finally {
      if (progressCleanupRef.current) {
        progressCleanupRef.current();
        progressCleanupRef.current = null;
      }
      setIsSubmitting(false);
      setIsLoading(false);
      setUploadProgress({
        percentage: 0,
        loadedMB: 0,
        totalMB: 0,
        speed: 0,
        time: 0,
        isUploading: false,
      });
    }
  };

  const checkIfDateIsAvail = () => {
    const check = checkBookingDates.find((date) => {
      const formattedDate = new Date(
        location.state.release_date
      ).toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
      });

      const formattedReleaseDate = new Date(date.date).toLocaleDateString(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
        }
      );

      if (formattedReleaseDate === formattedDate && date.ophid !== ophid) {
        return date;
      }
    });

    if (check) {
      setNavigateToSongReg(true);
    }
  };

  const checkAlreadyBookedDate = async () => {
    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers are not ready yet");
        return;
      }

      const response = await axiosApi.get("/bookings", {
        headers: headers,
      });

      if (response.data.success) {
        const date = response.data.data.map((data) => {
          return {
            date: data.current_booking_date,
            ophid: data.oph_id,
          };
        });
        setCheckBookingDates(date);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVideoMetadata = async () => {
    setIsLoading(true);
    if (!contentId) {
      setError("No content ID provided");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosApi.get(`/video-details`, {
        headers,
        params: { contentId },
      });

      if (response.data.success) {
        const { video_metadata } = response?.data?.data;
        const data = video_metadata?.[0];

        // If no data, still set loading to false and return
        if (!data) {
          setIsLoading(false);
          return;
        }

        // Parse existing image URLs (API may return string or already-parsed array; support both key casings)
        let imageUrls = [];
        const rawImageUrl = data.image_url ?? data.image_URL;
        if (rawImageUrl != null) {
          if (Array.isArray(rawImageUrl)) imageUrls = rawImageUrl;
          else if (typeof rawImageUrl === "string") {
            try {
              const parsed = JSON.parse(rawImageUrl);
              imageUrls = Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
            } catch {
              imageUrls = [rawImageUrl].filter(Boolean);
            }
          }
        }

        const videoUrl = data.video_url ?? data.video_URL ?? null;

        setFormData({
          credits: data.credits || "",
          existing_thumbnails: imageUrls,
          thumbnails: [],
          video_file: null,
          existing_video_url: videoUrl,
          reject_reason: data.reject_reason || null,
        });
      }
    } catch (err) {
      console.error("Error fetching video metadata:", err);
      setError("Failed to load video metadata");
    } finally {
      setIsLoading(false);
      setVideoMetadataLoaded(true);
    }
  };

  useEffect(() => {
    if (checkBookingDates.length > 0) {
      checkIfDateIsAvail();
    }
  }, [checkBookingDates]);

  useEffect(() => {
    // Draft: check if release date is still free on calendar; if taken, redirect to register-song
    const releaseDateRaw = location.state?.release_date ?? location.state?.booking_date;
    if (contentId && releaseDateRaw && headers?.Authorization) {
      const releaseDateForApi = typeof releaseDateRaw === "string" && releaseDateRaw.includes("/")
        ? releaseDateRaw.split("/").reverse().join("-")
        : releaseDateRaw;
      axiosApi.get("/check-release-date-available", {
        headers,
        params: { release_date: releaseDateForApi, song_id: contentId, ophid }
      }).then((res) => {
        if (res.data.success && res.data.available === false) {
          navigate("/dashboard/upload-song/register-song", {
            replace: true,
            state: {
              song_id: contentId,
              songName: location.state?.songName || songName,
              release_date: releaseDateRaw,
              project_type: location.state?.project_type,
              lyrical_services: location.state?.lyrical_services,
              dateNoLongerAvailable: true,
              returnToPage: "/dashboard/upload-song/video-metadata"
            }
          });
        }
      }).catch(() => {});
    }
    checkAlreadyBookedDate();
    fetchVideoMetadata();
    checkPaymentStaus();

    // Re-run when contentId, headers, ophid, or location (e.g. returning from payment cancel) changes
    // location.key changes on every navigate, so we re-fetch when user comes back to this page
  }, [contentId, headers, ophid, location.key]);

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (navigateToSongReg) {
    navigate("/dashboard/upload-song/register-song", {
      replace: true,
      state: {
        song_id: contentId,
        songName,
        release_date: location.state?.release_date ?? location.state?.booking_date,
        project_type: location.state?.project_type,
        lyrical_services: location.state?.lyrical_services,
        dateNoLongerAvailable: true,
        returnToPage: "/dashboard/upload-song/video-metadata",
      },
    });
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-70px)] text-gray-100 px-8 p-6">
      <div className="max-w-xl space-y-8">
        <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          VIDEO METADATA
        </h1>
        {formData.reject_reason && (
          <p className="text-red-700">
            Video rejection reason: {formData.reject_reason}
          </p>
        )}

        {payStat && payStat.trim() !== "" && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-400 font-semibold mb-1">Payment Rejection</p>
            <p className="text-red-300 text-sm">{payStat}</p>
          </div>
        )}

        {/* Read-only + Pay now: when only payment rejected, or after user just submitted video (payment next) */}
        {showReadOnlyAndPayNow ? (
          <div className="space-y-6">
            <p className="text-gray-400">
              {showPayNowOnVideoFromState
                ? "Please complete payment to continue."
                : showPayNowAfterSubmit
                ? "Video submitted successfully. Please complete payment to continue."
                : "Your video details are already approved. Please complete payment to continue."}
            </p>
            {/* Read-only preview */}
            <div className="space-y-2">
              <label className="block text-gray-400">Song Name:</label>
              <input disabled value={songName} className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 opacity-80" type="text" readOnly />
            </div>
            {formData.credits && (
              <div className="space-y-2">
                <label className="block text-gray-400">Credits:</label>
                <div className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700 opacity-80 text-gray-300 whitespace-pre-wrap">
                  {formData.credits}
                </div>
              </div>
            )}
            {formData.existing_thumbnails?.length > 0 && (
              <div className="space-y-2">
                <label className="block text-gray-400">Thumbnails:</label>
                <div className="grid grid-cols-3 gap-4">
                  {formData.existing_thumbnails.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg opacity-90" />
                  ))}
                </div>
              </div>
            )}
            {formData.existing_video_url && (
              <div className="space-y-2">
                <label className="block text-gray-400">Video:</label>
                <CustomVideoPlayer src={formData.existing_video_url} className="w-full rounded-lg" pauseOtherVideos={true} />
              </div>
            )}
            <button
              type="button"
              onClick={() =>
                navigate("/auth/payment", {
                  state: {
                    from: "Song Repayment",
                    booking_date: formattedDate || location.state?.release_date,
                    release_date: formattedDate || location.state?.release_date,
                    song_id: contentId,
                    songName: location.state?.songName || songName,
                    project_type: projectType,
                    lyrical_services: location.state?.lyrical_services,
                    backPath: "/dashboard/upload-song/video-metadata",
                  },
                })
              }
              className="w-full bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors"
            >
              Pay now
            </button>
          </div>
        ) : (
          <>
            {/* Full-screen loader: show progress inside loader when uploading */}
            {(isLoading || isRemoving || isUploading || uploadProgress.isUploading) && (
              <Loading progress={uploadProgress.isUploading ? uploadProgress : undefined} />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Song Name Display */}
              <div className="space-y-2">
                <label className="block text-gray-400">Song Name:</label>
                <input
                  disabled
                  value={songName}
                  className="w-full p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  type="text"
                />
              </div>

              {/* Credits */}
              <div className="space-y-2">
                <label className="block">
                  Credits <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, credits: e.target.value }))
                  }
                  placeholder="Enter credits..."
                  rows={4}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span>Upload Maximum 3 Pictures</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {formData.existing_thumbnails?.map((url, index) => (
                    <div key={`existing-${index}`} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Existing thumbnail ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.thumbnails.map((photo, index) => (
                    <div key={`new-${index}`} className="relative aspect-square">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {formData.thumbnails.length + (formData.existing_thumbnails?.length || 0) < 3 && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        multiple
                      />
                      <div className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center hover:border-cyan-400 transition-colors">
                        <Plus className="w-8 h-8 text-gray-500" />
                      </div>
                    </label>
                  )}
                </div>
              </div>

              {/* Video Upload */}
              {!hasPaidForLyricalVideo && (
                <div className="space-y-2">
                  <label className="block">
                    Upload Video File <span className="text-red-500">*</span>
                  </label>
                  {formData.existing_video_url && !formData.video_file && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-400">Existing video file:</p>
                      <CustomVideoPlayer
                        src={formData.existing_video_url}
                        className="w-full mt-2 rounded-lg"
                        pauseOtherVideos={true}
                      />
                    </div>
                  )}
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-cyan-400 transition-colors">
                      {formData.video_file ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-cyan-400">
                            {formData.video_file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, video_file: null }))
                            }
                            className="p-1 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="w-8 h-8 text-gray-500" />
                          <span className="text-gray-500">
                            {formData.existing_video_url
                              ? "Upload New Video File"
                              : "Upload Video File"}
                          </span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )}

              {/* Submit Button - submit video first; after submit, backend redirects to payment if payment is also rejected */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-400 text-gray-900 rounded-full py-3 font-semibold hover:bg-cyan-300 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "Loading..." : "Submit"}
              </button>
              {nextPage === "repayment" && formData.reject_reason && (
                <p className="text-gray-400 text-sm text-center mt-2">
                  After submitting, you will be redirected to complete payment if needed.
                </p>
              )}
            </form>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
