import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axiosApi from "../../../../../conf/axios";  // Your API config
import PlayButton from "../../../../../../public/assets/images/play_button.png"; // Play Button Image
import { Image, Shimmer } from "react-shimmer";
import { Link } from "react-router-dom";

function SuccessSlider({ searchText ,title  }) {
  const [isDragging, setIsDragging] = useState(false);
  const [successData, setSuccessData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = useRef([]);
const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [allSuccess, setAllSuccess] = useState([]);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await axiosApi.get("/success-stories");
        setAllSuccess(response.data.data); // Save original data
        setSuccessData(response.data.data); // Initially show all
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContents();
  }, []);
  
  useEffect(() => {
    if (searchText) {
      const filteredSuccess = allSuccess.filter((reel) =>
        reel.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setSuccessData(filteredSuccess);
    } else {
      setSuccessData(allSuccess); // Restore original list
    }
  }, [searchText, allSuccess]);
  
  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setIsModalOpen(true);
    setIsPlaying(true);
    setTimeout(() => {
      document.getElementById("video-player").play();
    }, 300);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo("");
    setIsPlaying(false);
  };
  const togglePlayPause = (e) => {
    e.stopPropagation();
    const video = document.getElementById("video-player");
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  const handleMouseDown = () => {
    setIsDragging(false);
  };

  const handleMouseMove = () => {
    setIsDragging(true);
  };

  const handleMouseUp = (videoUrl) => {
    if (!isDragging) {
      openModal(videoUrl);
    }
  };

  
  const handlePlayPauseVideo = (index) => {
    if (isDragging) return; // Prevent playing while dragging

    // Pause the currently playing video if it's different
    if (playingIndex !== null && playingIndex !== index && videoRefs.current[playingIndex]) {
      videoRefs.current[playingIndex].pause();
      videoRefs.current[playingIndex].currentTime = 0; // Reset the video to the beginning
    }

    // Toggle play/pause for the clicked video
    if (playingIndex === index) {
      videoRefs.current[index].pause();
      videoRefs.current[index].currentTime = 0; // Reset the video to the beginning
      setPlayingIndex(null);
    } else {
      setPlayingIndex(index);
      if (videoRefs.current[index]) {
        videoRefs.current[index].play();
      }
    }
  };

  const stopAllVideos = () => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
      }
    });
    setPlayingIndex(null);
  };

  // Set slick slider settings based on success data count
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: successData.length >= 3 ? 3 : successData.length, // Show up to 3 slides
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: false,
    centerMode: successData.length >= 3, // Enable centering for 3+ items
    centerPadding: successData.length >= 3 ? "15%" : "0", // Adjust center padding for 3+ items
    beforeChange: () => setIsDragging(true),
    afterChange: () => {
      setIsDragging(false);
      stopAllVideos(); // Stop video when slider moves
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: successData.length >= 3 ? 3 : successData.length,
          centerPadding: successData.length >= 3 ? "12%" : "0",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: successData.length >= 3 ? 2 : successData.length,
          centerPadding: successData.length >= 3 ? "6%" : "0",
        },
      },
    ],
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-black text-white py-7">
      <div className="container mx-auto mb-12 px-4 lg:px-16">
        {title ? (
          <h2 className="text-[#5DC9DE] text-2xl font-bold uppercase drop-shadow-[0_0_20px_white] text-center">
            {title}
          </h2>
        ) : (
          <h1 className="text-xl lg:text-4xl font-bold text-center mb-8 leading-tight uppercase mt-2">
            Artist Songs
          </h1>
        )}
      </div>

      <div className="success-slider w-full px-4 lg:px-16">
        {/* If there are less than 3 items, show them without the slider */}
        {successData.length < 3 ? (
          <div className="flex overflow-x-auto">
            {successData.map((success, index) => (
              <div key={index} className="px-2 lg:px-4 w-full">
                <div className="rounded-xl overflow-hidden relative">
                  {playingIndex === index ? (
                   <video
                   ref={(el) => (videoRefs.current[index] = el)}
                   autoPlay
                   src={success.video_url}
                   controls
                   
                   className="w-full sm:w-[90%] h-auto sm:h-[300px] lg:h-[400px] object-cover rounded-xl"
                   onEnded={() => setPlayingIndex(null)}
                   onClick={() => handlePlayPauseVideo(index)}
                 />
                  ) : (
                    <div className="relative cursor-pointer overflow-hidden">
                      <div className="w-full h-[100px] sm:h-[400px]">
                        <Image
                          src={success.thumbnail_url}
                          fallback={<Shimmer width={100} height={400} />}
                          alt={success.title}
                          NativeImgProps={{
                            className: "w-[90%] h-full object-cover rounded-xl",
                          }}
                        />
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => handlePlayPauseVideo(index)}
                      >
                        <img
                          src={PlayButton}
                          className="w-[80px] sm:w-[150px]"
                          alt="Play Button"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer ">
                      {success.title}
                    </h3>
                  <div className="text-gray-400 text-sm sm:text-base">
                    {/* <span>{success.artist_name}</span> */}
                    {/* <span className="mx-2">—</span>
                    <span>{success.duration_in_minutes || "--"} min</span>
                    <span className="mx-2">—</span>
                    <span>{success.total_views}+ Views</span> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {successData.map((success, index) => (
              <div key={index} className="px-2 lg:px-4 w-full">
                  <div
                                    className="relative overflow-hidden rounded-xl cursor-pointer"
                                    style={{ aspectRatio: "3/4.5" }}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={() => handleMouseUp(success.video_url)}
                                  >
                                    <div className="w-full h-full rounded-xl overflow-hidden">
                                      <Image
                                        src={success.thumbnail_url}
                                        fallback={<Shimmer width={300} height={400} />}
                                        alt={success.name}
                                        NativeImgProps={{
                                          className: "w-full h-full object-cover",
                                        }}
                                      />
                                    </div>
                
                                    {/* Play button positioned at the center */}
                
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                                      <img
                                        src="/assets/images/playButton.png"
                                        alt="Play"
                                        className="w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
                                      />
                
                                      {/* <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                                                                  <path d="M8 5v14l11-7z" />
                                                                </svg> */}
                                    </div>
                                  </div>

                <div className="p-4 sm:p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer ">
                      {success.title}
                    </h3>
                  <div className="text-gray-400 text-sm sm:text-base">
                    {/* <span>{success.artist_name}</span> */}
                    {/* <span className="mx-2">—</span>
                    <span>{success.duration_in_minutes || "--"} min</span>
                    <span className="mx-2">—</span>
                    <span>{success.total_views}+ Views</span> */}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
         {isModalOpen && (
          <div
            className=" fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50  "
            onClick={closeModal}
          >
            <div
              className="relative bg-black rounded-lg shadow-lg  max-w-2xl "
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-0 right-0  text-white w-12 h-12 rounded-full flex items-center justify-center text-3xl z-50 font-bold shadow-lg"
                onClick={closeModal}
              >
                &times;
              </button>

              <div className="relative h-auto w-auto">
                <video
                  id="video-player"
                  src={selectedVideo}
                  className="rounded-lg"
                  autoPlay
                  playsInline
                  controls
                />
                {!isPlaying && (
                  <button
                    onClick={togglePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-6xl rounded-full w-20 h-20 mx-auto my-auto"
                  >
                    ▶
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuccessSlider;
