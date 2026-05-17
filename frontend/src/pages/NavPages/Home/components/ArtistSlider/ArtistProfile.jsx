import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios";
import { FaPause, FaPlay } from "react-icons/fa";
import Elipse from "../../../../../../public/assets/images/elipse.png";
import { SongDuration } from "../../../../ArtistSpotlight/ArtistSpotlight";
import { navigateToArtistDetail } from "../../../../../utils/artistHash";
import { resolveProfessionLabel } from "../../../../../utils/professionDisplay";
import { resolveSongAudioUrl, songKey } from "../../../../../utils/songAudioUrl";

const ArtistProfile = ({ id }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artist, setArtist] = useState(null);
  const audioRef = useRef(null);
  const lastLoadedSongKeyRef = useRef(null);
  const progressRafRef = useRef(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [activeSeekSongId, setActiveSeekSongId] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioProgress, setAudioProgress] = useState({ current: 0, duration: 0 });
  const isSeekingRef = useRef(false);

  const fetchArtistDetail = async () => {
    if (id == null || id === "") {
      setLoading(false);
      setArtist(null);
      setError("No artist selected");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axiosApi.get("/get-top-artist-detail", {
        params: { id: String(id) },
      });
      if (response?.data?.success && response?.data?.data) {
        setArtist(response.data.data);
      } else {
        setArtist(null);
        setError(
          response?.data?.message || "Artist details not found",
        );
      }
    } catch (err) {
      setArtist(null);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load artist",
      );
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const formatNumber = (count) => {
    if (!count && count !== 0) return "0";

    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else {
      // Always use K format even for small numbers
      return `${(count / 1000).toFixed(1)}K`;
    }
  };

  const attachAudioProgressListeners = (el, key) => {
    const flushProgress = () => {
      progressRafRef.current = null;
      if (isSeekingRef.current) return;
      const duration = el.duration;
      setAudioProgress({
        current: el.currentTime,
        duration: Number.isFinite(duration) && duration > 0 ? duration : 0,
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
      setActiveSeekSongId(key);
    });
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
        void current.play();
        setPlayingSongId(key);
      }
      return;
    }

    if (current) {
      current.pause();
    }

    setActiveSeekSongId(null);
    setAudioProgress({ current: 0, duration: 0 });

    const newAudio = new Audio(src);
    newAudio.volume = volume;
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

  const handleSeek = (key, value) => {
    const el = audioRef.current;
    if (!el || lastLoadedSongKeyRef.current !== key) return;
    const t = Number(value);
    if (!Number.isFinite(t)) return;
    el.currentTime = t;
    setAudioProgress((p) => ({
      ...p,
      current: t,
      duration:
        Number.isFinite(el.duration) && el.duration > 0
          ? el.duration
          : p.duration,
    }));
  };

  useEffect(() => {
    fetchArtistDetail();
  }, [id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const approvedSongs = useMemo(() => {
    const list = Array.isArray(artist?.songs) ? artist.songs : [];
    return list.filter((s) => {
      const st = s?.overall_status ?? s?.song_application_status;
      if (st == null || String(st).trim() === "") return true;
      return String(st).trim().toLowerCase() === "approved";
    });
  }, [artist?.songs]);

  return (
    <>
      {loading && (
        <div className="text-center h-[90vh] w-full py-32">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">
            🎤 "Warming up the mic... Almost there!"
          </p>
        </div>
      )}
      {!loading && error && (
        <div className="text-center h-[90vh] w-full py-32">
          <p className="mt-2 text-[#5DC9DE]">{error}</p>
        </div>
      )}
      {!loading && artist && (
        <div className="relative w-full bg-cover bg-center">
          <div className="bg-black container xl:px-16 lg:px-10 px-6 mx-auto text-white pt-10">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row gap-8 mb-12">
              {/* Profile Image */}
              <div
                className="w-64 h-64 rounded-lg overflow-hidden border-4 border-cyan-500 cursor-pointer"
                onClick={() => setShowVideoModal(true)}
              >
                <img
                  src={artist.personal_photo}
                  alt={artist.stage_name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
                <p className="text-gray-400 mb-1 font-extrabold">
                  Stage Name:{" "}
                  <span className="text-[#5DC9DE]">{artist.stage_name}</span>
                </p>
                <p className="text-gray-400 mb-1">
                  Profession:{" "}
                  <span className="text-white">
                    {resolveProfessionLabel(artist.profession, professions)}
                  </span>
                </p>
                <p className="text-gray-400 mb-4">
                  Location:{" "}
                  <span className="text-white">{artist.location}</span>
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span style={{ color: "#6F4FA0" }}>
                    {approvedSongs.length} song{approvedSongs.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-gray-600">→</span>
                  <span style={{ color: "#6F4FA0" }}>
                    {" "}
                    {formatNumber(artist.total_views)} Listeners
                  </span>
                </div>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {artist.bio}
                </p>
              </div>
            </div>

            {/* Songs Section */}
            <table className="w-full mb-12">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left pb-4">#</th>
                  <th className="text-left pb-4 relative left-4 hidden sm:table-cell">
                    SONG'S NAME
                  </th>
                  <th className="text-left pb-4">PLAYS</th>
                  <th className="text-center pb-4">TIME</th>
                  <th className="text-center pb-4">PLAY</th>
                </tr>
              </thead>
              <tbody>
                {approvedSongs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-gray-400 text-sm"
                    >
                      No songs added by this artist yet.
                    </td>
                  </tr>
                ) : (
                  approvedSongs.slice(0, 3).map((song, index) => {
                    const sk = songKey(song);
                    const audioSrc = resolveSongAudioUrl(song);
                    const songTitle =
                      song.song_name || song.name || song.title || "";
                    return (
                    <tr
                      key={sk || index}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="py-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                          <span className="font-medium">
                            {index + 1 < 10 ? "0" + (index + 1) : index + 1}
                          </span>
                          {/* Mobile-only song name */}
                          <span className="text-sm text-gray-400 sm:hidden truncate w-[120px]">
                            {truncateText(songTitle, 20)}
                          </span>
                        </div>
                      </td>

                      {/* Song name - only visible on tablet and above */}
                      <td className="py-4 hidden sm:table-cell">
                        <div className="ms-5">
                          <div className="font-medium">
                            {truncateText(songTitle, 20)}
                          </div>
                          {song.featuring_artists &&
                            song.featuring_artists.map((artist, ind) => (
                              <span
                                key={ind}
                                className="text-gray-400 me-2 text-sm"
                              >
                                {artist}
                                {ind !== song.featuring_artists.length - 1 &&
                                  ", "}
                              </span>
                            ))}
                        </div>
                      </td>

                      <td className="py-4">
                        {song.total_views ?? song.youtube_views ?? "—"}
                      </td>
                      <td className="py-4 text-center">
                        <SongDuration url={audioSrc} />
                      </td>

                      <td className="py-4 text-center align-middle">
                        <div className="flex flex-col items-stretch gap-1.5 min-w-[120px] sm:min-w-[160px] max-w-[240px] mx-auto">
                          <button
                            type="button"
                            disabled={!audioSrc}
                            className="min-w-[30px] w-[30px] h-[30px] mx-auto flex items-center justify-center rounded-full bg-[#6F4FA0] disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => handlePlayPause(song)}
                            aria-label={
                              playingSongId === sk && !audioRef.current?.paused
                                ? "Pause"
                                : "Play"
                            }
                          >
                            {playingSongId === sk &&
                            !audioRef.current?.paused ? (
                              <FaPause className="text-white" size={13} />
                            ) : (
                              <FaPlay className="text-white ml-1" size={13} />
                            )}
                          </button>
                          <div className="h-7 w-full flex items-center touch-none px-0.5">
                            {activeSeekSongId === sk &&
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
                                    handleSeek(sk, e.target.value)
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
                                  aria-label={`Seek ${songTitle || "track"}`}
                                  className="w-full h-2 cursor-pointer accent-[#5DC9DE]"
                                />
                              )}
                          </div>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <button
              onClick={(e) => {
                e.preventDefault();
                navigateToArtistDetail(navigate, id);
              }}
              className="underline hover:cursor-pointer text-lg text-[#5DC9DE] block"
            >
              See More...
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ArtistProfile;
