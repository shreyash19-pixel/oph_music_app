import React, { useEffect, useMemo, useRef, useState } from "react";
import HeroSection from "./components/HeroSection";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import axiosApi from "../../../conf/axios";
import { Helmet } from "react-helmet";
import {
  navigateToArtistDetail,
  resolveLeaderboardOphId,
} from "../../../utils/artistHash";

/** Public leaderboard shows only the most recent N months (latest first). */
const LEADERBOARD_MAX_MONTHS = 3;

/** Full month names as stored in monthly_kpi/leaderboard.json */
const MONTH_INDEX = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

/**
 * S3 payload: `{ [year]: { January: [...], ... } }`.
 * Flatten all years/months (not only current year) so historical months appear.
 */
function flattenLeaderboardHistory(full) {
  if (!full || typeof full !== "object" || Array.isArray(full)) return [];
  const yearKeys = Object.keys(full)
    .filter((k) => /^\d{4}$/.test(String(k)))
    .map((k) => Number(k))
    .sort((a, b) => b - a);

  const entries = [];
  for (const yk of yearKeys) {
    const block = full[yk] ?? full[String(yk)];
    if (!block || typeof block !== "object" || Array.isArray(block)) continue;

    const monthKeys = Object.keys(block).filter(
      (m) => Array.isArray(block[m]) && block[m].length > 0,
    );

    for (const month of monthKeys) {
      const title =
        yearKeys.length > 1 || monthKeys.length > 1 ? `${month} ${yk}` : month;
      entries.push({ title, month, year: yk, artists: block[month] });
    }
  }

  entries.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    const ia = MONTH_INDEX[a.month];
    const ib = MONTH_INDEX[b.month];
    return (ib ?? -1) - (ia ?? -1);
  });

  return entries
    .slice(0, LEADERBOARD_MAX_MONTHS)
    .map((e) => [e.title, e.artists]);
}

function asMonthArtistMapFromHistory(full) {
  const map = {};
  for (const [title, artists] of flattenLeaderboardHistory(full)) {
    map[title] = artists;
  }
  return map;
}

const LEADERBOARD_TOP_PER_MONTH = 10;

/** Best rank first, then take first N (API order may vary). */
function getTopArtistsForMonth(artists) {
  if (!Array.isArray(artists)) return [];
  return [...artists]
    .sort((a, b) => {
      const ra = Number(a?.ranks ?? a?.rank ?? 1e9);
      const rb = Number(b?.ranks ?? b?.rank ?? 1e9);
      return ra - rb;
    })
    .slice(0, LEADERBOARD_TOP_PER_MONTH);
}

