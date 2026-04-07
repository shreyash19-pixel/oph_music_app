import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { Image, Shimmer } from "react-shimmer";
import "./TipsSlider.css";
import Struggle from "../../../../../../public/assets/images/struggle.png";
import Elipse3 from "../../../../../../public/assets/images/elipse3.png";
import axiosApi from "../../../../../conf/axios";
import CustomVideoPlayer from "../../../../../components/CustomVideoPlayer/CustomVideoPlayer";

const TipsSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [tips, setTips] = useState([]);
  const videoRef = useRef(null);
  const sliderRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // ✅ Fetch podcasts data
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await axiosApi.get("/allStories");
        console.log("📡 Podcasts response:", res.data);

        if (Array.isArray(res.data)) {
          console.log("✅ Setting tips from res.data, count:", res.data.length);
          setTips(res.data);
        } else if (Array.isArray(res.data.data)) {
          console.log("✅ Setting tips from res.data.data, count:", res.data.data.length);
          setTips(res.data.data);
        } else {
          console.log("⚠️ No valid data found, setting empty array");
          setTips([]);
        }
      } catch (error) {
        console.error("❌ Error fetching podcasts:", error);
        setTips([]);
      }
    };

    fetchPodcasts();
  }, []);

  const reelsData = tips;
  
  /** Disable infinite mode and prevent sliding beyond available content */
  const canSlide = reelsData.length > 3;

  const settings = {
    dots: false,
    infinite: false,
    speed: 300,
    slidesToShow: reelsData.length >= 3 ? 3 : reelsData.length,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    pauseOnHover: true,
    swipe: canSlide,
    swipeToSlide: canSlide,
    draggable: canSlide,
    touchMove: canSlide,
    touchThreshold: 10,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: reelsData.length >= 3 ? 3 : reelsData.length,
          swipe: reelsData.length > 3,
          draggable: reelsData.length > 3,
          infinite: false,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: reelsData.length >= 2 ? 2 : reelsData.length,
          swipe: reelsData.length > 2,
          draggable: reelsData.length > 2,
          infinite: false,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          swipe: reelsData.length > 1,
          draggable: reelsData.length > 1,
          infinite: false,
        },
      },
    ],
  };

  const openModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setIsModalOpen(true);
    setIsPlaying(true);
    setTimeout(() => {
      if (modalVideoRef.current && modalVideoRef.current.play) {
        modalVideoRef.current
          .play()
          .catch((err) => console.error("Play error:", err));
      }
    }, 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo("");
    setIsPlaying(false);
  };

  const modalVideoRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  return (
    <div className="bg-black relative">
      <img
        src={Struggle}
        className="absolute right-0 w-[300px] -top-[0]"
        alt=""
      />
      <img
        src={Elipse3}
        className="absolute right-0 w-[300px] -top-[250px]"
        alt=""
      />

      <div className="mx-auto">
        <div className="container px-4 lg:px-16 xl:px-16 text-white py-10 w-full">
          <h2 className="text-3xl lg:text-5xl font-bold mb-2">
            ARE YOU <span className="text-[#5DC9DE]">STRUGGLING</span> TOO?
          </h2>
          <p className="text-gray-400 max-w-2xl">
            If you're also facing challenges, working hard, and striving for
            success in music industry, join this online music community today.
          </p>
        </div>

        {/* Slider */}
        <div className="relative px-4 mb-16">
          <Slider ref={sliderRef} {...settings} className="tips-slider">
            {tips.map((tip) => (
              <div key={tip.id} className="px-2">
                <div
                  className="relative rounded-lg overflow-hidden aspect-[3/4.5] cursor-pointer"
                  onMouseDown={(e) => {
                    dragStartPos.current = { x: e.clientX, y: e.clientY };
                  }}
                  onMouseUp={(e) => {
                    const deltaX = Math.abs(e.clientX - dragStartPos.current.x);
                    const deltaY = Math.abs(e.clientY - dragStartPos.current.y);
                    if (deltaX < 10 && deltaY < 10) {
                      openModal(tip.video_url);
                    }
                  }}
                  onTouchStart={(e) => {
                    dragStartPos.current = {
                      x: e.touches[0].clientX,
                      y: e.touches[0].clientY,
                    };
                  }}
                  onTouchEnd={(e) => {
                    const touch = e.changedTouches[0];
                    const deltaX = Math.abs(touch.clientX - dragStartPos.current.x);
                    const deltaY = Math.abs(touch.clientY - dragStartPos.current.y);
                    if (deltaX < 10 && deltaY < 10) {
                      openModal(tip.video_url);
                    }
                  }}
                >
                  <Image
                    src={
                      tip.thumbnail_url ||
                      "https://via.placeholder.com/300x400?text=No+Image"
                    } // ✅ safe fallback
                    fallback={<Shimmer width={300} height={400} />}
                    alt={tip.title || "Podcast"}
                    NativeImgProps={{
                      className: "w-[300px] h-[auto] object-contain",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative bg-black rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl z-50 font-bold bg-black/50"
              onClick={closeModal}
            >
              &times;
            </button>

            <div className="relative aspect-[9/16]">
              <CustomVideoPlayer
                ref={modalVideoRef}
                src={selectedVideo}
                className="w-full h-full rounded-lg object-cover"
                autoPlay
                playsInline
                muted={false}
                pauseOtherVideos={true}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipsSlider;
