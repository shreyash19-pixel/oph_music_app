'use strict';
import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";
import axiosApi from "../../../../../conf/axios";
import PlayButton from "../../../../../../public/assets/images/play_button.png";
import { Link, useNavigate } from "react-router-dom";
import { Image, Shimmer } from "react-shimmer";

function PodcastSlider({ searchText ,title }) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  // const [podcastData, setPodcastData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isPlayButtonClicked, setIsPlayButtonClicked] = useState(false);
  const videoRefs = useRef([]);
  const [allPodcasts, setAllPodcasts] = useState([]);
  const [podcastData, setPodcastData] = useState([]);
  
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await axiosApi.get("/podcasts");
        setAllPodcasts(response.data.data); // Save original data
        setPodcastData(response.data.data); // Initially show all
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
      const filteredPodcasts = allPodcasts.filter((podcast) =>
        podcast.title.toLowerCase().includes(searchText.toLowerCase())
      );
      setPodcastData(filteredPodcasts);
    } else {
      setPodcastData(allPodcasts); // Restore original list
    }
  }, [searchText, allPodcasts]);
  
  


  const formatListeners = (views) => {
    if(views === undefined || views === null) return "0 Listeners";
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M Listeners`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K Listeners`;
    }
    return `${views}+ Listeners`;
  };

  const handlePlayPauseVideo = (index) => {
  debugger
    if (isDragging) return;

    // Set the flag to true when play button is clicked
    setIsPlayButtonClicked(true);

    // First, stop all videos
    videoRefs.current.forEach((video, idx) => {
      if (video && idx !== index) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Set the playing index and start playing
    setPlayingIndex(index);
    if (videoRefs.current[index]) {
      videoRefs.current[index].play();
    }

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsPlayButtonClicked(false);
    }, 1000);
  };

  const handleVideoPlay = (index) => {
    // Only pause other videos if the play button wasn't clicked
    if (!isPlayButtonClicked) {
      videoRefs.current.forEach((video, idx) => {
        if (video && idx !== index) {
          video.pause();
          video.currentTime = 0;
        }
      });
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

  // Set slick slider settings based on podcast data count
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: podcastData.length >= 3 ? 1 : podcastData.length, // Show up to 3 slides
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: false,
    centerMode: podcastData.length >= 3, // Enable centering for 3+ items
    centerPadding: podcastData.length >= 3 ? "15%" : "0", // Adjust center padding for 3+ items
    beforeChange: () => setIsDragging(true),
    afterChange: () => {
      setIsDragging(false);
      stopAllVideos(); // Stop video when slider moves
    },
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: podcastData.length >= 3 ? 1: podcastData.length,
          centerPadding: podcastData.length >= 3 ? "12%" : "0",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: podcastData.length >= 3 ? 1 : podcastData.length,
          centerPadding: podcastData.length >= 3 ? "6%" : "0",
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
            BUILT FOR ARTISTS - BACKED BY COMMUNITY

            <br />
            <span className="text-[#5DC9DE]">
            ARTISTS LEARNING MUSIC PLATFORM STARTS HERE
            </span>
          </h1>
        )}
      </div>

      <div className="podcast-slider w-full px-4 lg:px-16">
        {/* If there are less than 3 items, show them without the slider */}
        {podcastData.length < 3 ? (
          <div className="flex overflow-x-auto">
            {podcastData.map((podcast, index) => (
              <div key={index} className="px-2 lg:px-4 w-full">
                <div className="rounded-xl overflow-hidden relative">
                  {playingIndex === index ? (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={podcast.video_url}
                      controls
                      className="w-full sm:w-[95%] lg:w-[95%] aspect-[16/9] object-cover rounded-xl mx-auto"
                      onEnded={() => setPlayingIndex(null)}
                      onPlay={() => handleVideoPlay(index)}
                      autoplay
                    />
                  ) : (
                    <div className="relative cursor-pointer overflow-hidden">
                      <div className="w-full sm:w-[95%] lg:w-[95%] aspect-[16/9] mx-auto">
                        <Image
                          src={podcast.thumbnail_url}
                          fallback={<Shimmer width={160} height={90} />}
                          alt={podcast.title}
                          NativeImgProps={{
                            className: "w-full h-full object-cover rounded-xl",
                          }}
                        />
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => handlePlayPauseVideo(index)}
                      >
                        <img
                          src={PlayButton}
                          className="w-[100px] sm:w-[150px]"
                          alt="Play Button"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 text-center">
                  <Link to={`/content/${podcast.id}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer ">
                      {podcast.title}
                    </h3>
                  </Link>
                  <div className="text-gray-400 text-sm sm:text-base">
                    <span>{podcast.artist_name}</span>
                    <span className="mx-2">—</span>
                    <span>{podcast.duration_in_minutes || "--"} min</span>
                    <span className="mx-2">—</span>
                    <span>{formatListeners(podcast.views)}</span>
                    <br />
                    <span>{podcast.credit_name || ""}</span>
                    <span>
                      {podcast.keywords?.map((keyword, index) => (
                        <span key={index}>{keyword}</span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Slider {...settings}>
            {podcastData.map((podcast, index) => (
              <div key={index} className="px-2 lg:px-4 w-full">
                <div className="rounded-xl overflow-hidden relative">
                  {playingIndex === index ? (
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={podcast.video_url}
                      controls
                      className="w-full sm:w-[95%] lg:w-[95%] aspect-[16/9] object-cover rounded-xl mx-auto"
                      onEnded={() => setPlayingIndex(null)}
                      onPlay={() => handleVideoPlay(index)}
                      autoplay
                    />
                  ) : (
                    <div className="relative cursor-pointer overflow-hidden">
                      <div className="w-full sm:w-[95%] lg:w-[95%] aspect-[16/9] mx-auto">
                        <Image
                          src={podcast.thumbnail_url}
                          fallback={<Shimmer width={160} height={90} />}
                          alt={podcast.title}
                          NativeImgProps={{
                            className: "w-full h-full object-cover rounded-xl",
                          }}
                        />
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={() => handlePlayPauseVideo(index)}
                      >
                        <img
                          src={PlayButton}
                          className="w-[100px] sm:w-[150px]"
                          alt="Play Button"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 text-center">
                  <Link to={`/content/${podcast.id}`}>
                    <h3 className="text-xl font-semibold mb-2 hover:text-[#5DC9DE] hover:cursor-pointer ">
                      {podcast.title}
                    </h3>
                  </Link>
                  <div className="text-gray-400 text-sm sm:text-base">
                    <span>{podcast.artist_name}</span>
                    <span className="mx-2">—</span>
                    <span>{podcast.duration_in_minutes || "--"} min</span>
                    <span className="mx-2">—</span>
                    <span>{formatListeners(podcast.views)}</span>
                    <br />
                    <span>{podcast.credit_name || ""}</span>
                    <span>{podcast.keyword}</span>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        )}
          <div className="text-center mt-6 relative z-10 mb-4">
  <a
    href={import.meta.env.VITE_PORTAL_URL + "/auth/signup"}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-[#5DC9DE] text-black font-semibold py-3 px-8 rounded-full hover:font-bold transition delay-300 pointer-events-auto"
    // onClick={() => {
    //   window.open(import.meta.env.VITE_PORTAL_URL + "/auth/signup", "_blank", "noopener,noreferrer");
    // }}
    // onTouchEnd={() => {
    //   window.open(import.meta.env.VITE_PORTAL_URL + "/auth/signup", "_blank", "noopener,noreferrer");
    // }}
  >
    COMMUNITY PLATFORM – SIGN UP
  </a>
</div>

      </div>
    </div>
  );
}

export default PodcastSlider;
