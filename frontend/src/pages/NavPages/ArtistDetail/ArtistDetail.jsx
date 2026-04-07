import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import axiosApi from "../../../conf/axios";
import { FaPause, FaPlay } from "react-icons/fa";
import Face from "../../../../public/assets/images/facebook.png";
import Twitter from "../../../../public/assets/images/twitter.png";
import Linkedin from "../../../../public/assets/images/linkedin.png";
import Insta from "../../../../public/assets/images/instagram.png";
import Story from "../../../../public/assets/images/story.png";
import { useSelector } from "react-redux";
import { SongDuration } from "../../ArtistSpotlight/ArtistSpotlight";
import CustomVideoPlayer from "../../../components/CustomVideoPlayer/CustomVideoPlayer";
import { resolveProfessionLabel } from "../../../utils/professionDisplay";
import { navigateToArtistDetail } from "../../../utils/artistHash";
import {
  resolveSongAudioUrl,
  songKey,
} from "../../../utils/songAudioUrl";

const ArtistDetail = () => {
  const [artist, setArtist] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [videoElement, setVideoElement] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);
  const lastLoadedSongKeyRef = useRef(null);
  const isSeekingRef = useRef(false);
  const progressRafRef = useRef(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [activeSeekSongId, setActiveSeekSongId] = useState(null);
  const [audioProgress, setAudioProgress] = useState({
    current: 0,
    duration: 0,
  });
  const [searchParams] = useSearchParams();
  const artistParam =
    searchParams.get("artist") || searchParams.get("token");
  const id = searchParams.get("id");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingVid, setIsPlayingVid] = useState(false);
  const videoRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);

  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Assuming `artist` is the current artist whose related artists you want
  // debugger
  // setRelatedArtists(rankedArtists.filter(
  //   (a) => a.id !== artist.id && a.profession_name === artist.profession
  // ))

  // console.log(rankedArtists);

  const fetchIndividualArtist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const param = artistParam
        ? `artist=${encodeURIComponent(artistParam)}`
        : `id=${encodeURIComponent(id)}`;
      const response = await axiosApi.get(`/get-nav-artist-detail?${param}`);
      const data = response.data?.data;
      if (data) {
        setArtist(data);
      } else {
        setError("Artist Not Found");
      }
    } catch (err) {
      console.log(err);
      setError("Artist Not Found");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRankedArtists = async () => {
    const profession = artist?.profession ?? artist?.Profession;
    if (
      profession === undefined ||
      profession === null ||
      String(profession).trim() === ""
    ) {
      setRelatedArtists([]);
      return;
    }
    try {
      const response = await axiosApi.get("/get-nav-releated-artists", {
        params: { q: String(profession).trim() },
      });
      const list = Array.isArray(response.data?.data) ? response.data.data : [];
      const excludeOph = new Set(
        [id, artist?.oph_id, artist?.OPH_ID, artist?.ophid]
          .filter((x) => x != null && String(x).trim() !== "")
          .map((x) => String(x).trim()),
      );
      setRelatedArtists(
        list
          .filter((row) => {
            const oid = row?.oph_id ?? row?.ophid;
            if (oid == null) return false;
            return !excludeOph.has(String(oid).trim());
          })
          .slice(0, 8),
      );
    } catch (error) {
      console.error("Failed to fetch related artists", error);
      setRelatedArtists([]);
    }
  };

  useEffect(() => {
    if (artistParam || id) {
      fetchIndividualArtist();
    } else {
      setIsLoading(false);
      setError("Artist Not Found");
    }
  }, [artistParam, id]);

  useEffect(() => {
    if (!artist || Object.keys(artist).length === 0) return;
    fetchRankedArtists();
  }, [artist, id]);

  const [isOpen, setIsOpen] = useState(false);

  const handleModalOpen = (e) => {
    e.preventDefault(); // prevents navigation
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };

  const handlePlayPauseVideo = () => {
    const video = videoRef.current?.videoElement || videoRef.current;
    if (video) {
      if (video.paused) {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setPlayingSongId(null);
          setActiveSeekSongId(null);
        }
        video.play();
        setShowButton(false);
      } else {
        video.pause();
        setShowButton(true);
      }
      setIsPlaying(!video.paused);
    }
  };

  const attachAudioProgressListeners = (el, songKey) => {
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
      setActiveSeekSongId(songKey);
    });
  };

  const handleSeek = (songKey, value) => {
    const el = audioRef.current;
    if (!el || lastLoadedSongKeyRef.current !== songKey) return;
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

  const handlePlayPause = (song) => {
    const key = songKey(song);
    const src = resolveSongAudioUrl(song);
    if (!key || !src) return;

    const current = audioRef.current;

    if (current && lastLoadedSongKeyRef.current === key) {
      if (!current.paused) {
        current.pause();
        setPlayingSongId(null);
      } else {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setShowButton(true);
        }
        void current.play();
        setPlayingSongId(key);
      }
      return;
    }

    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setShowButton(true);
    }
    if (current) {
      current.pause();
    }

    setActiveSeekSongId(null);
    setAudioProgress({ current: 0, duration: 0 });

    const newAudio = new Audio(src);
    audioRef.current = newAudio;
    lastLoadedSongKeyRef.current = key;
    attachAudioProgressListeners(newAudio, key);

    newAudio.onended = () => {
      setPlayingSongId(null);
      setActiveSeekSongId(null);
      lastLoadedSongKeyRef.current = null;
      setAudioProgress({ current: 0, duration: 0 });
    };

    void newAudio.play().catch(() => {
      setPlayingSongId(null);
      setActiveSeekSongId(null);
      lastLoadedSongKeyRef.current = null;
    });
    setPlayingSongId(key);
  };

  useEffect(() => {
    const endSeek = () => {
      isSeekingRef.current = false;
    };
    window.addEventListener("pointerup", endSeek);
    window.addEventListener("pointercancel", endSeek);
    return () => {
      window.removeEventListener("pointerup", endSeek);
      window.removeEventListener("pointercancel", endSeek);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
      setActiveSeekSongId(null);
      lastLoadedSongKeyRef.current = null;
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

    window.addEventListener("pauseAllAudio", handlePauseAllAudio);
    return () => {
      window.removeEventListener("pauseAllAudio", handlePauseAllAudio);
    };
  }, []);

  const formatListeners = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M+ Listeners`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K+ Listeners`;
    }
    return `${views} Listeners`;
  };

  // const handleSongDownload = (song, name) => {
  //   const link = document.createElement("a");
  //   console.log(name);
  //   link.href = song.audio_file_url;
  //   link.setAttribute("download", name || "song.mp3");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  const [professions, setProfessions] = useState([]);

  // Fetch professions from API
  const fetchProfessions = async () => {
    try {
      const response = await axiosApi.get("/get_professions");
      if (response.data && response.data.success) {
        setProfessions(response.data.data || []);
      } else {
        console.error("Failed to fetch professions:", response.data?.message);
      }
    } catch (error) {
      console.error("Error fetching professions:", error);
    }
  };

  useEffect(() => {
    fetchProfessions();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="text-center h-[90vh] w-full  py-32">
          <div className="animate-spin rounded-full w-12 h-12  border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">
            🎶 "Tuning the strings... your music is on its way!" 🎵
          </p>
        </div>
      )}
      {error && (
        <div className="text-center flex flex-col justify-center items-center h-[80vh] w-full ">
          <h1 className="text-3xl">ERROR 404 PAGE NOTs FOUND</h1>
          <Link to={"/"}>
            <button className="px-5 py-2 bg-[#5DC9DE] text-black mt-4 rounded-full">
              Go Back
            </button>
          </Link>
        </div>
      )}
      {!isLoading && !error && artist && (artist.name || artist.stage_name) && (
        <div className="relative  text-white    min-h-screen">
          {/* Background with gradient */}
          <div
            className="absolute inset-0  bg-black"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 1) 100%), url(${artist.photos[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              height: "90vh",
            }}
          />
          {/* <div className="absolute inset-0 bg-black bg-opacity-50" /> */}
          {/* Solid black overlay for bottom half */}

          {/* Content */}
          <div className="relative z-50 container px-6 xl:px-16 lg:px-10 mx-auto pt-[120px] sm:pt-[200px]">
            {/* Name Header */}
            <h1 className="text-5xl md:text-7xl text-white font-bold mb-4 ">
              {artist.name}
            </h1>
            <p className="my-4">
              Stage Name:
              <span className="text-[#5DC9DE]"> {artist.stage_name}</span>
            </p>

            {/* Profile Section */}
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="w-full sm:col-span-1 col-span-3 h-full relative">
                <CustomVideoPlayer
                  ref={videoRef}
                  src={artist.video_bio}
                  poster={
                    artist.personal_photo ||
                    "/assets/images/struggleSectionThumbnail.png"
                  }
                  className="w-full rounded-xl overflow-hidden aspect-[4/3]"
                  showPlayButtonOverlay={showButton}
                  pauseOtherVideos={true}
                  onPlay={() => {
                    setShowButton(false);
                    if (audioRef.current && !audioRef.current.paused) {
                      audioRef.current.pause();
                      setPlayingSongId(null);
                      setActiveSeekSongId(null);
                    }
                  }}
                  onPause={() => setShowButton(true)}
                />
              </div>

              <div className="flex flex-col col-span-3 sm:col-span-2">
                <p className="text-gray-400 mb-2">
                  Profession:{" "}
                  <span className="font-bold text-white">
                    {resolveProfessionLabel(
                      artist.profession ?? artist.Profession,
                      professions,
                    )}
                  </span>
                </p>
                <p className="text-gray-400 mb-2">
                  Location:{" "}
                  <span className="font-bold text-white">
                    {artist.location}
                  </span>
                </p>
                <p className="text-primary mb-2 font-bold">
                  {artist.total_content}{" "}
                  {artist.total_content > 1 ? "Songs" : "Song"} —{" "}
                  {formatListeners(artist.total_views)}
                </p>
                <p className="text-gray-400 mb-6">{artist.bio}</p>

                <div className="flex justify-center sm:justify-normal gap-4">
                  <a
                    href={artist.facebook_url}
                    className="text-white hover:text-white"
                  >
                    <img
                      src={Face}
                      alt="Social"
                      className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                    />
                  </a>
                  <a
                    href={artist.instagram_url}
                    className="text-white w-10 h-10 object-cover hover:text-white"
                  >
                    <img
                      src={Insta}
                      alt="Social"
                      className="opacity-70 hover:opacity-100"
                    />
                  </a>
                  <a
                    href={artist.linkedin_url || ""}
                    className="text-white w-10 h-10 object-cover hover:text-white"
                  >
                    <img
                      src={Linkedin}
                      alt="Social"
                      className="opacity-70 hover:opacity-100"
                    />
                  </a>
                  <a
                    href={artist.twitter_url || ""}
                    className="text-white hover:text-white"
                  >
                    <img
                      src={Twitter}
                      alt="Social"
                      className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                    />
                  </a>

                  <div>
                    {artist?.video_bio ? (
                      <>
                        {/* Image trigger */}
                        <a
                          href={artist.video_bio}
                          className="text-white hover:text-white"
                          onClick={handleModalOpen}
                        >
                          <img
                            src={Story}
                            alt="Social"
                            className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                          />
                        </a>

                        {/* Modal */}
                        {isOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                            <div className="relative w-[90%] max-w-2xl bg-white rounded-2xl shadow-xl p-4">
                              {/* Close button */}
                              <button
                                onClick={handleModalClose}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                              >
                                &times;
                              </button>

                              {/* Video */}
                              <div className="aspect-w-16 aspect-h-9">
                                <CustomVideoPlayer
                                  src={artist.video_bio}
                                  className="w-full h-full rounded-lg"
                                  autoPlay
                                  pauseOtherVideos={true}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <button className=" opacity-50 ">
                        <img
                          src={Story}
                          alt="Social"
                          className="opacity-70 w-10 h-10 object-cover hover:opacity-50"
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Songs Table */}
            <table className="w-full mb-12 text-xs sm:text-sm lg:text-base table-auto">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="pb-3 px-1 text-center">#</th>
                  <th className="pb-3 px-1 text-center">SONG'S NAMEE</th>
                  <th className="pb-3 px-1 text-center">PLAYS</th>
                  <th className="pb-3 px-1 text-center">TIME</th>
                  <th className="pb-3 px-1 text-center">PLAY</th>
                  {/* <th className="pb-3 px-1 text-center">DOWNLOAD</th> */}
                </tr>
              </thead>

              <tbody>
                {artist?.songs.map((song, index) => (
                  <tr
                    key={song.song_id ?? index}
                    className="border-b border-gray-800 hover:bg-gray-800/50 text-white"
                  >
                    {/* # */}
                    <td className="py-3 px-1 text-center">
                      <div className="flex justify-center items-center h-full w-full">
                        {index + 1}
                      </div>
                    </td>

                    {/* Song name + artist */}
                    <td className="py-3 px-1 text-center">
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <span className="font-medium break-words">
                          {song.song_name}
                        </span>
                        <span className="text-gray-400 text-[11px] sm:text-xs">
                          {song.primaryArtist || song.primary_artist}
                        </span>
                        <span className="text-gray-400 text-[11px] sm:text-xs">
                          {song.secondary_artist || song.primary_artist}
                        </span>
                      </div>
                    </td>

                    {/* Plays */}
                    <td className="py-3 px-1 text-center">
                      <div className="flex justify-center items-center h-full w-full">
                        {song.total_song_views}
                      </div>
                    </td>

                    {/* Time */}
                    <td className="py-3 px-1 text-center">
                      <div className="flex justify-center items-center h-full w-full">
                        <SongDuration
                          url={resolveSongAudioUrl(song)}
                          className="tabular-nums"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-1 text-center align-middle">
                      <div className="flex flex-col items-stretch gap-1.5 min-w-[120px] sm:min-w-[160px] max-w-[240px] mx-auto">
                        <button
                          type="button"
                          disabled={!resolveSongAudioUrl(song)}
                          className="min-w-[30px] w-[30px] h-[30px] mx-auto flex items-center justify-center rounded-full bg-[#6F4FA0] disabled:opacity-40 disabled:cursor-not-allowed"
                          onClick={() => handlePlayPause(song)}
                          aria-label={
                            playingSongId === songKey(song) &&
                            !audioRef.current?.paused
                              ? "Pause"
                              : "Play"
                          }
                        >
                          {playingSongId === songKey(song) &&
                          !audioRef.current?.paused ? (
                            <FaPause className="text-white" size={13} />
                          ) : (
                            <FaPlay className="text-white ml-1" size={13} />
                          )}
                        </button>
                        <div className="h-7 w-full flex items-center touch-none px-0.5">
                          {activeSeekSongId === songKey(song) &&
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
                                  handleSeek(songKey(song), e.target.value)
                                }
                                onPointerDown={() => {
                                  isSeekingRef.current = true;
                                }}
                                onMouseDown={() => {
                                  isSeekingRef.current = true;
                                }}
                                onTouchStart={() => {
                                  isSeekingRef.current = true;
                                }}
                                aria-label={`Seek ${song.song_name || "track"}`}
                                className="w-full h-2 cursor-pointer accent-[#5DC9DE]"
                              />
                            )}
                        </div>
                      </div>
                    </td>

                    {/* Song download column (disabled)
                    <td className="py-3 px-1 text-center">
                      <div className="flex justify-center items-center h-full w-full">
                        <button
                          className="min-w-[30px] w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#5DC9DE]"
                          onClick={() => handleSongDownload(song, song.name)}
                        >
                          <IoIosArrowRoundDown className="text-black" />
                        </button>
                      </div>
                    </td>
                    */}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {artist &&
                artist.photos.slice(1).map((src, index) => (
                  <div key={index + 1} className="aspect-square">
                    <img
                      src={src}
                      alt={`Gallery image ${index + 2}`}
                      className="w-full h-full object-cover cursor-pointer rounded-lg"
                      onClick={() => handleImageClick(src)}
                    />
                  </div>
                ))}
            </div>

            {selectedImage && (
              <div className="fixed inset-0 bg-black pb-6  bg-opacity-70 flex items-center justify-center z-50">
                <div className="relative   p-4 rounded-lg max-w-[90%] max-h-[90%]">
                  <button
                    className="absolute top-2 right-2 text-white text-2xl bg-black rounded-full w-8 h-8 flex items-center justify-center"
                    onClick={handleCloseModal}
                  >
                    ✕
                  </button>
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="max-w-full max-h-[80vh] rounded-md"
                  />
                </div>
              </div>
            )}
            <RelatedArtists rankedArtists={relatedArtists} />
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistDetail;

const RelatedArtists = ({ rankedArtists }) => {
  const navigate = useNavigate();
  const formatListeners = (views) => {
    const v = views == null || Number.isNaN(Number(views)) ? 0 : Number(views);
    if (v >= 1000000) {
      return `${(v / 1000000).toFixed(1)}M+ Listeners`;
    } else if (v >= 1000) {
      return `${(v / 1000).toFixed(1)}K+ Listeners`;
    }
    return `${v} Listeners`;
  };
  return (
    <div className="w-full pb-20 pt-28">
      <h2 className="text-white mb-8 text-4xl font-bold">
        RELATED <span className="text-[#5DC9DE]">ARTISTS:</span>
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {rankedArtists &&
          rankedArtists.map((artist, index) => {
            const oid = artist?.oph_id ?? artist?.ophid;
            return (
              <div
                key={oid ?? index}
                role="button"
                tabIndex={0}
                className="flex flex-col items-center cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  if (oid) void navigateToArtistDetail(navigate, String(oid).trim());
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (oid) void navigateToArtistDetail(navigate, String(oid).trim());
                  }
                }}
              >
                <div className="flex justify-center mb-2">
                  <img
                    src={artist.personal_photo}
                    alt={artist.stage_name}
                    style={{ borderRadius: "50%" }}
                    className="sm:w-[100px] w-[100px] h-[100px] sm:h-[100px] object-cover"
                  />
                </div>
                <p className="text-white text-center text-md font-medium">
                  {artist.stage_name}
                </p>
                <p className="text-gray-400 text-sm">
                  {formatListeners(artist.total_views)}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
};
