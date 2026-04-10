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

function sortMonthEntriesLatestFirst(entries) {
  return [...entries].sort((a, b) => {
    const ia = MONTH_INDEX[a[0]];
    const ib = MONTH_INDEX[b[0]];
    const va = ia === undefined ? -1 : ia;
    const vb = ib === undefined ? -1 : ib;
    return vb - va;
  });
}

/** S3 payload is `{ [year]: { January: [...], ... } }`. Pick current year or latest year with data. */
function pickLeaderboardYearBlock(full, year) {
  if (!full || typeof full !== "object" || Array.isArray(full)) return {};
  const block = full[year] ?? full[String(year)];
  if (block && typeof block === "object" && !Array.isArray(block)) {
    return block;
  }
  const yearKeys = Object.keys(full)
    .filter((k) => /^\d{4}$/.test(String(k)))
    .map((k) => Number(k))
    .sort((a, b) => b - a);
  for (const yk of yearKeys) {
    const b = full[yk] ?? full[String(yk)];
    if (b && typeof b === "object" && !Array.isArray(b)) return b;
  }
  return {};
}

function asMonthArtistMap(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return v;
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
  // const [uniqueProfessions, setUniqueProfessions] = useState([]);
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
          const monthMap = pickLeaderboardYearBlock(
            response.data.data,
            getCurrentYear,
          );
          setArtistData(monthMap);
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
    console.log(artist_name);

    if (artist_name.trim() === "") {
      setArtistExists([]);
      return;
    }
    const normalizedArtistName = artist_name.toLowerCase();
    console.log(normalizedArtistName);

    setSearchArtist(normalizedArtistName);
    const data = asMonthArtistMap(artistsData);
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

    const data = asMonthArtistMap(artistsData);
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
    const data = asMonthArtistMap(artistsData);
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
            handleFilter={() => setShowFilterModal(true)} // Pass handleFilter as a prop
          />
          <div className="lg:px-10 px-6 xl:px-16">
            <div className="container w-full mb-8 h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
          </div>
          {leaderboardMonthEntries.length === 0 && (
            <div className="px-6 lg:px-10 xl:px-16 pb-24 text-center">
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Leaderboard rankings are not available yet. When monthly KPI data
                is published, top artists will appear here.
              </p>
            </div>
          )}
          {leaderboardMonthEntries.map(([title, artists]) => {
            const topArtists = getTopArtistsForMonth(artists);
            return (
              <div
                key={title}
                className="bg-black hidden sm:block p-4 md:px-10 xl:px-16 text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-[#5DC9DE] text-3xl sm:text-3xl font-extrabold uppercase tracking-wide 
   drop-shadow-[0_0_15px_rgba(34,211,238,1)]"
                  >
                    {title}
                  </h2>
                </div>

                {/* Table Header */}
                <div className="flex items-center text-gray-400 text-sm uppercase mb-4 px-4">
                  <div className="flex-1 relative left-2">#</div>
                  <div className="flex-1">Artist</div>
                  <div className="flex-1">Stage Name</div>
                  <div className="flex-1 hidden sm:block">Location</div>
                  <div className="flex-1 text-center">Songs</div>
                  <div className="flex-1 text-center">Reach</div>
                  <div className="flex-1 hidden sm:block text-center">
                    Profile
                  </div>
                </div>
                <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

                {/* Artist Rows */}
                <div className="space-y-2">
                  {topArtists.map((artist, index) => (
                    <div
                      key={`${title}-${resolveLeaderboardOphId(artist) || artist.stage_name || index}`}
                      ref={(el) => {
                        const key = (artist.stage_name || "").toLowerCase();
                        if (key) artistRefs.current[key] = el;
                      }}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        artistExists &&
                        artistExists.some(
                          (art) =>
                            (art.stage_name || "").toLowerCase() ===
                            (artist.stage_name || "").toLowerCase(),
                          // || art.name.toLowerCase() === artist.name.toLowerCase()
                        )
                          ? "bg-[#6F4FA0] text-white"
                          : "hover:bg-gray-900/30"
                      }`}
                    >
                      <div className="flex-1">
                        <span
                          className={`text-lg font-bold ${
                            index === 0
                              ? "bg-amber-400 p-2 text-black text-xl"
                              : index === 1
                                ? "bg-green-400 p-2 text-black text-xl"
                                : index === 2
                                  ? "bg-cyan-400 p-2 text-black text-xl"
                                  : "p-2 text-gray-300"
                          }`}
                        >
                          {artist.rank < 10
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
                      <div className="flex-1 text-gray-300 hidden sm:block">
                        {artist.location}
                      </div>
                      <div className="flex-1 text-center text-gray-300">
                        {artist.song_count}
                      </div>
                      <div className="flex-1 text-center text-gray-300">
                        {formatListeners(artist.total_views)}
                      </div>

                      {/* Show the View Profile button on medium screens and above */}
                      <div className="flex-1 justify-center items-center w-full hidden sm:flex">
                        <div className="flex-1 justify-center items-center w-full hidden sm:flex">
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
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {leaderboardMonthEntries.map(([title, artists]) => {
            const topArtists = getTopArtistsForMonth(artists);
            return (
              <div
                key={title}
                className="bg-black block sm:hidden p-4 md:px-10 xl:px-16 text-white"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[#5DC9DE] text-2xl font-bold">{title}</h2>
                </div>

                {/* Table Header */}
                <div className="flex items-center text-gray-400 text-sm uppercase mb-4 px-4">
                  <div className="flex-1 relative left-2">#</div>
                  <div className="flex-1">Artist</div>
                  <div className="flex-1">Stage Name</div>
                  <div className="flex-1 text-center">Songs</div>
                  <div className="flex-1 text-center">Reach</div>
                  <div className="flex-1 hidden sm:block text-center">
                    Profile
                  </div>
                </div>
                <div className="container w-full  h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>

                {/* Artist Rows */}
                <div className="space-y-2">
                  {topArtists.map((artist, index) => (
                    <div
                      key={`${title}-mobile-${resolveLeaderboardOphId(artist) || artist.stage_name || index}`}
                      ref={(el) => {
                        const key = (artist.stage_name || "").toLowerCase();
                        if (key) artistRefs.current[key] = el;
                      }}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const oid = resolveLeaderboardOphId(artist);
                        if (!oid) return;
                        void navigateToArtistDetail(navigate, oid);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          const oid = resolveLeaderboardOphId(artist);
                          if (!oid) return;
                          void navigateToArtistDetail(navigate, oid);
                        }
                      }}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        artistExists &&
                        artistExists.some(
                          (art) =>
                            (art.stage_name || "").toLowerCase() ===
                            (artist.stage_name || "").toLowerCase(),
                          // ||
                          //art.name.toLowerCase() === artist.name.toLowerCase()
                        )
                          ? "bg-[#6F4FA0] text-white"
                          : "hover:bg-gray-900/30"
                      }`}
                    >
                      <div className="flex-1">
                        <span
                          className={`text-lg font-bold ${
                            index === 0
                              ? "bg-amber-400 p-2 text-black text-xl"
                              : index === 1
                                ? "bg-green-400 p-2 text-black text-xl"
                                : index === 2
                                  ? "bg-cyan-400 p-2 text-black text-xl"
                                  : "p-2 text-gray-300"
                          }`}
                        >
                          {artist.rank < 10
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
                      <div className="flex-1 text-center text-gray-300">
                        {artist.song_count}
                      </div>
                      <div className="flex-1 text-center text-gray-300">
                        {formatListeners(artist.total_views)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-black p-6 rounded-lg max-w-md w-full">
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
            {/* <div className="mb-4">
              <label className="block text-gray-300 mb-2">Profession</label>
              <Select
                name="profession"
                isMulti
                options={uniqueProfessions.map((profession) => ({
                  value: profession,
                  label: profession,
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customStyles}
                onChange={handleFilterChange}
              />
            </div> */}

            <div className="flex justify-end">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mr-2"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
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
