import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "./TopPicksSection.css";
import { FaPlay, FaPause } from "react-icons/fa";
import { Image, Shimmer } from "react-shimmer";
import { useNavigate } from "react-router-dom";
import arrowLeftIc from "/assets/images/arrowLeftIc.svg";
import arrowRightIc from "/assets/images/arrowRightIc.svg";
import axiosApi from "../../../../conf/axios";
import { navigateToArtistDetail } from "../../../../utils/artistHash";

const MusicPlayerProfile2 = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const audioRef = useRef(null); // Ref for audio
  const lastLoadedSongIdRef = useRef(null);
  /** True while user drags seek — blocks timeupdate → setState and avoids slick re-mount jitter */
  const isSeekingRef = useRef(false);
  const progressRafRef = useRef(null);
  const [artistData, setArtistData] = useState({});
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error | empty
  /** Track whose seek UI is shown (set on first `playing` for that load). */
  const [activeSeekSongId, setActiveSeekSongId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({ current: 0, duration: 0 });

  useEffect(() => {

    async function fetchArtist()
    {
      try{
        const response = await axiosApi.get("/kpi_score")

        if(response.data.success && response.data.data != null)
        {
          setArtistData(response.data.data);
          const hasAny = Object.keys(response.data.data || {}).length > 0;
          setLoadState(hasAny ? "ready" : "empty");
        } else {
          setLoadState("empty");
        }
      }
      catch(err)
      {
        console.error(err.message);
        setLoadState("error");
      }
    }

    fetchArtist()

  },[])

  
  const songsArray = Object.values(artistData)
    .filter((a) => a && Array.isArray(a.songs) && a.songs.length > 0)
    .sort((a, b) => (Number(b.kpiScore) || 0) - (Number(a.kpiScore) || 0));

  const [playingSongId, setPlayingSongId] = useState(null);

  const attachAudioProgressListeners = (el, songId) => {
    const flushProgress = () => {
      progressRafRef.current = null;
      if (isSeekingRef.current) return;
      const duration = el.duration;
      setAudioProgress({
        current: el.currentTime,
        duration:
          Number.isFinite(duration) && duration > 0 ? duration : 0,
      });
    };
    const sync = () => {
      if (isSeekingRef.current) return;
      if (progressRafRef.current != null) return;
      progressRafRef.current = requestAnimationFrame(flushProgress);
    };
    el.addEventListener("loadedmetadata", flushProgress);
    el.addEventListener("timeupdate", sync);
    el.addEventListener("durationchange", flushProgress);
    el.addEventListener("playing", () => {
      setActiveSeekSongId(songId);
    });
  };

  const handlePlayPause = (song) => {
    const current = audioRef.current;

    if (current && lastLoadedSongIdRef.current === song.songId) {
      if (!current.paused) {
        current.pause();
        setPlayingSongId(null);
      } else {
        void current.play();
        setPlayingSongId(song.songId);
      }
      return;
    }

    if (current) {
      current.pause();
    }

    setActiveSeekSongId(null);
    setAudioProgress({ current: 0, duration: 0 });

    const newAudio = new Audio(song.audioUrl);
    audioRef.current = newAudio;
    lastLoadedSongIdRef.current = song.songId;
    attachAudioProgressListeners(newAudio, song.songId);

    newAudio.play();
    setPlayingSongId(song.songId);

    newAudio.onended = () => {
      setPlayingSongId(null);
      setActiveSeekSongId(null);
      lastLoadedSongIdRef.current = null;
      setAudioProgress({ current: 0, duration: 0 });
    };
  };

  const handleSeek = (songId, value) => {
    const el = audioRef.current;
    if (!el || lastLoadedSongIdRef.current !== songId) return;
    const t = Number(value);
    if (!Number.isFinite(t)) return;
    el.currentTime = t;
    setAudioProgress((p) => ({
      ...p,
      current: t,
      duration:
        Number.isFinite(el.duration) && el.duration > 0 ? el.duration : p.duration,
    }));
  };

  /** Prevent react-slick from treating seek/play drags as carousel swipe (bubbles to .slick-list). */
  const stopSlickSwipe = (e) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const endSeek = () => {
      isSeekingRef.current = false;
    };
    window.addEventListener("pointerup", endSeek);
    window.addEventListener("pointercancel", endSeek);
    window.addEventListener("touchend", endSeek, true);
    return () => {
      window.removeEventListener("pointerup", endSeek);
      window.removeEventListener("pointercancel", endSeek);
      window.removeEventListener("touchend", endSeek, true);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
      setActiveSeekSongId(null);
      lastLoadedSongIdRef.current = null;
    };
  }, []);

  // Listen for pauseAllAudio event to pause audio when video plays
  useEffect(() => {
    const handlePauseAllAudio = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setPlayingSongId(null);
        setActiveSeekSongId(null);
      }
    };

    window.addEventListener('pauseAllAudio', handlePauseAllAudio);
    return () => {
      window.removeEventListener('pauseAllAudio', handlePauseAllAudio);
    };
  }, []);

  const canLoop = songsArray.length > 3;
  const desktopSlides = Math.min(3, Math.max(1, songsArray.length));
  const tabletSlides = Math.min(2, Math.max(1, songsArray.length));

  const settings = {
    dots: true,
    infinite: canLoop,
    speed: 500,
    slidesToShow: desktopSlides,
    slidesToScroll: 1,
    arrows: false,
    adaptiveHeight: false,
    autoplay: !playingSongId, // Pause autoplay when audio playing
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: tabletSlides,
          infinite: songsArray.length > tabletSlides,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          infinite: songsArray.length > 1,
          centerMode: false,
        },
      },
    ],
  };

  const rankToColor = (rank) => {
    const val = {
      1: "bg-emerald-400",
      2: "bg-amber-400",
      3: "bg-sky-400",
      4: "bg-rose-400",
      5: "bg-fuchsia-400",
    };
    return val[(rank % 5) + 1];
  };

  const openPublicArtistProfile = (artist) => {
    const oid = artist?.oph_id ?? artist?.OPH_ID;
    if (!oid) return;
    navigateToArtistDetail(navigate, oid);
  };

  if (loadState === "loading") {
    return (
      <div className="bg-black text-white min-h-screen py-14">
        <div className="container mx-auto">
          <p className="text-center text-gray-400">Loading Top Picks...</p>
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="bg-black text-white min-h-screen py-14">
        <div className="container mx-auto">
          <p className="text-center text-gray-400">
            Could not load Top Picks. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (loadState === "empty" || songsArray.length === 0) {
    return (
      <div className="bg-black text-white min-h-screen py-14">
        <div className="container mx-auto">
          <p className="text-center text-gray-400">
            No spotlight tracks yet. Approved songs with audio will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="toppicks-section xl:px-16 pt-20 pb-14 bg-black z-20 relative text-white lg:px-10 px-6">
      <div className="mx-auto">
        <div className="flex justify-between">
          <div>
            <h2 className="text-4xl font-bold text-left mb-2">
              <span className="text-[#5DC9DE]">LEADING ARTISTS </span>OF THE
              SPOTLIGHT
            </h2>
            <p className="text-gray-400 text-left mb-12">
              The artists are grabing every opportunity and rising as the stars
              of tomorrow. The best platform for independent artists. What are
              you waiting for? Create your profile and take a chance to
              collaborate with our community artists.
            </p>
          </div>
          <div className="sm:pe-4 ms-5 sm:ms-0 py-4 lg:py-0">
            <button
              onClick={() => sliderRef.current?.slickPrev()}
              className="z-10 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors mr-2"
            >
              <img
                src={arrowLeftIc}
                alt="Previous"
                className="w-[20px] h-[20px]"
              />
            </button>
            <button
              onClick={() => sliderRef.current?.slickNext()}
              className="z-10 bg-[#6F4FA0] mt-3 lg:mt-0 p-2 rounded-full hover:bg-[#6F4FA0] transition-colors"
            >
              <img
                src={arrowRightIc}
                alt="Next"
                className="w-[20px] h-[20px]"
              />
            </button>
          </div>
        </div>

        <Slider ref={sliderRef} {...settings} className="gap-6">
          {songsArray.map((artist, index) => {
            const fullName = String(artist.fullName || "").trim();
            const stageName = String(artist.stageName || "").trim();
            const displayName = fullName || stageName || "Artist";
            const showStageLine =
              Boolean(fullName && stageName) && fullName !== stageName;

            return (
            <div
              key={artist.oph_id || index}
              className="lg:px-4 px-5 py-5 max-w-full sm:max-w-[95%]"
            >
              <div className="relative overflow-visible rounded-xl">
                <div
                  className={`absolute left-[-10px] top-[-10px] z-10 ${rankToColor(
                    index + 1
                  )} w-16 h-16 flex items-center justify-center rounded-lg -rotate-12`}
                >
                  <span className="text-black text-4xl font-bold">
                    {index + 1}
                  </span>
                </div>

                <div className="relative h-64 overflow-hidden rounded-t-xl">
                  <Image
                    src={artist.personalPhoto}
                    fallback={<Shimmer width={960} height={256} />}
                    alt={displayName}
                    NativeImgProps={{
                      className: "w-full h-full object-cover pointer-events-none select-none",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                  {/* Full-area hit target: increments traffic via navigateToArtistDetail, then opens public profile */}
                  <button
                    type="button"
                    className="absolute inset-0 z-[1] cursor-pointer bg-transparent border-0 p-0 text-left"
                    onClick={() => openPublicArtistProfile(artist)}
                    aria-label={`View profile of ${displayName}`}
                  />
                  <div className="absolute bottom-0 left-0 p-6 text-white z-[2] pointer-events-none">
                    <h3 className="text-2xl drop-shadow-[0_0_20px_white] font-bold mb-1">
                      {displayName}
                    </h3>
                    {showStageLine && (
                      <p className="text-sm text-gray-500">
                        Stage name:{" "}
                        <span className="text-[#5DC9DE]">{stageName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="xl:p-6">
                  {artist.songs.slice(0, 5).map((song, songIndex) => (
                    <div
                      key={song.songId}
                      className="flex items-start z-40 justify-between py-3 border-b border-gray-800 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">
                            {songIndex < 10 ? "0" + (songIndex + 1) : songIndex}
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
                      <div
                        className="flex flex-col items-center gap-1.5 ml-4 flex-shrink-0 min-w-[104px]"
                        onPointerDown={stopSlickSwipe}
                        onMouseDown={stopSlickSwipe}
                        onTouchStart={stopSlickSwipe}
                        onTouchMove={stopSlickSwipe}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlayPause(song);
                          }}
                          className="min-w-[35px] w-[35px] min-h-[35px] h-[35px] flex-shrink-0 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-300 transition-colors"
                        >
                          {playingSongId === song.songId &&
                          !audioRef.current?.paused ? (
                            <FaPause className="text-black" size={11} />
                          ) : (
                            <FaPlay className="text-black ml-[0.5px]" size={11} />
                          )}
                        </button>
                        {/* Fixed-height rail so showing the seek control does not change slide height / slick position */}
                        <div className="h-8 w-full flex items-center shrink-0 touch-none">
                          {activeSeekSongId === song.songId &&
                            audioProgress.duration > 0 && (
                              <input
                                type="range"
                                min={0}
                                max={audioProgress.duration}
                                step={0.01}
                                value={Math.min(
                                  audioProgress.current,
                                  audioProgress.duration,
                                )}
                                onChange={(e) =>
                                  handleSeek(song.songId, e.target.value)
                                }
                                onPointerDown={(e) => {
                                  stopSlickSwipe(e);
                                  isSeekingRef.current = true;
                                }}
                                onMouseDown={(e) => {
                                  stopSlickSwipe(e);
                                  isSeekingRef.current = true;
                                }}
                                onTouchStart={(e) => {
                                  stopSlickSwipe(e);
                                  isSeekingRef.current = true;
                                }}
                                aria-label={`Seek ${song.songName || "track"}`}
                                className="w-full h-2 cursor-pointer accent-[#5DC9DE]"
                              />
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
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

export default MusicPlayerProfile2;
