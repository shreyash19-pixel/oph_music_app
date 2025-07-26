import React, { useEffect, useRef, useState } from "react";
import axiosApi from "../../../../../conf/axios.js";
import { FaPlay, FaPause } from "react-icons/fa";
import Music2 from "../../../../../../public/assets/images/music2.png";
import Elipse from "../../../../../../public/assets/images/elipse.png";
import { Link } from "react-router-dom";

const StruggleEndsSection = () => {
  const [highlightedStory, setHighlightedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null); // Use useRef instead of state

  useEffect(() => {
    const fetchHighlightedStory = async () => {
      try {
        const response = await axiosApi.get("/website-configs/highlighted-story");
        setHighlightedStory(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlightedStory();
  }, []);

  const formatListeners = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M Listeners`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K Listeners`;
    }
    return `${views} Listeners`;
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  if (loading) return <div className="bg-black text-white py-16 px-4">Loading...</div>;

  return (
    highlightedStory && (
      <div className="bg-black relative text-white">
        <img src={Music2} className="absolute z-20 right-0 w-[300px]" alt="" />
        <img src={Elipse} className="absolute z-10 right-0 -top-[300px] w-[400px]" alt="" />
        <div className="container pt-16 px-4 md:px-16 lg:px-16">
          <div className="mb-3">
            <h2 className="text-3xl lg:text-5xl font-bold mb-2">
              YOUR <span className="text-[#5DC9DE]">STRUGGLE ENDS HERE!</span>
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Just trust yourself and this Artist-first music platform, focus on your music creativity, and leave the rest to us.
            </p>
          </div>

          {/* Artist Profile Card */}
          <div className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-0">
              {/* Left Video Section */}
              <div className="relative group">
                <video
                  ref={videoRef}
                  src={highlightedStory.video_file_url}
                  className="w-full h-[300px] sm:h-[400px] rounded-xl object-cover aspect-[4/3] pointer-events-none"
                  poster={highlightedStory.photos?.[0] || "/assets/images/struggleSectionThumbnail.png"}
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-50 pointer-events-auto">
                  <button
                    type="button"
                    className="rounded-full p-4 transition-colors bg-transparent"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <FaPause className="text-white text-2xl" />
                    ) : (
                      <img
                        src="/assets/images/playButton.png"
                        alt="Play"
                        className="w-32 h-32 opacity-80 hover:opacity-100 transition-opacity"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Right Content Section */}
              <div className="space-y-4">
                <Link to={`/artists/${highlightedStory.id}`}>
                  <h1 className="text-3xl text-white font-semibold hover:underline">
                    {highlightedStory.name}
                  </h1>
                </Link>
                <h3 className="text-3xl font-bold">{highlightedStory.artist_name}</h3>
                <div className="space-y-1">
                  <p className="text-gray-400">
                    Stage Name: <span className="text-[#5DC9DE]">{highlightedStory.stage_name}</span>
                  </p>
                  <p className="font-bold" style={{ color: "#6F4FA0" }}>
                    {highlightedStory.total_songs} Songs — {formatListeners(highlightedStory.total_reach)}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-gray-400">
                    {highlightedStory.highlighted_desc || "No description available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default StruggleEndsSection;
