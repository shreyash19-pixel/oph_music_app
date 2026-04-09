import React, { useEffect, useState, useRef, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axiosApi from "../../../../../conf/axios";
import PlayButton from "../../../../../../public/assets/images/play_button.png";
import { Image, Shimmer } from "react-shimmer";
import { Link } from "react-router-dom";
import { buildResourcePath } from "../../../../../utils/resourceSlug";
import toast from "react-hot-toast";
import CustomVideoPlayer from "../../../../../components/CustomVideoPlayer/CustomVideoPlayer";

function SuccessSlider({ searchText, title }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = useRef([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [allSuccess, setAllSuccess] = useState([]);

  useEffect(() => {
    const fetchSuccessStories = async () => {
      try {
        const response = await axiosApi.get("/allStories");
        const sortedData = (response.data.data || []).sort(
          (a, b) => b.views - a.views,
        );
        setAllSuccess(sortedData);
      } catch (err) {
        console.error("Error fetching success stories:", err);
        toast.error("Failed to load success stories.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuccessStories();
  }, []);

  const filteredSuccess = useMemo(() => {
    if (searchText) {
      return allSuccess.filter((story) => {
        const searchLower = searchText.toLowerCase();
        return (
          story.title.toLowerCase().includes(searchLower) ||
          story.artist_name?.toLowerCase().includes(searchLower) ||
          story.credit_name?.toLowerCase().includes(searchLower) ||
          (story.keywords && story.keywords.toLowerCase().split(',').some(keyword => 
            keyword.trim().includes(searchLower)
          ))
        );
      });
    }
    return allSuccess;
  }, [searchText, allSuccess]);

  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setIsModalOpen(true);
    setIsPlaying(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo("");
    setIsPlaying(false);
  };

  const modalVideoRef = useRef(null);

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
    if (isDragging) return;

    if (
      playingIndex !== null &&
      playingIndex !== index &&
      videoRefs.current[playingIndex]
    ) {
      videoRefs.current[playingIndex].pause();
      videoRefs.current[playingIndex].currentTime = 0;
    }

    if (playingIndex === index) {
      videoRefs.current[index].pause();
      videoRefs.current[index].currentTime = 0;
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

  const settings = {
    infinite: filteredSuccess.length >= 3,
    speed: 500,
    slidesToShow: filteredSuccess.length >= 3 ? 3 : filteredSuccess.length,
    slidesToScroll: 1,
    autoplay: !isModalOpen,
    autoplaySpeed: 3000,
    dots: false,
    arrows: false,
    centerMode: filteredSuccess.length >= 3,
    centerPadding: filteredSuccess.length >= 3 ? "15%" : "0",
    beforeChange: () => setIsDragging(true),
    afterChange: () => {
      setIsDragging(false);
      stopAllVideos();
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow:
            filteredSuccess.length >= 3 ? 3 : filteredSuccess.length,
          centerPadding: filteredSuccess.length >= 3 ? "12%" : "0",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow:
            filteredSuccess.length >= 2 ? 2 : filteredSuccess.length,
          centerPadding: filteredSuccess.length >= 2 ? "6%" : "0",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "20%",
          infinite: filteredSuccess.length >= 2,
          centerMode: filteredSuccess.length >= 2,
        },
      },
    ],
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Handle no matching content
  if (filteredSuccess.length === 0) {
    return (
      <div className="bg-black text-white py-7 text-center">
        <div className="container mx-auto px-4 lg:px-16">
          <h2 className="text-xl lg:text-4xl font-bold uppercase mt-2">
            No Success Stories Found
          </h2>
          {searchText && (
            <p className="text-gray-400 mt-2">
              No content found matching "{searchText}".
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="stories-section" className="bg-black text-white py-7">
      <div className="container mx-auto mb-12 px-4 lg:px-16">
        {title ? (
          <h2 className="text-[#5DC9DE] text-2xl font-bold uppercase drop-shadow-[0_0_20px_white] text-center">
            {title}
          </h2>
        ) : (
          <h1 className="text-xl lg:text-4xl font-bold text-center mb-8 leading-tight uppercase mt-2">
            Success Stroies
          </h1>
        )}
      </div>

      <div className="success-slider w-full px-4 lg:px-16">
        {filteredSuccess.length <= 2 ? (
          <div className="flex justify-center flex-wrap gap-4">
            {filteredSuccess.map((success, index) => (
              <div
                key={index}
                className="px-2 lg:px-4 w-full sm:w-1/2 md:w-1/3"
              >
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
                      alt={success.title}
                      NativeImgProps={{
                        className: "w-full h-full object-cover",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                    <img
                      src={PlayButton}
                      alt="Play"
                      className="w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
                    />
                  </div>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <Link
                    to={buildResourcePath("story", success.id, success.title)}
                    className="block text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer"
                  >
                    {success.title}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {filteredSuccess.map((success, index) => (
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
                      alt={success.title}
                      NativeImgProps={{
                        className: "w-full h-full object-cover",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                    <img
                      src={PlayButton}
                      alt="Play"
                      className="w-16 h-16 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 text-center">
                  <Link
                    to={buildResourcePath("story", success.id, success.title)}
                    className="block text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer"
                  >
                    {success.title}
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
        )}

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            onClick={closeModal}
          >
            <div
              className="relative bg-black rounded-lg shadow-2xl w-full max-w-[440px] aspect-[9/16] mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-white w-10 h-10 rounded-full flex items-center justify-center text-3xl z-50 font-bold"
                onClick={closeModal}
              >
                &times;
              </button>
              <div className="relative h-auto w-auto">
                <CustomVideoPlayer
                  ref={modalVideoRef}
                  id="video-player-success"
                  src={selectedVideo}
                  className="rounded-lg w-full object-contain"
                  autoPlay
                  pauseOtherVideos={true}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuccessSlider;
