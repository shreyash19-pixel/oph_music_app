import React, { useEffect, useRef, useState } from "react";
import RegistrationModal from "../../../../components/registration/Registration";
import axiosApi from "../../../../conf/axios";
import formatDateAndAdjustMonth, { isRegistrationOpen, isRegistrationNotStartedYet, formatDateIST } from "../../../../utils/date";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useArtist } from "../../../auth/API/ArtistContext";
import { changeSelectedEvent } from "../../../../slice/events";
import SongDetails from "../../../SongDetails/SongDetails";
import SongCard from "../../../../components/SongCard";
import Video from '../../../../assets/videos/video.mp4'
import CustomVideoPlayer from "../../../../components/CustomVideoPlayer/CustomVideoPlayer";

const HeroSection = ({ upcomingSong, upcomingEvent }) => {
  const [videoModal, setVideoModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const eventID = useSelector((state) => state.event.selectedEvent);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { ophid } = useArtist();

  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const fetchPageMedia = async () => {
    try {
      const response = await axiosApi.get("/page-media?page_name=home");
      if (response.data.success && response.data.data) {
        setVideo(response.data.data.video_url);
        setThumbnail(response.data.data.thumbnail_url);
      }
    } catch (err) {
      console.log(err);
    }
  };
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
  useEffect(() => {
    fetchPageMedia();
  }, []);

  const handleClick = async (e) => {
    dispatch(changeSelectedEvent({ data: e }));
    // Navigate to event-specific payment page
    navigate("/dashboard/payment", {
      state: {
        OPH_ID: ophid,
        amount: e.registrationFee_normal,
        event_id: e.event_id,
        returnPath: "/dashboard/events",
        heading: "Complete Event Registration",
        from: "Event Registration",
      },
    });
  };

  // const createEventReg = async () => {
  //   const token = getToken();
  //   if (location.state?.status === "success") {
  //     const payment_id = location.state.paymentData.newPaymentIds[0];

  //     const response = await axiosApi.post(
  //       `/events/${firstEvent.id}/artist-booking`,
  //       {
  //         payment_id: payment_id,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (response.status == 200) {
  //       console.log("Success");
  //     }
  //   }
  // };

  // useEffect(() => {
  //   createEventReg();
  // }, [location.state]);

  return (
    <div className="space-y-6 px-8 p-4">
      {/* Video Preview */}
      <div className="relative h-[30vh] lg:h-[50vh] w-full rounded-lg overflow-hidden">
        {thumbnail && (
          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-90"
          />
        )}

        {video && (
          <button
            onClick={() => setVideoModal(true)}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <img
              src="/assets/images/play_button.png"
              className="w-[150px]"
              alt="Play"
            />
          </button>
        )}
      </div>

      {/* <SongDetails/> */}

      {Object.values(upcomingSong).length > 0  &&  (<SongCard
        releaseData = {upcomingSong}
      />)}

      {/* Event Banner */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-6 sm:ps-10 ps-6 pe-6 bg-cover bg-center rounded-2xl"
        style={{
          backgroundImage: "url('/assets/images/songUploadCardBg.png')",
        }}
      >
        {upcomingEvent && (
          <div className="flex flex-col md:flex-row gap-6 mt-6 w-full">
            {/* Left Content Section */}
            <div className="w-full md:w-2/3 space-y-4">
              {/* Header */}
              <div>
                <p className="text-cyan-400 text-lg sm:text-xl font-extrabold">
                  NEW EVENT
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-extrabold mt-1 uppercase break-words">
                  {upcomingEvent.EventName}
                </h2>
              </div>

              {/* Details */}
              <div className="text-slate-300 text-sm sm:text-base space-y-2">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Competition Date:</span>
                  <span className="font-medium text-white">
                    {formatDateAndAdjustMonth(upcomingEvent.dateTime)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Registration Date:</span>
                  <span className="font-medium text-white">
                    {formatDateAndAdjustMonth(upcomingEvent.registrationStart)} -{" "}
                    {formatDateAndAdjustMonth(upcomingEvent.registrationEnd)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Registration Fee:</span>
                  <span className="font-medium text-white">
                    {upcomingEvent.registrationFee_normal}/-
                  </span>
                </div>
              </div>

              {/* Register Button – same logic as Events page: active period only clickable */}
              <div>
                {upcomingEvent.is_registered ? (
                  <button className="bg-[#5DC9DE] text-black rounded-full px-6 py-2 font-semibold transition-all hover:scale-105 hover:-rotate-1">
                    Registered
                  </button>
                ) : isRegistrationNotStartedYet(upcomingEvent) ? (
                  <button
                    type="button"
                    disabled
                    className="bg-slate-600 text-slate-300 rounded-full px-6 py-2 font-semibold cursor-not-allowed"
                    title={`Registration opens at 12:00 AM IST on ${formatDateIST(upcomingEvent.registrationStart)}`}
                  >
                    Registration opens 12:00 AM IST, {formatDateIST(upcomingEvent.registrationStart)}
                  </button>
                ) : !isRegistrationOpen(upcomingEvent) ? (
                  <button
                    type="button"
                    disabled
                    className="bg-slate-600 text-slate-300 rounded-full px-6 py-2 font-semibold cursor-not-allowed"
                  >
                    Closed
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(upcomingEvent)}
                    className="bg-[#5DC9DE] text-black rounded-full px-6 py-2 font-semibold transition-all hover:scale-105 hover:-rotate-1"
                  >
                    Register
                  </button>
                )}
              </div>
            </div>

            {/* Right Image Section */}
            <div className="w-full md:w-[35%]">
              <img
                src={upcomingEvent.image}
                alt="Event thumbnail"
                className="w-full h-full max-h-[250px] object-cover rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <RegistrationModal
          id={upcomingEvent?.event_id}
          setIsModalOpen={setIsModalOpen}
        />
      )}

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 -top-[5%] bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setVideoModal(false)}
        >
          <div
            className="relative w-[90%] md:w-[60%] lg:w-[50%] max-h-[80%] bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()} // Prevent modal close on video click
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModal(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold z-50"
            >
              ✕
            </button>

            {/* Play button */}
            <button
              onClick={() => {
                const video = document.getElementById("video-player");
                console.log(video);
                
                if (video.paused) {
                  console.log("hello");
                  video.play();
                } else {
                  video.pause();
                }
              }}
              className="absolute inset-0 flex items-center justify-center z-40"
            >
              <img
                src="/assets/images/play_button.png"
                alt="Play"
                className="w-[100px] hidden" // Initially hidden
                id="play-button"
              />
            </button>

            {/* Video */}
            <CustomVideoPlayer
              id="video-player"
              src={video}
              className="w-full h-auto max-h-[70vh] rounded-lg"
              autoPlay
              pauseOtherVideos={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
