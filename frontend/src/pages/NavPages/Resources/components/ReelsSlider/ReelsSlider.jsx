import React, { useEffect, useState, useRef, useMemo } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import axiosApi from "../../../../../conf/axios";
import PlayButton from "../../../../../../public/assets/images/play_button.png";
import { Image, Shimmer } from "react-shimmer";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import CustomVideoPlayer from "../../../../../components/CustomVideoPlayer/CustomVideoPlayer";

function ReelsSlider({ searchText, title }) {
  const [isDragging, setIsDragging] = useState(false);
  const [allReels, setAllReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const videoRefs = useRef([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await axiosApi.get("/allReels");
        const sortedData = (response.data.data || []).sort(
          (a, b) => b.views - a.views,
        );
        setAllReels(sortedData);
      } catch (err) {
        console.error("Error fetching reels:", err);
        toast.error("Failed to load reels.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReels();
  }, []);

  const filteredReels = useMemo(() => {
    if (searchText) {
      return allReels.filter((reel) => {
        const searchLower = searchText.toLowerCase();
        return (
          reel.title.toLowerCase().includes(searchLower) ||
          reel.artist_name?.toLowerCase().includes(searchLower) ||
          reel.credit_name?.toLowerCase().includes(searchLower) ||
          (reel.keywords && reel.keywords.toLowerCase().split(',').some(keyword => 
            keyword.trim().includes(searchLower)
          ))
        );
      });
    }
    return allReels;
  }, [searchText, allReels]);

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

  const stopAllVideos = () => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    setPlayingIndex(null);
  };

  const settings = {
    infinite: filteredReels.length >= 3,
    speed: 500,
    slidesToShow: filteredReels.length >= 3 ? 3 : filteredReels.length,
    slidesToScroll: 1,
    autoplay: !isModalOpen,
    autoplaySpeed: 3000,
    dots: false,
    arrows: false,
    centerMode: filteredReels.length >= 3,
    centerPadding: filteredReels.length >= 3 ? "15%" : "0",
    beforeChange: () => setIsDragging(true),
    afterChange: () => {
      setIsDragging(false);
      stopAllVideos();
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: filteredReels.length >= 3 ? 3 : filteredReels.length,
          centerPadding: filteredReels.length >= 3 ? "12%" : "0",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: filteredReels.length >= 2 ? 2 : filteredReels.length,
          centerPadding: filteredReels.length >= 2 ? "6%" : "0",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerPadding: "20%",
          infinite: filteredReels.length >= 2,
          centerMode: filteredReels.length >= 2,
        },
      },
    ],
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (filteredReels.length === 0) {
    return (
      <div className="bg-black text-white py-12 text-center">
        <div className="container mx-auto px-4 lg:px-16">
          <h2 className="text-xl lg:text-5xl font-bold uppercase mt-4">
            No Reels Found
          </h2>
          {searchText && (
            <p className="text-gray-400 mt-4 text-lg">
              No content found matching "{searchText}".
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="reels-section" className="bg-black text-white py-12">
      <div className="container mx-auto mb-16 px-4 lg:px-16">
        {title ? (
          <h2 className="text-[#5DC9DE] text-3xl md:text-4xl font-bold uppercase drop-shadow-[0_0_20px_white] text-center">
            {title}
          </h2>
        ) : (
          <h1 className="text-2xl md:text-5xl font-bold text-center mb-10 leading-tight uppercase mt-4">
            Reels
          </h1>
        )}
      </div>

      <div className="reels-slider w-full px-4 lg:px-16">
        {filteredReels.length <= 2 ? (
          <div className="flex justify-center flex-wrap gap-6 md:gap-8 lg:gap-10">
            {filteredReels.map((reel, index) => (
              <div
                key={index}
                className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
              >
                <div
                  className="relative overflow-hidden rounded-2xl cursor-pointer shadow-lg transform transition-transform duration-300 hover:scale-105"
                  style={{ aspectRatio: "3/4.5" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => handleMouseUp(reel.video_url)}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <Image
                      src={reel.thumbnail_url}
                      fallback={<Shimmer width={400} height={500} />}
                      alt={reel.title}
                      NativeImgProps={{
                        className: "w-full h-full object-cover",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                    <img
                      src={PlayButton}
                      alt="Play"
                      className="w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                    />
                  </div>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer">
                    {reel.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {filteredReels.map((reel, index) => (
              <div key={index} className="px-3 lg:px-6">
                <div
                  className="relative overflow-hidden rounded-2xl cursor-pointer shadow-lg transform transition-transform duration-300 hover:scale-105"
                  style={{ aspectRatio: "3/4.5" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={() => handleMouseUp(reel.video_url)}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <Image
                      src={reel.thumbnail_url}
                      fallback={<Shimmer width={400} height={500} />}
                      alt={reel.title}
                      NativeImgProps={{
                        className: "w-full h-full object-cover",
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center">
                    <img
                      src={PlayButton}
                      alt="Play"
                      className="w-20 h-20 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24"
                    />
                  </div>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <h3 className="text-xl md:text-2xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer">
                    {reel.title}
                  </h3>
                </div>
              </div>
            ))}
          </Slider>
        )}

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="relative bg-black rounded-lg shadow-2xl max-w-4xl w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-white w-12 h-12 rounded-full bg-gray-800 bg-opacity-50 hover:bg-opacity-75 flex items-center justify-center text-4xl z-50 font-bold transition-colors duration-200"
                onClick={closeModal}
              >
                &times;
              </button>
              <div className="relative w-full h-full">
                <CustomVideoPlayer
                  ref={modalVideoRef}
                  id="video-player-reels"
                  src={selectedVideo}
                  className="rounded-lg w-full h-full"
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

export default ReelsSlider;
