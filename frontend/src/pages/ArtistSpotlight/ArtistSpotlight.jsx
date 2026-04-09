import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { useSelector } from "react-redux";
import { useArtist } from "../auth/API/ArtistContext";
import { useNavigate } from "react-router-dom";
import {
  navigateToArtistDetail,
  resolveLeaderboardOphId,
} from "../../utils/artistHash";

import NavbarRight from "../../components/Navbar/NavbarRight";

const ARTIST_SPOTLIGHT_EMPTY_NOTE = "No Note Provided Yet.";
const LEADERBOARD_UI_MAX_ROWS = 10;

function formatReach(views) {
  const n = Number(views ?? 0);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K+`;
  return `${n.toLocaleString()}+`;
}

function rankBadgeVisualClass(rank) {
  if (rank === 1) return "bg-yellow-400 text-black ring-2 ring-yellow-200/60";
  if (rank === 2) return "bg-emerald-400 text-black ring-2 ring-emerald-200/60";
  if (rank === 3) return "bg-cyan-400 text-black ring-2 ring-cyan-200/60";
  return "bg-[#1f2937] text-white ring-2 ring-[#5DC9DE]";
}

function Leaderboard({ leaderboardData, artistId }) {
  const navigate = useNavigate();
  const { headers, ophid } = useArtist();

  const myOphId = String(ophid ?? artistId ?? "").trim();
  const fullList = Array.isArray(leaderboardData) ? leaderboardData : [];
  const meRow = myOphId
    ? fullList.find((entry) => resolveLeaderboardOphId(entry) === myOphId)
    : null;
  const meRankRaw = meRow?.ranks ?? meRow?.rank;
  const meRank =
    meRankRaw != null && meRankRaw !== "" ? Number(meRankRaw) : null;
  const meRankValid = Number.isFinite(meRank) ? meRank : null;

  const goToArtistProfile = (ophId) => {
    if (!ophId) return;
    void navigateToArtistDetail(
      navigate,
      ophId,
      headers?.Authorization ? headers : null,
    );
  };

  const rows = Array.isArray(leaderboardData)
    ? leaderboardData.slice(0, LEADERBOARD_UI_MAX_ROWS)
    : [];

  return (
    <div className="px-6 lg:px-0">
      <div
        className={`mb-6 rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
          meRankValid != null
            ? "border-[#5DC9DE]/35 bg-gray-800/50 ring-1 ring-[#5DC9DE]/25"
            : "border-gray-700/60 bg-gray-800/30"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {meRankValid != null ? (
              <span
                className={`flex min-h-[2.25rem] min-w-[2.25rem] shrink-0 -rotate-12 items-center justify-center rounded-full px-2 py-1 text-base font-bold tabular-nums sm:min-h-[2.5rem] sm:min-w-[2.5rem] sm:text-lg ${rankBadgeVisualClass(
                  meRankValid,
                )}`}
                title={`Community leaderboard rank #${meRankValid}`}
                aria-label={`Your leaderboard rank ${meRankValid}`}
              >
                {meRankValid}
              </span>
            ) : (
              <span
                className="flex min-h-[2.25rem] min-w-[2.25rem] shrink-0 -rotate-12 items-center justify-center rounded-full bg-gray-800/90 px-2 py-1 text-sm font-medium tabular-nums text-gray-400 ring-1 ring-gray-600"
                title="Not on the community leaderboard yet"
                aria-label="Not on the community leaderboard"
              >
                –
              </span>
            )}
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Your position
              </p>
              {meRankValid != null ? (
                <p className="text-lg font-bold text-white sm:text-xl">
                  #{meRankValid}{" "}
                  <span className="font-normal text-gray-400">
                    on the community leaderboard
                  </span>
                </p>
              ) : (
                <p className="text-base text-gray-400">
                  You&apos;re not on the leaderboard yet — keep publishing and
                  engaging to appear here.
                </p>
              )}
            </div>
          </div>
          {meRow && meRankValid != null && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300 sm:justify-end">
              <span>
                <span className="text-gray-500">Stage: </span>
                <span className="font-medium text-[#5DC9DE]">
                  {meRow.stage_name ?? "—"}
                </span>
              </span>
              <span>
                <span className="text-gray-500">Songs: </span>
                <span className="font-semibold text-white">
                  {meRow.song_count ??
                    meRow.songCount ??
                    meRow.SONG_COUNT ??
                    "—"}
                </span>
              </span>
              <span>
                <span className="text-gray-500">Reach: </span>
                <span className="font-semibold text-white">
                  {formatReach(
                    meRow.total_views ?? meRow.Total_views ?? meRow.totalViews,
                  )}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-[100%] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-center text-gray-400 rounded-2xl border-gray-800 rounded-2xl">
              <th className="py-2 px-3 lg:px-4">#</th>
              <th className="py-2 px-3 lg:px-4">ARTIST</th>
              <th className="py-2 px-3 lg:px-4">STAGE NAME</th>
              <th className="py-2 hidden lg:block px-3 lg:px-4">LOCATION</th>
              <th className="py-2 px-3 lg:px-4">SONGS</th>
              <th className="py-2 px-3 lg:px-4">REACH</th>
              <th className="py-2 hidden lg:block px-3 lg:px-4">PROFILE</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 &&
              rows.map((artist, index) => (
                <tr
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    goToArtistProfile(resolveLeaderboardOphId(artist))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      goToArtistProfile(resolveLeaderboardOphId(artist));
                    }
                  }}
                  key={`${resolveLeaderboardOphId(artist) || "row"}-${index}`}
                  className={`cursor-pointer rounded-2xl text-center border-gray-800 rounded-full overflow-hidden ${
                    artist.OPH_ID == artistId ? "bg-[#6F4aA0]" : ""
                  }`}
                >
                  <td className="px-3 lg:px-4 py-2">
                    <span
                      className={`w-8 h-8 flex items-center justify-center text-md font-bold text-black ${
                        artist.ranks === 1
                          ? "bg-yellow-400"
                          : artist.ranks === 2
                            ? "bg-emerald-400"
                            : artist.ranks === 3
                              ? "bg-cyan-400"
                              : "bg-transparent text-white"
                      }`}
                    >
                      {String(artist.ranks).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="py-2 flex items-center justify-center px-3 lg:px-4">
                    <img
                      src={`${artist.personal_photo}?height=40&width=40`}
                      alt={artist.stage_name}
                      className="w-8 h-8 rounded-full"
                    />
                  </td>
                  <td className="py-2 px-3 lg:px-4">{artist.stage_name}</td>
                  <td className="py-2 hidden lg:block px-3 lg:px-4">
                    {artist.location}
                  </td>
                  <td className="py-2 px-3 lg:px-4">{artist.song_count}</td>
                  <td className="py-2 px-3 lg:px-4">
                    {formatReach(
                      artist.total_views ??
                        artist.Total_views ??
                        artist.totalViews,
                    )}
                  </td>
                  <td className="py-2 hidden lg:block px-3 lg:px-4">
                    <button
                      type="button"
                      className="px-3 lg:px-4 py-2 bg-[#6F4fca] rounded-full text-sm hover:bg-[#6F4FA0] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const oid = resolveLeaderboardOphId(artist);
                        if (!oid) return;
                        goToArtistProfile(oid);
                      }}
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const SongDuration = ({ url, className = "", as: As = "span" }) => {
  const [duration, setDuration] = useState(null);

  useEffect(() => {
    if (!url || typeof url !== "string" || !url.trim()) {
      setDuration(null);
      return;
    }

    const audio = new Audio(url.trim());
    const onMeta = () => {
      setDuration(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : null,
      );
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("error", () => setDuration(null));

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const text =
    !url || (typeof url === "string" && !url.trim())
      ? "—"
      : duration != null
        ? formatTime(duration)
        : "…";

  return <As className={className}>{text}</As>;
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

function Songs() {
  /* Previous song rankings tables + audio — restore from git if needed:
   * get-songs-rankings-by-id, artistSongs state, handlePlayPause, two <table> blocks
   * ("Current Song" card + "Other Songs" section).
   */
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
        <div className="flex min-h-[200px] sm:min-h-[260px] items-center justify-center px-4">
          <h2 className="text-center text-4xl font-bold tracking-tight text-cyan-400 sm:text-5xl md:text-6xl lg:text-7xl">
            Coming soon
          </h2>
        </div>
      </div>
    </div>
  );
}

export default function ArtistSpotlight() {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const leaderboard = useSelector((state) => state.newRelease.leaderboard);

  console.log(leaderboard);

  const [artist_id, setArtistID] = useState(null);
  const [songsById, setSongsById] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [artist, setArtist] = useState([]);
  const { headers, ophid } = useArtist();

  const [notes, setNotes] = useState(ARTIST_SPOTLIGHT_EMPTY_NOTE);

  const applyNoteFromRow = (row) => {
    if (!row) {
      setNotes(ARTIST_SPOTLIGHT_EMPTY_NOTE);
      return;
    }
    const raw = row.Notes ?? row.notes ?? row.NOTE ?? row.note ?? null;
    const text =
      raw == null || raw === "null" || String(raw).trim() === ""
        ? ARTIST_SPOTLIGHT_EMPTY_NOTE
        : String(raw);
    setNotes(text);
  };

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

  const fetchArtistSpotlight = async () => {
    setIsLoading(true);
    try {
      if (!headers || !headers.Authorization) {
        console.warn("Headers not ready yet");
        return;
      }
      const response = await axiosApi.get("/artist-spotlight/artist-info", {
        headers: headers,
        params: { ophid },
      });
      if (response.data.success) {
        const row = response.data.data[0];
        setArtist(row);
        setArtistID(row.oph_id);
        applyNoteFromRow(row);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Failed to Load Artist Spotlight");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  function formatProfessionLabel(raw) {
    if (raw == null || String(raw).trim() === "") return "—";
    const s = String(raw).trim();
    if (/^\d+$/.test(s)) {
      const id = parseInt(s, 10);
      const prof = professions.find((pf) => pf.id === id);
      return prof?.name ?? s;
    }
    return s;
  }

  const getArtistRank = () => {
    if (!leaderboard || !Array.isArray(leaderboard)) return null;
    const myId = String(artist?.oph_id ?? ophid ?? "").trim();
    if (!myId) return null;

    const found = leaderboard.find((entry) => {
      const eid = resolveLeaderboardOphId(entry);
      return eid === myId;
    });

    if (!found) return null;
    const raw = found.ranks ?? found.rank;
    if (raw == null || raw === "") return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  };

  useEffect(() => {
    if (ophid) {
      fetchArtistSpotlight();
    }
  }, [ophid]);
  return (
    <>
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 rounded-2xl-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-cyan-400">Loading Artist Spotlight...</p>
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-400">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500/20 rounded hover:bg-red-500/30"
          >
            Try Again
          </button>
        </div>
      )}
      {!isLoading && !error && (
        <div className="min-h-[calc(100vh-70px)] text-gray-100 p-0 lg:p-6">
          <div className="max-w-8xl mx-auto space-y-8">
            {/* Artist Header */}
            <div className="flex justify-between items-center  mb-8">
              <h2 className="text-[#00B8D9] text-2xl sm:text-3xl font-bold uppercase drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                ARTIST SPOTLIGHT
              </h2>
              <NavbarRight />
            </div>
            <div className="flex justify-start items-center gap-4 px-6">
              {/* Artist Image with Rank Badge */}
              <div className="relative">
                <img
                  src={artist.personal_photo}
                  alt={artist.stage_name}
                  className="w-32 h-32 rounded-full border-[6px] border-[#5DC9DE] object-cover shadow-[0_0_20px_#5DC9DE]"
                />

                {/* Rank Badge */}
                {(() => {
                  const rank = getArtistRank();

                  // Common purple style
                  const rankBgClass =
                    "bg-[#6F4FA0] text-white ring-1 ring-[#6F4FA0]";

                  if (rank == null) {
                    return (
                      <span
                        className={`absolute bottom-0 right-0 min-w-[1.75rem] lg:min-w-9 px-1 lg:px-1.5 py-0.5 lg:py-1 rounded-full transform -rotate-12 flex items-center justify-center text-xs lg:text-sm font-medium tabular-nums ${rankBgClass}`}
                        title="Not on the community leaderboard yet. Rankings are for artists who appear on the public leaderboard."
                        aria-label="Not on the community leaderboard"
                      >
                        –
                      </span>
                    );
                  }

                  return (
                    <span
                      className={`absolute bottom-0 right-0 min-w-[1.75rem] lg:min-w-9 px-1 lg:px-1.5 py-0.5 lg:py-1 rounded-full transform -rotate-12 flex items-center justify-center text-xs lg:text-sm font-bold tabular-nums ${rankBgClass}`}
                      title={`Community leaderboard rank #${rank}`}
                      aria-label={`Leaderboard rank ${rank}`}
                    >
                      {rank}
                    </span>
                  );
                })()}
              </div>

              {/* Artist Info */}
              <div className="text-left">
                <h2 className="text-[45px] font-bold text-white">
                  {artist.full_name}
                </h2>
                <p className="text-gray-400">
                  Stage Name:{" "}
                  <span className="text-[#5DC9DE]">{artist.stage_name}</span>
                </p>
              </div>
            </div>

            <div className="px-6">
              <p className="text-gray-400">
                Profession:{" "}
                {formatProfessionLabel(artist.Profession ?? artist.profession)}
              </p>
              <p className="text-gray-500 mt-4">{artist.Bio}</p>
            </div>
            {/* Tab Buttons */}
            <div className="flex justify-between sm:px-3 items-center">
              <div>
                <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] lg:px-0 px-6 lg:py-0 pt-6 uppercase">
                  {activeTab}
                </h1>
              </div>
              <div className="flex lg:px-0 gap-4 px-3">
                <button
                  className={`hover:text-cyan-400 ${
                    activeTab === "leaderboard"
                      ? "text-cyan-400 border-cyan-400"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("leaderboard")}
                >
                  ARTISTS
                </button>
                <button
                  className={` hover:text-cyan-400 ${
                    activeTab === "songs"
                      ? "text-cyan-400 border-cyan-400"
                      : "text-gray-400"
                  }`}
                  onClick={() => setActiveTab("songs")}
                >
                  SONGS
                </button>
              </div>
            </div>

            {/* Render Active Tab */}
            {activeTab === "leaderboard" ? (
              <Leaderboard
                leaderboardData={leaderboard}
                artistId={artist.oph_id}
              />
            ) : (
              <Songs />
            )}

            {/* Note Section */}
            {/* <div className="space-y-4 lg:px-0 px-6">
              <h3 className="text-xl font-semibold text-cyan-400">
                Note (How to improve ranking):
              </h3>
              <p className="text-gray-500 whitespace-pre-line">
                {notes}
              </p>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
}
