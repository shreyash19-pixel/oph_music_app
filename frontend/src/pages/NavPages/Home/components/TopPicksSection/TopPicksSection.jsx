import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./TopPicksSection.css";
import { useSelector } from "react-redux";
import { FaPlay, FaPause } from "react-icons/fa";
import { Image, Shimmer } from "react-shimmer";
import { useNavigate } from "react-router-dom";

const TopPicksSection = () => {
  const navigate = useNavigate();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000, // 3 seconds per slide
    responsive: [
      {
        breakpoint: 1024, // Below 1024px
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Below 768px
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: false, // Optional for better mobile UI
        },
      },
    ],
  };

  const artistData = useSelector((state) => state.topPick.topPicks);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [audio, setAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);

  const handlePlayPause = (song) => {
    if (audio && playingSongId === song.id) {
      if (!audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      } else {
        audio.play();
        setPlayingSongId(song.id);
      }
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audio_file_url);
      newAudio.play();
      setAudio(newAudio);
      setCurrentAudio(song.audio_file_url);
      setPlayingSongId(song.id);

      newAudio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setPlayingSongId(null);
      }
    };
  }, [audio]);

  function rankToColor(rank) {
    const val = {
      1: "bg-emerald-400",
      2: "bg-amber-400",
      3: "bg-sky-400",
      4: "bg-rose-400",
      5: "bg-fuchsia-400",
    };
    return val[(rank % 5) + 1];
  }

  return (
    <div className="toppicks-section pt-10 bg-black z-20 relative text-white over lg:px-8">
      <div className="mx-auto">
        <div className="mb-1 relative p-4 lg:px-6 xl:px-16">
          <h2 className="text-4xl font-bold text-center mb-2">
            <span className="text-[#5DC9DE]">TOP PERFORMERS </span> OF THE MONTH
          </h2>
          <p className="text-gray-400 text-center mb-1">
          The artists are grabing every opportunity and rising as the stars of tomorrow. What are you waiting for? Waiting for things to happen won’t make your dreams a reality—take the step and join today!
          </p>
        </div>

                                       <Slider {...settings} className="gap-6">
                            {artistData &&
                              [...artistData] // Create a shallow copy of the array to avoid mutating the original
                                .sort((a, b) => a.rank - b.rank) // Sort in ascending order by rank
                                .slice(0, 3) // Take the first 3 artists
                                .map((artist, index) => (
                                  <div
                                    key={index}
                                    className="lg:px-4 px-10 py-5 max-w-full sm:max-w-[95%]"
                                  >
                                    <div className="relative overflow-visible rounded-xl">
                                      <div
                                        className={`absolute left-[-10px] top-[-10px] z-10 ${rankToColor(
                                          artist.rank
                                        )} w-16 h-16 flex items-center justify-center rounded-lg -rotate-12`}
                                      >
                                        <span className="text-black text-4xl font-bold">
                                          {artist.rank}
                                        </span>
                                      </div>
                          
                                      <div
                                        className="relative h-64 hover:cursor-pointer"
                                        onClick={() => navigate(`/artists/${artist.id}`)}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                                        <Image
                                          src={artist.profile_img_url}
                                          fallback={<Shimmer width={300} height={100} />}
                                          alt={artist.name}
                                          NativeImgProps={{
                                            className: "w-full h-full object-cover",
                                          }}
                                        />
                                        <div className="absolute bottom-0 left-0 p-6 text-white">
                                          <h3 className="text-2xl drop-shadow-[0_0_20px_white] font-bold mb-1">
                                            {artist.name}
                                          </h3>
                                          <p className="text-sm text-gray-500">
                                            Stage Name:{" "}
                                            <span className="text-[#5DC9DE]">{artist.stage_name}</span>
                                          </p>
                                        </div>
                                      </div>
                          
                                      <div className="xl:p-6">
                                        {artist.songs.slice(0, 5).map((song, songIndex) => (
                                          <div
                                            key={song.id}
                                            className="flex items-center z-40 justify-between py-3 border-b border-gray-800 last:border-0"
                                          >
                                            <div>
                                              <div className="flex items-center gap-4">
                                                <span className="text-gray-500">
                                                  {songIndex < 10
                                                    ? "0" + (songIndex + 1)
                                                    : songIndex}
                                                </span>
                                                <div>
                                                  <h4 className="font-semibold">{song.name}</h4>
                                                  <p className="text-sm text-gray-400">
                                                    {song.featuring_artists.join(", ")}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <button
                                              className="min-w-[35px] w-[35px] min-h-[35px] h-[35px] flex-shrink-0 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-300 transition-colors ml-4"
                                              onClick={() => handlePlayPause(song)}
                                            >
                                              {playingSongId === song.id && !audio?.paused ? (
                                                <FaPause className="text-black " size={11} />
                                              ) : (
                                                <FaPlay className="text-black ml-[0.5px]" size={11} />
                                              )}
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                          </Slider>
      </div>
    </div>
  );
};

export default TopPicksSection;