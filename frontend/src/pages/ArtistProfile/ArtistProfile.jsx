import { Play, Pause, Edit3, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import axiosApi from "../../conf/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { updateProfileImage } from "../auth/API/profile";
import { useArtist } from "../auth/API/ArtistContext";
import Face from "../../../public/assets/images/facebook.png";
// import Twitter from "../../../public/assets/images/twitter.png";
// import Linkedin from "../../../public/assets/images/linkedin.png";
import Insta from "../../../public/assets/images/instagram.png";
import Spotify from "../../../public/assets/images/spotify.png";
import AppleMusic from "../../../public/assets/images/apple.png";
import { resolveProfessionLabel } from "../../utils/professionDisplay";
import { normalizeExternalHref, socialHref } from "../../utils/socialLinks";
import NavbarRight from "../../components/Navbar/NavbarRight";
import NavbarLeft from "../../components/Navbar/NavbarLeft";

Modal.setAppElement("#root");

function formatTrackLengthSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  /** song_id -> seconds from audio file metadata; -1 = could not read (e.g. CORS) */
  const [trackLengthSec, setTrackLengthSec] = useState({});
  const [professions, setProfessions] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosApi.get("/get_professions");
        if (!cancelled && response.data?.success) {
          setProfessions(response.data.data || []);
        }
      } catch {
        if (!cancelled) setProfessions([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const approvedSongs = useMemo(() => {
    const list = Array.isArray(artist?.songs) ? artist.songs : [];
    return list.filter((s) => {
      const st = s?.overall_status ?? s?.song_application_status;
      if (st == null || String(st).trim() === "") return true;
      return String(st).trim().toLowerCase() === "approved";
    });
  }, [artist?.songs]);

  const songsLoadKey = React.useMemo(
    () =>
      (approvedSongs ?? [])
        .map(
          (s) =>
            `${s.song_id ?? ""}|${String(s.audio_url || s.audio_file_url || "").trim()}`,
        )
        .join(";"),
    [approvedSongs],
  );

  useEffect(() => {
    if (!songsLoadKey) return undefined;

    const entries = [];
    const pendingIds = [];
    for (const song of approvedSongs ?? []) {
      const url = String(song.audio_url || song.audio_file_url || "").trim();
      const sid = song.song_id;
      if (!url || sid == null) continue;
      pendingIds.push(sid);

      const el = new Audio();
      el.preload = "metadata";

      const onMeta = () => {
        const d = el.duration;
        if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
          setTrackLengthSec((prev) =>
            prev[sid] != null && prev[sid] > 0 ? prev : { ...prev, [sid]: d },
          );
        } else {
          setTrackLengthSec((prev) =>
            prev[sid] != null ? prev : { ...prev, [sid]: -1 },
          );
        }
      };

      const onErr = () => {
        setTrackLengthSec((prev) =>
          prev[sid] != null ? prev : { ...prev, [sid]: -1 },
        );
      };

      el.addEventListener("loadedmetadata", onMeta);
      el.addEventListener("error", onErr);
      el.src = url;
      el.load();
      entries.push({ el, onMeta, onErr });
    }

    const t = window.setTimeout(() => {
      setTrackLengthSec((prev) => {
        let next = prev;
        for (const sid of pendingIds) {
          if (next[sid] === undefined) {
            if (next === prev) next = { ...prev };
            next[sid] = -1;
          }
        }
        return next;
      });
    }, 12000);

    return () => {
      window.clearTimeout(t);
      for (const { el, onMeta, onErr } of entries) {
        el.removeEventListener("loadedmetadata", onMeta);
        el.removeEventListener("error", onErr);
        el.pause();
        el.src = "";
        el.load();
      }
    };
  }, [songsLoadKey, approvedSongs]);

  const handlePlayPause = (song) => {
    const src = song.audio_url || song.audio_file_url;
    if (!src || !String(src).trim()) {
      toast.error("No audio file available for this song.");
      return;
    }

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
      const newAudio = new Audio(String(src).trim());
      const syncDuration = () => {
        const d = newAudio.duration;
        if (Number.isFinite(d) && d > 0 && d !== Number.POSITIVE_INFINITY) {
          setTrackLengthSec((prev) => ({ ...prev, [song.song_id]: d }));
        }
      };
      newAudio.addEventListener("loadedmetadata", syncDuration);
      newAudio.addEventListener("timeupdate", () => setCurrentTime(newAudio.currentTime));
      newAudio.play().catch(() => {
        toast.error("Could not play this track.");
        setPlayingSongId(null);
      });
      setAudio(newAudio);
      setCurrentTime(0);
      setPlayingSongId(song.song_id);
      newAudio.onended = () => { setPlayingSongId(null); setCurrentTime(0); };
    }
  };

  const fetchProfile = async () => {
    if (!id) return;
    try {
      const response = await axiosApi.get(
        `/get-artist-detail?id=${encodeURIComponent(id)}`,
        {
          ...(headers?.Authorization ? { headers } : {}),
        },
      );
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
      return toast.error("Passwords do not match");
    }
    if (!newPassword || newPassword.trim() === "") {
      toast.error("Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    const token =
      parsedData?.token || headers?.Authorization?.replace("Bearer ", "");
    if (!token) {
      toast.error("Authentication token not found");
      return;
    }
    setIsLoading(true);
    try {
      await axiosApi.post(
        "/auth/change-password",
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Password changed successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error changing password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState("details");

  const openModal = () => setIsModalOpen(true);
  const closeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append("profile_image", file);
        const response = await updateProfileImage(formData, headers);
        setArtist((prev) => ({
          ...prev,
          personal_photo: response.data.personal_photo,
        }));
        toast.success("Profile image updated successfully");
      } catch (error) {
        toast.error("Failed to update profile image");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const SocialLinks = () => {
    const fb = socialHref(
      artist,
      "facebook_url",
      "facebook_link",
      "FacebookLink",
    );
    const ig = socialHref(
      artist,
      "instagram_url",
      "instagram_link",
      "InstagramLink",
    );
    const sp = socialHref(artist, "spotify_url", "spotify_link", "SpotifyLink");
    const am = socialHref(
      artist,
      "apple_music_url",
      "apple_music_link",
      "AppleMusicLink",
    );
    const items = [
      { href: fb, src: Face, alt: "Facebook" },
      { href: ig, src: Insta, alt: "Instagram" },
      { href: sp, src: Spotify, alt: "Spotify" },
      { href: am, src: AppleMusic, alt: "Apple Music" },
    ];
    return items.map(({ href, src, alt }) => {
      const safeHref = href ? normalizeExternalHref(href) : null;
      const imgClass = safeHref
        ? "opacity-70 w-10 h-10 object-cover hover:opacity-100"
        : "opacity-35 w-10 h-10 object-cover grayscale cursor-not-allowed";
      const img = <img src={src} alt="" className={imgClass} aria-hidden />;
      if (safeHref)
        return (
          <a
            key={alt}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            title={alt}
          >
            {img}
          </a>
        );
      return (
        <span
          key={alt}
          className="inline-flex select-none"
          aria-label={`${alt}: not available`}
          title="Not available"
        >
          {img}
        </span>
      );
    });
  };

  const PasswordForm = () => (
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
          className={`w-full py-3 ${
            isLoading
              ? "bg-cyan-500 cursor-not-allowed"
              : "bg-cyan-400 hover:bg-cyan-300"
          } text-gray-900 rounded-full font-medium transition-colors`}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );

  return (
    artist && (
      <>
        {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
        <div className="hidden lg:block min-h-[calc(100vh-70px)] text-gray-100 px-4 sm:px-8 py-6 overflow-x-hidden">
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
                  disabled={isUploadingImage}
                />
                <button
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 bg-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingImage ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Edit3 className="w-4 h-4 text-white" />
                  )}
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
              <NavbarRight />
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-gray-400">
                OPH Artist Code:{" "}
                <span className="text-white">#{artist.oph_id}</span>
              </p>
              <p className="text-gray-400">
                Profession:{" "}
                <span className="text-white">
                  {resolveProfessionLabel(
                    artist.profession ?? artist.Profession,
                    professions,
                  )}
                </span>
              </p>
            </div>

            {/* Bio */}
            <p className="text-gray-400 leading-relaxed">{artist.bio}</p>

            {/* Social links */}
            <div className="flex flex-wrap gap-4">
              <SocialLinks />
            </div>

            {/* Songs Table */}
            <div className="overflow-x-auto mt-8">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="text-center text-gray-300 border-b border-gray-800 text-xs">
                    <th className="pb-4 font-normal">#</th>
                    <th className="pb-4 font-normal">SONG NAME</th>
                    <th className="pb-4 font-normal">PLAYS</th>
                    <th
                      className="pb-4 font-normal"
                      title="Length of your uploaded audio file"
                    >
                      TIME
                    </th>
                    <th className="pb-4 font-normal">PLAY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
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
                    approvedSongs.map((song, index) => (
                      <tr key={song.song_id} className="group text-center">
                        <td className="py-4">{index + 1}</td>
                        <td className="py-4 text-center">
                          <div className="flex justify-center">
                            <div className="max-w-[120px] truncate">
                              <div className="font-medium">
                                {song.song_name}
                              </div>
                              <div className="text-sm text-gray-400">
                                {song.primary_artist}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">{song.total_song_views ?? "—"}</td>
                        <td className="py-4 tabular-nums text-gray-200 min-w-[3.5rem]">
                          {(() => {
                            const sec = trackLengthSec[song.song_id];
                            if (sec === undefined) return "…";
                            if (sec > 0) return formatTrackLengthSeconds(sec);
                            const mins = song.duration_in_minutes;
                            if (
                              mins != null &&
                              mins !== "" &&
                              !Number.isNaN(Number(mins)) &&
                              Number(mins) > 0
                            ) {
                              return `${Math.floor(Number(mins))}:00`;
                            }
                            return "—";
                          })()}
                        </td>
                        <td className="py-4">
                          <button
                            className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
                            onClick={() => handlePlayPause(song)}
                          >
                            {playingSongId === song.song_id &&
                            !audio?.paused ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Divider */}
            <hr className="border-gray-700 my-8" />

            {/* Change Password */}
            <PasswordForm />
          </div>
          {/* end desktop space-y-8 */}
        </div>
        {/* end hidden md:block */}

        {/* ── MOBILE LAYOUT (hidden on md+) ── */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
          disabled={isUploadingImage}
        />
        <div className="lg:hidden text-gray-100 flex flex-col px-[16px] py-[16px]">
          <div className="flex flex-col lg:flex-row justify-between mb-[10px] lg:mb-8">
            <div className="w-full flex items-center justify-between lg:justify-end mb-[16px] block lg:hidden">
              <NavbarLeft />
              <NavbarRight />
            </div>
            <div className="hidden lg:block">
              <NavbarRight />
            </div>
          </div>
          {/* Top: profile */}
          <div className="flex flex-col items-center pt-0 lg:pt-8 pb-4 px-4">
            <div className="relative mb-3">
              <img
                src={artist.personal_photo}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-cyan-600 object-cover cursor-pointer"
                onClick={openModal}
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 bg-purple-600 w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Edit3 className="w-3 h-3 text-white" />
                )}
              </button>
            </div>
            <h1 className="text-cyan-400 text-lg font-extrabold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
              {artist.name}
            </h1>
            <p className="text-gray-400 text-sm">
              Stage Name:{" "}
              <span className="text-cyan-400">{artist.stage_name}</span>
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-3">
              <SocialLinks />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {["details", "songs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? "text-cyan-400 border-b-2 border-cyan-400"
                    : "text-gray-400"
                }`}
              >
                {tab === "details" ? "Artist Details" : "Songs"}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="px-4 py-4 space-y-4">
            {activeTab === "details" ? (
              <>
                <p className="text-gray-400 text-sm">
                  OPH Artist Code:{" "}
                  <span className="text-white font-semibold">#{artist.oph_id}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Profession:{" "}
                  <span className="text-white font-semibold">
                    {resolveProfessionLabel(
                      artist.profession ?? artist.Profession,
                      professions,
                    )}
                  </span>
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">{artist.bio}</p>
              </>
            ) : (
              <>
                {approvedSongs.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-10">No songs added yet.</p>
                ) : (
                  approvedSongs.map((song) => {
                    const isPlaying = playingSongId === song.song_id && !audio?.paused;
                    const duration = trackLengthSec[song.song_id];
                    return (
                      <div key={song.song_id} className="border-b border-gray-800 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={song.song_image || song.cover_image || artist.personal_photo}
                            alt=""
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 uppercase">Song</div>
                            <div className="font-medium text-sm truncate">{song.song_name}</div>
                            <div className="text-xs text-gray-400 truncate">{song.primary_artist}</div>
                            <div className="text-xs text-gray-500">PLAY {song.total_song_views ?? "—"}</div>
                          </div>
                          <button
                            className="p-2 bg-purple-600 rounded-full hover:bg-purple-500 flex-shrink-0"
                            onClick={() => handlePlayPause(song)}
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                        </div>
                        {playingSongId === song.song_id && (
                          <input
                            type="range"
                            min={0}
                            max={duration > 0 ? duration : 100}
                            value={currentTime}
                            onChange={(e) => {
                              const t = Number(e.target.value);
                              if (audio) { audio.currentTime = t; setCurrentTime(t); }
                            }}
                            className="w-full mt-2 h-1 accent-[#5DC9DE] cursor-pointer"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Change Password — always visible below tabs */}
          <div className="px-4 pb-8">
            <hr className="border-gray-700 mb-4" />
            <PasswordForm />
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
              controls
              autoPlay
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </Modal>
      </>
    )
  );
}