function Leaderboard() {
  const navigate = useNavigate();

  const [artistsData, setArtistData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchArtist, setSearchArtist] = useState("");
  const artistRefs = useRef({});
  const [artistExists, setArtistExists] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    location: [],
    stageName: [],
    rank: [],
    profession: [],
  });
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueStageNames, setUniqueStageNames] = useState([]);
  const [uniqueRanks, setUniqueRanks] = useState([]);
  const getCurrentYear = new Date().getFullYear();

  const leaderboardMonthEntries = useMemo(() => {
    const data = asMonthArtistMap(artistsData);
    const entries = Object.entries(data).filter(([, artists]) =>
      Array.isArray(artists),
    );
    return sortMonthEntriesLatestFirst(entries);
  }, [artistsData]);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await axiosApi.get("/leaderboard/history");
        if (response.data?.success) {
          setArtistData(
            response.data.data &&
              typeof response.data.data === "object" &&
              !Array.isArray(response.data.data)
              ? response.data.data
              : {},
          );
        } else {
          setArtistData({});
        }
      } catch (err) {
        console.error(err.message);
        setArtistData({});
      } finally {
        setLoading(false);
      }
    };
    fetchArtist();
  }, []);

  const handleSearch = (artist_name) => {
    if (artist_name.trim() === "") {
      setArtistExists([]);
      return;
    }
    const normalizedArtistName = artist_name.toLowerCase();

    setSearchArtist(normalizedArtistName);
    const data = asMonthArtistMapFromHistory(artistsData);
    const exists = Object.values(data).map((month) =>
      Array.isArray(month)
        ? month.map((artist) =>
            artist?.stage_name?.toLowerCase().includes(normalizedArtistName)
              ? artist
              : null,
          )
        : [],
    );

    const filteredArtists = exists.flat().filter((artist) => artist !== null);
    setArtistExists(filteredArtists);
  };

  useEffect(() => {
    if (searchArtist && artistExists && artistRefs.current[searchArtist]) {
      artistRefs.current[searchArtist].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchArtist, artistExists, artistsData]);

  useEffect(() => {
    const locations = new Set();
    const stageNames = new Set();
    const ranks = new Set();

    const data = asMonthArtistMapFromHistory(artistsData);
    Object.values(data)
      .flat()
      .forEach((artist) => {
        if (!artist || typeof artist !== "object") return;
        if (artist.location != null) locations.add(artist.location);
        if (artist.stage_name != null) stageNames.add(artist.stage_name);
        if (artist.ranks != null) ranks.add(artist.ranks);
      });

    setUniqueLocations([...locations]);
    setUniqueStageNames([...stageNames]);
    setUniqueRanks([...ranks]);
  }, [artistsData]);

  const formatListeners = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M+`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K+`;
    }
    return `${views}+`;
  };

  const handleFilterChange = (selectedOptions, actionMeta) => {
    const { name } = actionMeta;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const applyFilters = () => {
    const data = asMonthArtistMapFromHistory(artistsData);
    const filteredArtists = Object.values(data)
      .flat()
      .filter((artist) => {
        if (!artist || typeof artist !== "object") return false;
        return (
          (filters.location.length === 0 ||
            filters.location.includes(artist.location)) &&
          (filters.stageName.length === 0 ||
            filters.stageName.includes(artist.stage_name)) &&
          (filters.rank.length === 0 ||
            filters.rank.includes(artist.ranks ?? artist.rank))
        );
      });
    setArtistExists(filteredArtists);
    setShowFilterModal(false);
  };

  const getRankBadgeStyles = (index) => {
    if (index === 0) return "bg-[#F3A823] text-black";
    if (index === 1) return "bg-[#26D07C] text-black";
    return "bg-[#29B6F6] text-black";
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "grey",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "black" : "grey",
      color: "white",
      "&:hover": {
        backgroundColor: "black",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "black",
      color: "white",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "white",
      "&:hover": {
        backgroundColor: "black",
        color: "white",
      },
    }),
  };

  return (
    <>
      <Helmet>
        <title>
          Top Independent Artist Platform | OPH Community Leaderboard
        </title>
        <meta
          name="description"
          content="Find top-ranked independent artists epk on India’s top music networking platform for creators. Use filters by location and profession to connect and collaborate."
        />
      </Helmet>

      {loading && (
        <div className="text-center h-[90vh] w-full py-32">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">Warming up... Almost there!</p>
        </div>
      )}

      {!loading && (
        <div className="scroll-smooth min-h-screen bg-black text-white">
          <HeroSection
            handleSearch={handleSearch}
            setArtistExists={setArtistExists}
            artistExists={artistExists}
            handleFilter={() => setShowFilterModal(true)}
          />
          <div className="lg:px-10 px-6 xl:px-16">
            <div className="container w-full mb-8 h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
          </div>

          {leaderboardMonthEntries.length === 0 && (
            <div className="px-6 lg:px-10 xl:px-16 pb-24 text-center">
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Leaderboard rankings are not available yet. When monthly KPI
                data is published, top artists will appear here.
              </p>
            </div>
          )}

          {/* ================= DESKTOP VIEW ================= */}
          {leaderboardMonthEntries.map(([title, artists]) => {
            const topArtists = getTopArtistsForMonth(artists);
            return (
              <div
                key={title}
                className="bg-black hidden sm:block p-4 md:px-10 xl:px-16 text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#5DC9DE] text-3xl font-extrabold uppercase tracking-wide drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                    {title}
                  </h2>
                </div>

                <div className="flex items-center text-gray-400 text-sm uppercase mb-4 px-4">
                  <div className="flex-1 relative left-2">#</div>
                  <div className="flex-1">Artist</div>
                  <div className="flex-1">Stage Name</div>
                  <div className="flex-1">Location</div>
                  <div className="flex-1 text-center">Songs</div>
                  <div className="flex-1 text-center">Reach</div>
                  <div className="flex-1 text-center">Profile</div>
                </div>
                <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative mb-2"></div>

                <div className="space-y-2">
                  {topArtists.map((artist, index) => (
                    <div
                      key={`${title}-${resolveLeaderboardOphId(artist) || artist.stage_name || index}`}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        artistExists &&
                        artistExists.some(
                          (art) =>
                            (art.stage_name || "").toLowerCase() ===
                            (artist.stage_name || "").toLowerCase(),
                        )
                          ? "bg-[#6F4FA0] text-white"
                          : "hover:bg-gray-900/30"
                      }`}
                    >
                      <div className="flex-1">
                        <span
                          className={`text-lg font-bold ${index === 0 ? "bg-amber-400 p-2 text-black text-xl" : index === 1 ? "bg-green-400 p-2 text-black text-xl" : index === 2 ? "bg-cyan-400 p-2 text-black text-xl" : "p-2 text-gray-300"}`}
                        >
                          {artist.ranks < 10
                            ? `0${artist.ranks}`
                            : `${artist.ranks}`}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={artist.personal_photo}
                            alt={artist.stage_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1 text-gray-300">
                        {artist.stage_name}
                      </div>
                      <div className="flex-1 text-gray-300">
                        {artist.location}
                      </div>
                      <div className="flex-1 text-center text-gray-300">
                        {artist.song_count}
                      </div>
                      <div className="flex-1 text-center text-gray-300">
                        {formatListeners(artist.total_views)}
                      </div>
                      <div className="flex-1 justify-center items-center flex">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const oid = resolveLeaderboardOphId(artist);
                            if (!oid) return;
                            void navigateToArtistDetail(navigate, oid);
                          }}
                          className="px-4 py-1 text-sm text-[#5DC9DE] border border-[#5DC9DE] rounded-full hover:bg-cyan-400 hover:text-black transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ================= FIXED MOBILE SPECIFIC VERTICAL CARDS VIEW ================= */}
          {leaderboardMonthEntries.map(([title, artists]) => {
            const topArtists = getTopArtistsForMonth(artists);
            return (
              <div
                key={`${title}-mobile-container`}
                className="bg-black block sm:hidden p-6 text-white max-w-sm mx-auto"
              >
                {/* Left aligned header title like LEADERBOARD.jpg */}
                <div className="mb-6 text-left">
                  <h2 className="text-[#5DC9DE] text-2xl font-extrabold uppercase tracking-widest drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
                    {title}
                  </h2>
                </div>

                {/* Pure Vertical Cards Stack Stacked Top-to-Bottom */}
                <div className="flex flex-col space-y-8">
                  {topArtists.map((artist, index) => {
                    const formattedRank =
                      artist.ranks < 10
                        ? `0${artist.ranks}`
                        : `${artist.ranks}`;
                    const isHighlighted =
                      artistExists &&
                      artistExists.some(
                        (art) =>
                          (art.stage_name || "").toLowerCase() ===
                          (artist.stage_name || "").toLowerCase(),
                      );

                    return (
                      <div
                        key={`${title}-mobile-card-${resolveLeaderboardOphId(artist) || artist.stage_name || index}`}
                        ref={(el) => {
                          const key = (artist.stage_name || "").toLowerCase();
                          if (key) artistRefs.current[key] = el;
                        }}
                        className={`w-full flex flex-col bg-transparent pb-6 border-b border-gray-900 last:border-b-0 text-left transition-colors rounded-md ${
                          isHighlighted ? "bg-[#6F4FA0]/20 px-2 pt-2" : ""
                        }`}
                      >
                        {/* 1. CARD HEADER ROW: Rank box, Avatar circle, Stage name text label column */}
                        <div className="flex items-center space-x-4 w-full">
                          {/* Design Accurate Square Rank Box */}
                          <div
                            className={`w-11 h-11 flex items-center justify-center font-black text-base shrink-0 ${getRankBadgeStyles(index)}`}
                          >
                            {formattedRank}
                          </div>

                          {/* Round Profile Thumbnail */}
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-800 shrink-0">
                            <img
                              src={artist.personal_photo}
                              alt={artist.stage_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/150";
                              }}
                            />
                          </div>

                          {/* Description Stack Container */}
                          <div className="flex flex-col justify-center">
                            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase leading-none">
                              STAGE NAME
                            </span>
                            <span className="text-sm font-extrabold text-white uppercase tracking-wide mt-1">
                              {artist.stage_name || "UNKNOWN"}
                            </span>
                          </div>
                        </div>

                        {/* 2. MIDDLE METRICS COMPONENT: 3 Columns Grid View */}
                        <div className="grid grid-cols-3 gap-2 w-full mt-5 pt-4 border-t border-gray-900/50">
                          {/* Location Block */}
                          <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                              LOCATION
                            </span>
                            <span className="text-xs font-black text-white uppercase mt-0.5 truncate">
                              {artist.location || "MUMBAI"}
                            </span>
                          </div>

                          {/* Songs Block */}
                          <div className="flex flex-col text-center">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                              SONGS
                            </span>
                            <span className="text-xs font-black text-white mt-0.5">
                              {artist.song_count ?? "0"}
                            </span>
                          </div>

                          {/* Reach Block */}
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">
                              REACH
                            </span>
                            <span className="text-xs font-black text-white mt-0.5 break-all">
                              {formatListeners(artist.total_views)}
                            </span>
                          </div>
                        </div>

                        {/* 3. BOTTOM FOOTER SECTION: Full width pill button link */}
                        <div className="w-full mt-5">
                          <button
                            type="button"
                            onClick={() => {
                              const oid = resolveLeaderboardOphId(artist);
                              if (!oid) return;
                              void navigateToArtistDetail(navigate, oid);
                            }}
                            className="w-full py-2.5 text-center text-xs font-bold tracking-widest text-[#5DC9DE] bg-transparent border border-gray-800 rounded-full active:bg-[#5DC9DE] active:text-black transition-all duration-150 uppercase"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg max-w-md w-full border border-gray-900">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Filter Artists
            </h2>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Location</label>
              <Select
                name="location"
                isMulti
                options={uniqueLocations.map((location) => ({
                  value: location,
                  label: location,
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customStyles}
                onChange={handleFilterChange}
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg mr-2 text-sm font-semibold"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                onClick={applyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Leaderboard;
