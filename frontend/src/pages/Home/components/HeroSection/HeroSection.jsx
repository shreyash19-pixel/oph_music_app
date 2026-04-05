import React, { useEffect, useRef, useState } from "react";
import RegistrationModal from "../../../../components/registration/Registration";
import axiosApi from "../../../../conf/axios";
import formatDateAndAdjustMonth, { isRegistrationOpen, isRegistrationNotStartedYet, formatRegistrationStartDate, formatRegistrationEndDate } from "../../../../utils/date";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useArtist } from "../../../auth/API/ArtistContext";
import { changeSelectedEvent } from "../../../../slice/events";
import SongDetails from "../../../SongDetails/SongDetails";
import SongCard from "../../../../components/SongCard";
import Video from '../../../../assets/videos/video.mp4'
import CustomVideoPlayer from "../../../../components/CustomVideoPlayer/CustomVideoPlayer";

const isArtistRegistered = (eventId, artistBookEvents = []) =>
  artistBookEvents.some(
    (e) =>
      Number(e.event_id) === Number(eventId) &&
      (e.status === "under review" || e.status === "accepted")
  );

/** API / parent may pass a single object or an array of releases; SongCard needs one object. */
function firstUpcomingRelease(raw) {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  if (typeof raw === "object") return raw;
  return null;
}

const HeroSection = ({ upcomingSong, upcomingEvent, artistBookEvents = [] }) => {
  const [videoModal, setVideoModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
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

  const slides = [];
  if (upcomingSong && Object.keys(upcomingSong).length > 0) slides.push({ type: 'song', data: upcomingSong });
  if (upcomingEvent) slides.push({ type: 'event', data: upcomingEvent });

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    if (touchStart - touchEnd < -50) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

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

      {/* Slider Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides[currentSlide]?.type === 'song' && (() => {
          const row = firstUpcomingRelease(slides[currentSlide].data);
          if (!row || typeof row !== "object" || Object.keys(row).length === 0) return null;
          return <SongCard releaseData={row} />;
        })()}

        {slides[currentSlide]?.type === 'event' && (
          <div
            className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 py-6 sm:ps-10 ps-6 pe-6 bg-cover bg-center rounded-2xl"
            style={{
              backgroundImage: "url('/assets/images/songUploadCardBg.png')",
            }}
          >
            <div className="flex flex-col md:flex-row gap-6 mt-6 w-full">
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <p className="text-cyan-400 text-lg sm:text-xl font-extrabold">
                    NEW EVENT
                  </p>
                  <h2 className="text-white text-xl sm:text-2xl font-extrabold mt-1 uppercase break-words">
                    {slides[currentSlide].data.EventName}
                  </h2>
                </div>
                <div className="text-slate-300 text-sm sm:text-base space-y-2">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span>Competition Date:</span>
                    <span className="font-medium text-white">
                      {formatDateAndAdjustMonth(slides[currentSlide].data.dateTime)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span>Registration:</span>
                    <span className="font-medium text-white">
                      {formatRegistrationStartDate(slides[currentSlide].data.registrationStart)} to {formatRegistrationEndDate(slides[currentSlide].data.registrationEnd)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span>Registration Fee:</span>
                    <span className="font-medium text-white">
                      {slides[currentSlide].data.registrationFee_normal}/-
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentSlide ? "bg-cyan-400 w-6" : "bg-slate-500"
                }`}
              />
            ))}
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
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setVideoModal(false)}
              className="absolute top-4 right-4 text-white text-2xl font-bold z-50"
            >
              ✕
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
