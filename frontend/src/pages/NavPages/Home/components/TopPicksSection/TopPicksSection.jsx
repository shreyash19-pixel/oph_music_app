import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import "./TopPicksSection.css";
import { FaPlay, FaPause } from "react-icons/fa";
import { Image, Shimmer } from "react-shimmer";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios"; // ✅ adjust path if needed
import { navigateToArtistDetail } from "../../../../../utils/artistHash";

const TopPicksSection = () => {
  const navigate = useNavigate();
  const [artistData, setArtistData] = useState([]); // ✅ always an array
  const [audio, setAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);

  // ✅ Fetch KPI data
  useEffect(() => {
    const fetchKPI = async () => {
      try {
        const res = await axiosApi.get("/kpi_score");
        console.log("KPI response:", res.data);

        // ✅ Convert object to array and filter artists with songs
        if (res.data.success && res.data.data != null) {
          const artistsArray = Object.values(res.data.data)
            .filter((a) => a && Array.isArray(a.songs) && a.songs.length > 0)
            .sort((a, b) => (Number(b.kpiScore) || 0) - (Number(a.kpiScore) || 0))
            .slice(0, 3);
          setArtistData(artistsArray);
        } else {
          setArtistData([]);
        }
      } catch (error) {
        console.error("Error fetching KPI:", error);
        setArtistData([]);
      }
    };

    fetchKPI();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1, centerMode: false },
      },
    ],
  };

  // ✅ Audio handler
  const handlePlayPause = (song) => {
    if (audio && playingSongId === song.songId) {
      if (!audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      } else {
        audio.play();
        setPlayingSongId(song.songId);
      }
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audioUrl);
      newAudio.play();
      setAudio(newAudio);
      setPlayingSongId(song.songId);

      newAudio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  // ✅ Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setPlayingSongId(null);
      }
    };
  }, [audio]);

  // Listen for pauseAllAudio event to pause audio when video plays
  useEffect(() => {
    const handlePauseAllAudio = () => {
      if (audio && !audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      }
    };

    window.addEventListener('pauseAllAudio', handlePauseAllAudio);
    return () => {
      window.removeEventListener('pauseAllAudio', handlePauseAllAudio);
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
            The artists are grabing every opportunity and rising as the stars of
            tomorrow. What are you waiting for? Waiting for things to happen
            won’t make your dreams a reality—take the step and join today!
          </p>
        </div>

        {/* ✅ Render only if artistData is an array */}
        <Slider {...settings} className="gap-6">
          {Array.isArray(artistData) &&
            artistData.map((artist, index) => {
                const fullName = String(artist.fullName || "").trim();
                const stageName = String(artist.stageName || "").trim();
                const headline = fullName || stageName || "Artist";
                const showStage =
                  Boolean(fullName && stageName) && fullName.toLowerCase() !== stageName.toLowerCase();

                return (
                <div
                  key={index}
                  className="lg:px-4 px-10 py-5 max-w-full sm:max-w-[95%]"
                >
                  <div className="relative overflow-visible rounded-xl">
                    {/* Rank Badge */}
                    <div
                      className={`absolute left-[-10px] top-[-10px] z-10 ${rankToColor(
                        index + 1
                      )} w-16 h-16 flex items-center justify-center rounded-lg -rotate-12`}
                    >
                      <span className="text-black text-4xl font-bold">
                        {index + 1}
                      </span>
                    </div>

                    {/* Artist Profile */}
                    <div
                      className="relative h-64 hover:cursor-pointer overflow-hidden rounded-t-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Clicked artist:", artist.oph_id);
                        navigateToArtistDetail(navigate, artist.oph_id);
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-0" />
                      <Image
                        src={artist.personalPhoto || "/default-avatar.png"}
                        fallback={<Shimmer width={400} height={300} />}
                        alt={headline}
                        NativeImgProps={{
                          className: "w-full h-full object-cover",
                        }}
                      />
                      <div className="absolute bottom-0 left-0 p-6 text-white z-10">
                        <h3 className="text-2xl drop-shadow-[0_0_20px_white] font-bold mb-1">
                          {headline}
                        </h3>
                        {showStage && (
                          <p className="text-sm text-gray-300">
                            Stage name:{" "}
                            <span className="text-[#5DC9DE]">{stageName}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Songs */}
                    <div className="xl:p-6 p-4 bg-black">
                      {artist.songs && artist.songs.length > 0 ? (
                        artist.songs.slice(0, 5).map((song, songIndex) => (
                          <div
                            key={song.songId}
                            className="flex items-center z-40 justify-between py-3 border-b border-gray-800 last:border-0"
                          >
                            <div>
                              <div className="flex items-center gap-4">
                                <span className="text-gray-500">
                                  {songIndex < 10
                                    ? "0" + (songIndex + 1)
                                    : songIndex + 1}
                                </span>
                                <div>
                                  <h4 className="font-semibold">{song.songName}</h4>
                                  <p className="text-sm text-gray-400">
                                    {song.primaryArtist}
                                    {(song.secondaryArtist || []).length > 0 && (
                                      <span>, {(song.secondaryArtist || []).join(", ")}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              className="min-w-[35px] w-[35px] min-h-[35px] h-[35px] flex-shrink-0 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-300 transition-colors ml-4"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayPause(song);
                              }}
                            >
                              {playingSongId === song.songId && !audio?.paused ? (
                                <FaPause className="text-black " size={11} />
                              ) : (
                                <FaPlay
                                  className="text-black ml-[0.5px]"
                                  size={11}
                                />
                              )}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No songs available</p>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
        </Slider>
      </div>
    </div>
  );
};

export default TopPicksSection;
