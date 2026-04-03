import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../../conf/axios";
import { FaPause, FaPlay } from "react-icons/fa";
import Elipse from "../../../../../../public/assets/images/elipse.png";
import { SongDuration } from "../../../../ArtistSpotlight/ArtistSpotlight";
import { navigateToArtistDetail } from "../../../../../utils/artistHash";

const ArtistProfile = ({ id }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artist, setArtist] = useState(null);
  const audioRef = useRef(null);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

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

  const handlePlayPause = (song) => {
    const current = audioRef.current;
    if (current && playingSongId === song.song_id) {
      // Toggle play/pause for the same song
      if (!current.paused) {
        current.pause();
        setPlayingSongId(null);
      } else {
        current.play();
        setPlayingSongId(song.song_id);
      }
    } else {
      // New song selected
      if (current) {
        current.pause();
      }
      const newAudio = new Audio(song.audio_file_url);
      audioRef.current = newAudio;
      newAudio.play();
      setPlayingSongId(song.song_id);

      // Handle when the song ends
      newAudio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };


  useEffect(() => {
    fetchArtistDetail();
  }, [id]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingSongId(null);
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


  const setProfession = (prof) => {    
    const profession = professions.find((p) => {
      if(parseInt(prof) === p.id)
      {
        return p
      }
    })
    return profession ? profession.name : "Unknown"
  }

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
                  <span className="text-white">{setProfession(artist.profession)}</span>
                </p>
                <p className="text-gray-400 mb-4">
                  Location:{" "}
                  <span className="text-white">{artist.location}</span>
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span style={{ color: "#6F4FA0" }}>
                    {artist.total_content} songs
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
                {artist &&
                  artist.songs.map((song, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="py-4">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
                          <span className="font-medium">
                            {index + 1 < 10 ? "0" + (index + 1) : index + 1}
                          </span>
                          {/* Mobile-only song name */}
                          <span className="text-sm text-gray-400 sm:hidden truncate w-[120px]">
                            {truncateText(song.name, 20)}
                          </span>
                        </div>
                      </td>

                      {/* Song name - only visible on tablet and above */}
                      <td className="py-4 hidden sm:table-cell">
                        <div className="ms-5">
                          <div className="font-medium truncate overflow-hidden whitespace-nowrap w-[150px]">
                            {truncateText(song.name, 20)}
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

                      <td className="py-4">{song.total_views}</td>
                      <td className="py-4 text-center">
                        <SongDuration url={song.audio_file_url} />
                      </td>

                      <td className="py-4 flex justify-center">
                        <button
                          className="min-w-[30px] w-[30px] min-h-[30px] h-[30px] flex-shrink-0 flex items-center justify-center rounded-full bg-[#6F4FA0] ml-4"
                          onClick={() => handlePlayPause(song)}
                        >
                          {playingSongId === song.song_id && !audioRef?.paused ? (
                            <FaPause className="text-white" size={13} />
                          ) : (
                            <FaPlay className="text-white ml-1" size={13} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
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
