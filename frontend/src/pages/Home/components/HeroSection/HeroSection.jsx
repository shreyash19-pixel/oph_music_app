import React, { useEffect, useRef, useState } from "react";
import RegistrationModal from "../../../../components/registration/Registration";
import axiosApi from "../../../../conf/axios";
import formatDateAndAdjustMonth from "../../../../utils/date";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeSelectedEvent } from "../../../../slice/events";
import SongDetails from "../../../SongDetails/SongDetails";
import SongCard from "../../../../components/SongCard";
import Video from '../../../../assets/videos/video.mp4'

const HeroSection = ({ firstEvent }) => {
  const [videoModal, setVideoModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const eventID = useSelector((state) => state.event.selectedEvent);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [isPlaying, setIsPlaying] = useState(false); // Track video play state
  const videoRef = useRef(null);
  const [video, setVideo] = useState(Video);

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

  useEffect(() => {}, [firstEvent]);

  const handleClick = async (e) => {
    console.log(e);
    dispatch(changeSelectedEvent({ data: e }));
    // Navigate to the payment page
    await navigate("/dashboard/payment", {
      state: {
        amount: e.registrationFee_normal,
        // planIds: [e.payment_plan_id],
        returnPath: "/dashboard/events",
        heading: "Complete Event Registration",
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
        <img
          src="https://images.pexels.com/photos/30799437/pexels-photo-30799437/free-photo-of-women-surfing-adventure-on-bali-beach.jpeg?auto=compress&cs=tinysrgb&w=600"
          alt="Video thumbnail"
          className="w-full h-full object-cover opacity-90"
        />

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
      </div>

      {/* <SongDetails/> */}

      <SongCard
        releaseData = {firstEvent}
      />

      {/* Event Banner */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-6 sm:ps-10 ps-6 pe-6 bg-cover bg-center rounded-2xl"
        style={{
          backgroundImage: "url('/assets/images/songUploadCardBg.png')",
        }}
      >
        {firstEvent && (
          <div className="flex flex-col md:flex-row gap-6 mt-6 w-full">
            {/* Left Content Section */}
            <div className="w-full md:w-2/3 space-y-4">
              {/* Header */}
              <div>
                <p className="text-cyan-400 text-lg sm:text-xl font-extrabold">
                  NEW EVENT
                </p>
                <h2 className="text-white text-xl sm:text-2xl font-extrabold mt-1 uppercase break-words">
                  {firstEvent.EventName}
                </h2>
              </div>

              {/* Details */}
              <div className="text-slate-300 text-sm sm:text-base space-y-2">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Competition Date:</span>
                  <span className="font-medium text-white">
                    {formatDateAndAdjustMonth(firstEvent.dateTime)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Registration Date:</span>
                  <span className="font-medium text-white">
                    {formatDateAndAdjustMonth(firstEvent.registrationStart)} -{" "}
                    {formatDateAndAdjustMonth(firstEvent.registrationEnd)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <span>Registration Fee:</span>
                  <span className="font-medium text-white">
                    {firstEvent.registrationFee_normal}/-
                  </span>
                </div>
              </div>

              {/* Register Button */}
              <div>
                {firstEvent.is_registered ? (
                  <button className="bg-[#5DC9DE] text-black rounded-full px-6 py-2 font-semibold transition-all hover:scale-105 hover:-rotate-1">
                    Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(firstEvent)}
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
                src={firstEvent.image}
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
          id={firstEvent?.event_id}
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
            <video
              id="video-player"
              className="w-full h-auto max-h-[70vh] rounded-lg"
              autoPlay
              playsInline
              onPause={() =>
                document
                  .getElementById("play-button")
                  .classList.remove("hidden")
              }
              onPlay={() =>
                document.getElementById("play-button").classList.add("hidden")
              }
            >
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
