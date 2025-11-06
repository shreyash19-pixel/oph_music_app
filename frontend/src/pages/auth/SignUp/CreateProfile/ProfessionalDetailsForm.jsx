import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-hot-toast";
import { AiOutlineDown } from "react-icons/ai";
import {
  getProfessionalDetails,
  updateProfessionalDetails,
} from "../../API/profile";
import ProfileFormHeader from "../components/ProfileFormHeader";
import Loading from "../../../../components/Loading";
import { useArtist } from "../../API/ArtistContext";
// import { fetchVideoForScreen } from "../../../../utils/fetchVideo";
import PlayBtn from "../../../../../public/assets/images/playButton.png";
import MusicBg from "../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../public/assets/images/elipse2.png";
import axiosApi from "../../../../conf/axios";
import { data, useNavigate, useSearchParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import CustomVideoPlayer from "../../../../components/CustomVideoPlayer/CustomVideoPlayer";

const ProfessionalDetailsForm = () => {
  const { headers, ophid } = useArtist();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [videoBio, setVideoBio] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); // Track video play state
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [rejectReason, setRejectReason] = useState(null);
  const [searchParams] = useSearchParams();
  const [professions, setProfessions] = useState([]);
  const [professionsLoading, setProfessionsLoading] = useState(true);

  const shouldHideSongsPlanned = ophid?.includes("SA");

  // Fetch professions from API
  const fetchProfessions = async () => {
    try {
      setProfessionsLoading(true);
      const response = await axiosApi.get("/get_professions");
      if (response.data && response.data.success) {
        setProfessions(response.data.data || []);
      } else {
        console.error("Failed to fetch professions:", response.data?.message);
        toast.error("Failed to fetch professions");
      }
    } catch (error) {
      console.error("Error fetching professions:", error);
      toast.error("Failed to fetch professions");
    } finally {
      setProfessionsLoading(false);
    }
  };

  // const fetchVideo = async () => {
  //   try {
  //     const response = await axiosApi.get(
  //       "artist-website-configs?param=signup_video"
  //     );
  //     setVideo(response.data.data[0]);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };
  // useEffect(() => {
  //   fetchVideo();
  // }, []);
  const [formData, setFormData] = useState({
    profession: "",
    bio: "",
    photos: [],
    spotifyUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    appleMusicUrl: "",
    ExperienceYearly: 0,
    experienceMonths: 0,
    songsPlanned: 0,
    songPlanningDuration: "",
  });

  const [checkSimilarData, setcheckSimilarData] = useState({
    profession: "",
    bio: "",
    photos: [],
    spotifyUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    appleMusicUrl: "",
    ExperienceYearly: 0,
    experienceMonths: 0,
    songsPlanned: 0,
    songPlanningDuration: "",
  });
  // console.log(formData,"formdata");

  useEffect(() => {
    fetchProfessions(); // Fetch professions when component mounts
  }, []);

  useEffect(() => {
    if (ophid && professions.length > 0) {
      fetchProfessionalDetails();
    }
  }, [ophid, professions]);

  // useEffect(() => {
  //   const loadVideo = async () => {
  //     const url = await fetchVideoForScreen("professional_video");
  //     setVideoUrl(url);
  //   };
  //   loadVideo();
  // }, []);

  const checkSimilarity = () => {
    let isSimilarity = false;

    if (
      formData.profession === checkSimilarData.profession &&
      formData.bio === checkSimilarData.bio &&
      formData.spotifyUrl === checkSimilarData.spotifyUrl &&
      formData.instagramUrl === checkSimilarData.instagramUrl &&
      formData.facebookUrl === checkSimilarData.facebookUrl &&
      formData.appleMusicUrl === checkSimilarData.appleMusicUrl &&
      formData.ExperienceYearly === checkSimilarData.ExperienceYearly &&
      formData.experienceMonths === checkSimilarData.experienceMonths &&
      formData.songPlanningDuration === checkSimilarData.songPlanningDuration &&
      formData.songsPlanned === checkSimilarData.songsPlanned &&
      formData.url === checkSimilarData.url &&
      JSON.stringify(formData.photos) ===
        JSON.stringify(checkSimilarData.photos)
    ) {
      toast.error("Please check rejection reason and make update");
      isSimilarity = true;
    }
    return isSimilarity;
  };

  const fetchProfessionalDetails = async () => {
    console.log("hekekekfnds");

    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers not ready yet");
        return;
      }

      const response = await getProfessionalDetails(headers, ophid);

      if (response.success && response.data.length > 0) {
        const data = response.data;

        const artist = data[0];

        console.log(artist);

        // Find profession ID by name for form display
        const professionId =
          professions.find((p) => p.name === artist.Profession)?.id || "";
        setFormData({
          profession: professionId,
          bio: artist.Bio || "",
          photos: JSON.parse(artist.PhotoURLs) || [],
          spotifyUrl: artist.SpotifyLink || "",
          instagramUrl: artist.InstagramLink || "",
          facebookUrl: artist.FacebookLink || "",
          appleMusicUrl: artist.AppleMusicLink || "",
          ExperienceYearly: Math.floor((artist.ExperienceMonthly || 0) / 12),
          experienceMonths: (artist.ExperienceMonthly || 0) % 12,
          songPlanningDuration: artist.SongsPlanningType || "",
          songsPlanned: artist.SongsPlanningCount || 0,
          step_status: artist.step_status,
          url: artist.VideoURL,
        });

        setcheckSimilarData({
          profession: professionId,
          bio: artist.Bio || "",
          photos: JSON.parse(artist.PhotoURLs) || [],
          spotifyUrl: artist.SpotifyLink || "",
          instagramUrl: artist.InstagramLink || "",
          facebookUrl: artist.FacebookLink || "",
          appleMusicUrl: artist.AppleMusicLink || "",
          ExperienceYearly: Math.floor((artist.ExperienceMonthly || 0) / 12),
          experienceMonths: (artist.ExperienceMonthly || 0) % 12,
          songPlanningDuration: artist.SongsPlanningType || "",
          songsPlanned: artist.SongsPlanningCount || 0,
          step_status: artist.step_status,
          url: artist.VideoURL,
        });

        setVideoBio(artist.VideoURL || null);
        setVideoUrl(artist.VideoURL);

        if (response.data[0].reject_reason != null) {
          setRejectReason(response.data[0].reject_reason);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch professional details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Add validation checks
    if (!formData.profession) {
      toast.error("Please select your profession");
      setLoading(false);
      return;
    }
    if (!formData.bio && !videoBio) {
      toast.error("Please add your bio");
      setLoading(false);
      return;
    }
    if (!shouldHideSongsPlanned && !formData.songPlanningDuration) {
      toast.error("Please select song planning duration");
      setLoading(false);
      return;
    }

    if (formData.step_status === "rejected") {
      const result = checkSimilarity();
      if (result) {
        setLoading(false);
        return;
      }
    }

    try {
      const formDataToSend = new FormData();

      // Append all text fields
      formDataToSend.append("OPH_ID", ophid);
      // Find the profession name by ID and send the name as text
      const selectedProfession = professions.find(
        (p) => p.id == formData.profession
      );
      formDataToSend.append(
        "Profession",
        selectedProfession ? selectedProfession.name : ""
      );
      formDataToSend.append("Bio", formData.bio);
      formDataToSend.append("SpotifyLink", formData.spotifyUrl);
      formDataToSend.append("InstagramLink", formData.instagramUrl);
      formDataToSend.append("FacebookLink", formData.facebookUrl);
      formDataToSend.append("AppleMusicLink", formData.appleMusicUrl);
      let stepPath;
      console.log(formData.step_status);
      if (formData.step_status === "under review" || formData.step_status === null) {
        stepPath = "/auth/create-profile/documentation-details";
      } else if (formData.step_status === "rejected") {
        stepPath = `/auth/profile-status`;
      }
      formDataToSend.append("step", stepPath);

      // Calculate and append experience in months
      const experienceMonths =
        formData.ExperienceYearly * 12 + formData.experienceMonths;
      formDataToSend.append("ExperienceMonthly", experienceMonths);

      // Append number of songs planned
      if (ophid && shouldHideSongsPlanned) {
        formDataToSend.append("SongsPlanningCount", "NA");
        formDataToSend.append("SongsPlanningType", "NA");
      } else {
        formDataToSend.append("SongsPlanningCount", formData.songsPlanned);
        formDataToSend.append(
          "SongsPlanningType",
          formData.songPlanningDuration
        );
      }

      // Append photos
      // if (typeof formData.photos.length === "string") {
      //   formData.photos.forEach((photo) => {
      //     formDataToSend.append("photoURLs", photo);
      //   });
      // }
      // else if (formData.photos.length < 5) {
      //   formData.photos.forEach((photo) => {
      //     formDataToSend.append("photos", photo);
      //   })
      // }

      formData.photos.forEach((photo) => {
        if (typeof photo === "string") {
          formDataToSend.append("photoURLs[]", photo); // existing URLs
        } else if (photo instanceof File) {
          formDataToSend.append("photos", photo); // new uploads
        }
      });

      if (typeof videoBio === "string") {
        formDataToSend.append("VideoURL", formData.url); // send as body field
      } else {
        formDataToSend.append("video", videoBio); // will go to multer
      }

      // Append video bio if it exists
      // if (videoBio) {
      //   formDataToSend.append("video", videoBio);
      // }
      const response = await updateProfessionalDetails(formDataToSend, headers);
      const res = await axiosApi.post(`/increment-count/${ophid}`);
      if (response.success) {
        toast.success("Professional details updated successfully");
        const path = `${response.step}`;
        navigate(path);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update professional details"
      );
    } finally {
      setLoading(false);
    }
  };

  // const handleFileChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   if (files.length + formData.photos.length > 5) {
  //     toast.error("Maximum 5 photos allowed");
  //     return;
  //   }
  //   setFormData((prev) => ({
  //     ...prev,
  //     photos: [...prev.photos, ...files],
  //   }));

  // };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const currentCount = formData.photos.length;
    const newCount = newFiles.length;

    // Prevent more than 5 total (old + new)
    if (currentCount + newCount > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...newFiles], // keep old (URLs or Files) + add new Files
    }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoBio(file);
    }
  };

  // ✅ useEffect goes here — at top-level of the component
  useEffect(() => {
    if (videoBio && typeof videoBio !== "string") {
      const objectUrl = URL.createObjectURL(videoBio);
      setVideoUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl); // Clean up
      };
    } else if (typeof videoBio === "string") {
      setVideoUrl(videoBio); // already a URL
    }
  }, [videoBio]);

  const handleDeletePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };
  return (
    <div className="relative bg-cover bg-center">
      {loading && <Loading />}

      <img
        src={MusicBg}
        className="absolute top-[50%] -z-10 inset-0 md:top-[20%]"
        alt=""
        srcSet=""
      />
      <img
        src={Elipse}
        className="absolute top-[50%] -z-10 inset-0 w-[30%] md:top-[20%]"
        alt=""
        srcSet=""
      />
      <div className="min-h-screen z-10  bg-opacity-70 text-white p-6">
        <ProfileFormHeader title="PROFESSIONAL DETAILS" />
        <div className=" mt-20 min-h-[calc(100vh-70px)] text-white p-6 flex flex-col items-center  mx-auto">
          <div className="relative flex justify-center">
            {video && (
              <video
                ref={videoRef}
                src={video.value}
                onPlay={handlePlay}
                onPause={handlePause}
                onClick={togglePlayPause}
                className="w-[800px] h-[50vh]  object-cover "
                controls={false} // Disable default controls
              />
            )}
            {!isPlaying && (
              <button
                onClick={togglePlayPause}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent focus:outline-none"
              >
                <img src={PlayBtn} alt="Play" className="w-32 h-32" />
              </button>
            )}
          </div>
          <h2 className="text-cyan-400 uppercase text-2xl mt-4 font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-center">
            Professional Details
          </h2>
          {rejectReason && (
            <div className="text-red-500">
              <strong>Reject Reason:</strong> {rejectReason}
            </div>
          )}
          <form
            className="space-y-4 px-[5%] sm:px-[10%] md:px-[15%] xl:px-[25%] mt-10"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="block text-white mb-1">
                Profession: <span className="text-red-500">*</span>{" "}
              </label>

              <div className="relative w-full">
                {/* Select Box */}
                <select
                  className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200 appearance-none"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profession: e.target.value,
                    }))
                  }
                  disabled={professionsLoading}
                >
                  <option value="">
                    {professionsLoading
                      ? "Loading professions..."
                      : "Select Profession"}
                  </option>
                  {professions.map((profession) => (
                    <option key={profession.id} value={profession.id}>
                      {profession.name}
                    </option>
                  ))}
                </select>

                {/* Custom Arrow Icon */}
                <AiOutlineDown className="absolute text-[13px] top-1/2 right-3 transform -translate-y-1/2 text-white pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-white mb-1">
                Add Bio: <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full h-[150px]  border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 py-2 text-white bg-[rgba(30,30,30,0.7)] rounded-2xl outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                placeholder="About you..."
                rows={6}
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
              />
              <div className="text-cyan-400 text-sm mt-1">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer underline"
                >
                  + Upload Video About Yourself
                </label>
              </div>
            </div>

            <div className="relative mb-8">
              {videoUrl && (
                <div className="w-full aspect-video rounded-lg overflow-hidden">
                  <CustomVideoPlayer
                    src={videoUrl}
                    className="w-full h-full rounded-lg"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-white mb-1">
                Upload Your Photos: <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="p-4 border-2 border-dashed border-gray-700 rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-gray-400 text-sm">*Maximum 5 photos</span>
              </label>

              {Array.isArray(formData.photos) && formData.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={
                          photo instanceof File
                            ? URL.createObjectURL(photo)
                            : photo
                        }
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        onClick={() => handleDeletePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {[
                {
                  platform: "Spotify",
                  value: formData.spotifyUrl,
                  key: "spotifyUrl",
                },
                {
                  platform: "Instagram",
                  value: formData.instagramUrl,
                  key: "instagramUrl",
                },
                {
                  platform: "Facebook",
                  value: formData.facebookUrl,
                  key: "facebookUrl",
                },
                {
                  platform: "Apple Music",
                  value: formData.appleMusicUrl,
                  key: "appleMusicUrl",
                },
              ].map(({ platform, value, key }) => (
                <div key={key}>
                  <label className="block text-white mb-1">
                    Add {platform} URL:
                  </label>
                  <input
                    type="text"
                    placeholder={`${platform} URL`}
                    value={value}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                    className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-white mb-1">
                Experience: <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-1">Years</label>
                  <input
                    min={0}
                    type="number"
                    value={formData.ExperienceYearly}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ExperienceYearly: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-1">
                    Months
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.experienceMonths}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        experienceMonths: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
                   focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              {!shouldHideSongsPlanned && (
                <>
                  <div className="flex-grow">
                    <label className="block w-full mb-1">
                      Number of songs planning:{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      min={0}
                      type="number"
                      value={formData.songsPlanned}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          songsPlanned: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
       focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block w-full mb-1">
                      Song planning duration:{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.songPlanningDuration} // Bind it to the form data
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          songPlanningDuration: e.target.value, // Update with selected value
                        }))
                      }
                      className="w-full h-12 border-l-[1px] border-t-[1px] border-r-[1px] backdrop-blur-md border-[#757475] px-4 text-white bg-[rgba(30,30,30,0.7)] rounded-full outline-none shadow-inner
       focus:ring-2 focus:bg-[rgb(93 ,201,222,0.5)] outline-none  focus:border-[#5DC8DF]  transition duration-200"
                    >
                      <option value="">Select One</option>
                      <option value="monthly">Per Monthly</option>
                      <option value="quarterly">Per Quarterly</option>
                      <option value="yearly">Per Yearly</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-400 text-black py-3 rounded-full hover:font-bold mt-6 flex items-center  justify-center"
            >
              Continue <span className="ml-2">→</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDetailsForm;
