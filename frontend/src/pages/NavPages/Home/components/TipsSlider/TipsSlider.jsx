import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { useSelector } from "react-redux";
import { Image, Shimmer } from "react-shimmer";
import "./TipsSlider.css";
import Struggle from "../../../../../../public/assets/images/struggle.png";
import Elipse3 from "../../../../../../public/assets/images/elipse3.png";

const TipsSlider = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef(null);
  const tips = useSelector((state) => state.websiteConfig.success_stories);
  const reelsData = tips;
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: reelsData.length >= 3 ? 3 : reelsData.length,
    slidesToScroll: 1,
    arrows: false,
    autoplay: !isDragging,
    autoplaySpeed: 1000,
    pauseOnHover: true,
    pauseOnFocus: true,
    pauseOnDotsHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: reelsData.length >= 3 ? 3 : reelsData.length } },
      { breakpoint: 768, settings: { slidesToShow: reelsData.length >= 3 ? 2 : reelsData.length } },
      { breakpoint: 480, settings: { slidesToShow: reelsData.length >= 3 ? 1 : reelsData.length } },
    ],
  };

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

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (isModalOpen && videoRef.current) {
      videoRef.current.play();
    }
  }, [isModalOpen]);

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
      <img src={Struggle} className="absolute right-0 w-[300px] -top-[0]" alt="" />
      <img src={Elipse3} className="absolute right-0 w-[300px] -top-[250px]" alt="" />
      
      <div className="mx-auto">
        <div className="container  px-4 lg:px-16 xl:px-16 text-white py-10 w-full">
          <h2 className="text-3xl lg:text-5xl font-bold mb-2">
            ARE YOU <span className="text-[#5DC9DE]">STRUGGLING</span> TOO?
          </h2>
          <p className="text-gray-400 max-w-2xl">
          If you're also facing challenges, working hard, and striving for success in music industry, join this online music community today.
          </p>
        </div>

        {/* Slider */}
        <div className="relative px-4 mb-16">
          <Slider {...settings} className="tips-slider">
            {tips.map((tip) => (
              <div key={tip.id} className="px-2">
                <div
                  className="relative rounded-lg overflow-hidden aspect-[3/4.5] cursor-pointer"
                  onMouseDown={() => setIsDragging(false)}
                  onMouseMove={() => setIsDragging(true)}
                  onMouseUp={() => !isDragging && openModal(tip.video_url)}
                >
                  <Image
                    src={tip.thumbnail_url}
                    fallback={<Shimmer width={300} height={400} />}
                    alt={tip.title}
                    NativeImgProps={{ className: "w-[300px] h-[auto] object-contain" }}
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={closeModal}>
          <div
            className="relative bg-black rounded-lg shadow-lg max-w-3xl w-full px-4 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-0 right-0 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl z-50 font-bold shadow-lg"
              onClick={closeModal}
            >
              &times;
            </button>

            <div className="relative">
              <video
                ref={videoRef}
                src={selectedVideo}
                className="w-full h-auto rounded-lg"
                autoPlay
                playsInline
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
  );
};

export default TipsSlider;
