import React, { useEffect, useRef, useState } from "react";
import { Play, ChevronDown, Pause } from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axiosApi from "../../conf/axios";
import { FaPause, FaPlay } from "react-icons/fa";
import Face from "../../../public/assets/images/facebook.png";
import Twitter from "../../../public/assets/images/twitter.png";
import Linkedin from "../../../public/assets/images/linkedin.png";
import Insta from "../../../public/assets/images/instagram.png";
import Story from "../../../public/assets/images/story.png";
import Edit from "../../../public/assets/images/edit.png";
import { useArtist } from "../../pages/auth/API/ArtistContext";
import { useSelector } from "react-redux";
import { IoIosArrowRoundDown } from "react-icons/io";
import { SongDuration } from "../ArtistSpotlight/ArtistSpotlight";
import CustomVideoPlayer from "../../components/CustomVideoPlayer/CustomVideoPlayer";
const MYEPK = () => {
  const [artist, setArtist] = useState({});
  const [currentAudio, setCurrentAudio] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [relatedArtists, setRelatedArtists] = useState([]);

  const [audio, setAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null); // State for currently playing song ID

  const { headers, ophid } = useArtist();

  const handleImageClick = (src) => {
    setSelectedImage(src);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };
  const handleDownload = async () => {
    if (selectedImage) {
      try {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "image.jpg"); // This will open the "Save As" dialog
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Failed to download image:", error);
      }
    }
  };

  const fetchSpecialArtist = async () => {
    setIsLoading(true);
    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers are not ready");
        return;
      }

      const response = await axiosApi.get(
        `/get-special-artist-detail?ophid=${ophid}`,
        {
          headers: headers,
        }
      );
      setArtist(response.data.data);
    } catch (err) {
      console.log(err);
      setError("Artist Not Found");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ophid) {
      fetchSpecialArtist();
    }
  }, [headers, ophid]);

  const [isOpen, setIsOpen] = useState(false);

  const handleModalOpen = (e) => {
    e.preventDefault(); // prevents navigation
    setIsOpen(true);
  };

  const handleModalClose = () => {
    setIsOpen(false);
  };


  const handlePlayPause = (song) => {
    if (playingSongId === song.id) {
      // Toggle play/pause for the same song
      if (!audio?.paused) {
        audio?.pause();
        setPlayingSongId(null);
      } else {
        audio?.play()?.catch((error) => {
          console.error("Audio play failed:", error);
        });
        setPlayingSongId(song.id);
      }
    } else {
      // New song selected
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audio_url);
      newAudio.play().catch((error) => {
        console.error("Audio play failed:", error);
      });
      setAudio(newAudio);
      setPlayingSongId(song.id);
    }
  };

  const formatListeners = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M+ Listeners`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K+ Listeners`;
    }
    return `${views} Listeners`;
  };

  const handleSongDownload = (song, name) => {
    const link = document.createElement("a");
    console.log(name);

    link.href = song.audio_file_url; // Ensure the URL is correct and accessible
    link.setAttribute("download", name || "song.mp3"); // Set a default file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
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
      {!isLoading && !error && artist && artist.name && (
        <div className="relative  text-white    min-h-screen">
          {/* Background with gradient */}
          <div
            className="absolute inset-0  bg-black"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 1) 100%), url(${
                artist.photos[artist.photos.length - 1]
              })`,
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
            <div className="grid grid-cols-3 gap-8 mb-12 relative">
              <div className="w-full sm:col-span-1 col-span-3 h-full relative">
                <div className="relative group rounded-xl overflow-hidden aspect-[4/3]">
                  <CustomVideoPlayer
                    src={artist.video_bio}
                    poster={
                      artist.personal_photo ||
                      "/assets/images/struggleSectionThumbnail.png"
                    }
                    className="w-full h-full rounded-xl"
                    showPlayButtonOverlay={true}
                  />
                </div>
              </div>

              <div className="flex flex-col col-span-3 sm:col-span-2">
                <p className="text-gray-400 mb-2">
                  Profession:{" "}
                  <span className="font-bold text-white">
                    {artist.profession}
                  </span>
                </p>
                <p className="text-gray-400 mb-2">
                  Location:{" "}
                  <span className="font-bold text-white">
                    {artist.location}
                  </span>
                </p>
                {artist.total_content > 0 && (
                  <p className="text-primary mb-2 font-bold">
                    {artist.total_content}{" "}
                    {artist.total_content > 1 ? "Songs" : "Song"}
                    {/* {artist.total_views > 0 && "— " + formatListeners(artist.total_views)} */}
                  </p>
                )}
                <p className="text-gray-400 mb-6">{artist.bio}</p>

                <div className="flex justify-center sm:justify-normal gap-4">
                  <a
                    target="_blank"
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
                    target="_blank"
                    href={artist.instagram_url}
                    className="text-white w-10 h-10 object-cover hover:text-white"
                  >
                    <img
                      src={Insta}
                      alt="Social"
                      className="opacity-70 hover:opacity-100"
                    />
                  </a>
                  {/* <a
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
                  </a> */}

                  <div>
                    {artist?.artist_story_video ? (
                      <>
                        {/* Image trigger */}
                        <a
                          href={artist.artist_story_video}
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
                                <video
                                  controls
                                  autoPlay
                                  className="w-full h-full rounded-lg"
                                >
                                  <source
                                    src={artist.artist_story_video}
                                    type="video/mp4"
                                  />
                                  Your browser does not support the video tag.
                                </video>
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

              <button
                className="absolute right-0 bottom-0 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard/epk-management", {
                    state: {
                      photo: artist.photos[0],
                    },
                  });
                }}
              >
                <img src={Edit} className="w-[55px] h-[55px]" />
              </button>
            </div>

            {/* Songs Table */}
            {artist.songs.length > 0 ? (
              <table
                table
                className="w-full mb-12 text-xs sm:text-sm lg:text-base table-auto"
              >
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="pb-3 px-1 text-center">#</th>
                    <th className="pb-3 px-1 text-center">SONG'S NAME</th>
                    <th className="pb-3 px-1 text-center">PLAYS</th>
                    <th className="pb-3 px-1 text-center">TIME</th>
                    <th className="pb-3 px-1 text-center">PLAY</th>
                    {/* <th className="pb-3 px-1 text-center">DOWNLOAD</th> */}
                  </tr>
                </thead>

                <tbody>
                  {artist?.songs.map(
                    (song, index) =>
                      song.song_status === "approved" && (
                        <tr
                          key={index}
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
                                {song.primary_artist}
                              </span>
                            </div>
                          </td>

                          {/* Plays */}
                          <td className="py-3 px-1 text-center">
                            <div className="flex justify-center items-center h-full w-full">
                              {song.total_song_views > 0
                                ? song.total_song_views
                                : "—"}
                            </div>
                          </td>

                          {/* Time */}
                          <td className="py-3 px-1 text-center">
                            <div className="flex justify-center items-center h-full w-full">
                              <SongDuration url={song.audio_url} />
                            </div>
                          </td>

                          {/* Play button */}
                          <td className="py-3 px-1 text-center">
                            <div className="flex justify-center items-center h-full w-full">
                              <button
                                className="p-2 bg-[#6F4FA0] rounded-full hover:bg-[#6F4FA0] transition-colors"
                                onClick={() => handlePlayPause(song)}
                              >
                                {playingSongId === song.id && !audio?.paused ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Download button */}
                          {/* <td className="py-3 px-1 text-center">
                            <div className="flex justify-center items-center h-full w-full">
                              <button
                                className="min-w-[30px] w-[30px] h-[30px] flex items-center justify-center rounded-full bg-[#5DC9DE]"
                                onClick={() =>
                                  handleSongDownload(song, song.name)
                                }
                              >
                                <IoIosArrowRoundDown className="text-black" />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      )
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-xl text-center mb-20">
                No song uploaded
              </p>
            )}
            {/* Image Gallery */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {artist &&
                artist.photos.map((src, index) => (
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
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="bg-[#5CC8DE] text-black px-4 py-2 rounded-md "
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MYEPK;
