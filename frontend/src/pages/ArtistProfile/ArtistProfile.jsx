import { Play, Pause, Edit3, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import axiosApi from "../../conf/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import { updateProfileImage } from "../auth/API/profile";
import { useArtist } from "../auth/API/ArtistContext";
import Face from "../../../public/assets/images/facebook.png";
import Twitter from "../../../public/assets/images/twitter.png";
import Linkedin from "../../../public/assets/images/linkedin.png";
import Insta from "../../../public/assets/images/instagram.png";
import Spotify from "../../../public/assets/images/spotify.png";
import AppleMusic from "../../../public/assets/images/apple_music.png";

Modal.setAppElement('#root');

export default function ArtistProfile() {
  const [artist, setArtist] = useState({});
  const { ophid, headers } = useArtist();
  const userData = localStorage.getItem("userData");
  const parsedData = userData ? JSON.parse(userData) : null;
  const id = parsedData?.artist?.id || ophid;
  const [audio, setAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handlePlayPause = (song) => {
    if (audio && playingSongId === song.song_id) {
      if (!audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      } else {
        audio.play();
        setPlayingSongId(song.song_id);
      }
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.duration_in_minutes);
      newAudio.play();
      setAudio(newAudio);
      setPlayingSongId(song.song_id);
      newAudio.onended = () => setPlayingSongId(null);
    }
  };

  const fetchProfile = async () => {
    if (!id) return;
    try {
      const response = await axiosApi.get(`/get-artist-detail?id=${encodeURIComponent(id)}`, {
        ...(headers?.Authorization ? { headers } : {}),
      });
      const data = response.data?.data;
      console.log("Artist Profile Data:", data);
      if (data) {
        setArtist(data);
        
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!newPassword || newPassword.trim() === "") {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    const token = parsedData?.token || headers?.Authorization?.replace('Bearer ', '');
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }
    setIsLoading(true);
    try {
      await axiosApi.post(
        "/auth/change-password",
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error changing password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("profile_image", file);
      await updateProfileImage(formData, headers);
      await fetchProfile();
    }
  };

  return (
    artist && (
      <div className="min-h-[calc(100vh-70px)] text-gray-100 px-4 sm:px-8 py-6 overflow-x-hidden">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start gap-6 flex-wrap">
            <div className="relative">
              <img
                src={artist.personal_photo}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-cyan-600 cursor-pointer"
                onClick={openModal}
              />
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                {artist.name}
              </h1>
              <p className="text-gray-400">
                Stage Name:{" "}
                <span className="text-cyan-400">{artist.stage_name}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-gray-400">
              OPH Artist Code:{" "}
              <span className="text-white">#{artist.oph_id}</span>
            </p>
            <p className="text-gray-400">
              Profession:{" "}
              <span className="text-white">
                {artist.profession ?? artist.Profession}
              </span>
            </p>
          </div>

          {/* Bio */}
          <p className="text-gray-400 leading-relaxed">{artist.bio}</p>

          {/* Social Links */}
          <div className="flex flex-wrap gap-4">
            {artist.facebook_url && (
              <a
                href={artist.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Face}
                  alt="Facebook"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
            {artist.instagram_url && (
              <a
                href={artist.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Insta}
                  alt="Instagram"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
            {artist.linkedin_url && (
              <a
                href={artist.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Linkedin}
                  alt="LinkedIn"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
            {artist.twitter_url && (
              <a
                href={artist.twitter_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Twitter}
                  alt="Twitter"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
            {artist.spotify_url && (
              <a
                href={artist.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={Spotify}
                  alt="Spotify"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
            {artist.apple_music_url && (
              <a
                href={artist.apple_music_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={AppleMusic}
                  alt="Apple Music"
                  className="opacity-70 w-10 h-10 object-cover hover:opacity-100"
                />
              </a>
            )}
          </div>

          {/* Songs Table */}
          <div className="overflow-x-auto mt-8">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="text-center text-gray-300 border-b border-gray-800 text-xs">
                  <th className="pb-4 font-normal">#</th>
                  <th className="pb-4 font-normal">SONG NAME</th>
                  <th className="pb-4 font-normal">PLAYS</th>
                  <th className="pb-4 font-normal">TIME</th>
                  <th className="pb-4 font-normal">PLAY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {artist?.songs?.map((song, index) => (
                  <tr key={song.song_id} className="group text-center">
                    <td className="py-4">{index + 1}</td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center">
                        <div className="max-w-[120px] truncate">
                          <div className="font-medium">{song.song_name}</div>
                          <div className="text-sm text-gray-400">
                            {song.primary_artist}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{song.total_song_views}</td>
                    <td className="py-4">{song.duration_in_minutes}</td>
                    <td className="py-4">
                      <button
                        className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
                        onClick={() => handlePlayPause(song)}
                      >
                        {playingSongId === song.song_id && !audio?.paused ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Divider */}
          <hr className="border-gray-700 my-8" />

          {/* Change Password */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Change Password:</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-cyan-400"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-cyan-400"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 py-3 ${
                  isLoading
                    ? "bg-cyan-500 cursor-not-allowed"
                    : "bg-cyan-400 hover:bg-cyan-300"
                } text-gray-900 rounded-lg font-medium transition-colors`}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>

        {/* Toast */}
        <ToastContainer />

        {/* Modal for artist story video */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="fixed inset-0 flex items-center justify-center px-4"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
          <div className="relative bg-black rounded-lg p-0 max-w-3xl w-full">
            <button
              className="absolute top-2 right-2 text-white text-2xl z-10"
              onClick={closeModal}
            >
              &times;
            </button>
            <video
              // src={profile.artist_story}
              controls
              autoPlay
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </Modal>
      </div>
    )
  );
}
