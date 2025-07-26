import React, { useEffect, useRef, useState } from "react";
import HeroSection from "./components/HeroSection";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { Helmet } from "react-helmet";
function Leaderboard() {
  const navigate = useNavigate();
  const artistsData = useSelector(
    (state) => state.leaderboard.history_leaderboard
  );
  console.log(artistsData);

  const loading = useSelector((state) => state.leaderboard.loading);
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
  const [uniqueProfessions, setUniqueProfessions] = useState([]);

  const handleSearch = (artist_name) => {
    if (artist_name.trim() === "") {
      setArtistExists([]);
      return;
    }
    const normalizedArtistName = artist_name.toLowerCase();
    setSearchArtist(normalizedArtistName);
    const exists = Object.values(artistsData).map((month) =>
      month.map((artist) =>
        artist.stage_name.toLowerCase().includes(normalizedArtistName) ||
        artist.name.toLowerCase().includes(normalizedArtistName)
          ? artist
          : null
      )
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
    const professions = new Set();

    Object.values(artistsData)
      .flat()
      .forEach((artist) => {
        locations.add(artist.location);
        stageNames.add(artist.stage_name);
        ranks.add(artist.rank);
        console.log(artist, "artist.profession_name");
        professions.add(artist.profession_name);
      });

    setUniqueLocations([...locations]);
    setUniqueStageNames([...stageNames]);
    setUniqueRanks([...ranks]);
    setUniqueProfessions([...professions]);
  }, [artistsData]);

  const handleProfileClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

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
    const filteredArtists = Object.values(artistsData)
      .flat()
      .filter((artist) => {
        return (
          (filters.location.length === 0 ||
            filters.location.includes(artist.location)) &&
          (filters.stageName.length === 0 ||
            filters.stageName.includes(artist.stage_name)) &&
          (filters.rank.length === 0 || filters.rank.includes(artist.rank)) &&
          (filters.profession.length === 0 ||
            filters.profession.includes(artist.profession_name ))
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
        <title>Top Independent Artist Platform | OPH Community Leaderboard</title>
        <meta name="description" content="Find top-ranked independent artists epk on India’s top music networking platform for creators. Use filters by location and profession to connect and collaborate." />
      </Helmet>
      {loading && (
        <div className="text-center h-[90vh] w-full py-32">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">
            🎤 "Warming up the mic... Almost there!"
          </p>
        </div>
      )}
      {!loading && (
        <div className="scroll-smooth">
          <HeroSection
            handleSearch={handleSearch}
            setArtistExists={setArtistExists}
            artistExists={artistExists}
            handleFilter={() => setShowFilterModal(true)} // Pass handleFilter as a prop
          />
          <div className="lg:px-10 px-6 xl:px-16">
            <div className="container w-full mb-8 h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
          </div>
          {Object.entries(artistsData).map(([title, artists]) => (
            <div
              key={title}
              className="bg-black hidden sm:block p-4 md:px-10 xl:px-16 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#5DC9DE] text-2xl font-bold uppercase drop-shadow-[0_0_20px_white]">
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
                {artists.map((artist, index) => (
                  <div
                    key={artist.artist_id}
                    ref={(el) =>
                      (artistRefs.current[artist.stage_name.toLowerCase()] = el)
                    }
                    onClick={() => handleProfileClick(artist.artist_id)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      artistExists &&
                      artistExists.some(
                        (art) =>
                          art.stage_name.toLowerCase() ===
                            artist.stage_name.toLowerCase() ||
                          art.name.toLowerCase() === artist.name.toLowerCase()
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
                          ? `0${artist.rank}`
                          : `${artist.rank}`}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={artist.profile_img_url}
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
                      {artist.total_songs}
                    </div>
                    <div className="flex-1 text-center text-gray-300">
                      {formatListeners(artist.total_reach)}
                    </div>

                    {/* Show the View Profile button on medium screens and above */}
                    <div className="flex-1 justify-center items-center w-full hidden sm:flex">
                      <Link to={`/artists/${artist.artist_id}`}>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-1 text-sm text-[#5DC9DE] border border-[#5DC9DE] rounded-full hover:bg-cyan-400 hover:text-black transition-colors"
                        >
                          View Profile
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.entries(artistsData).map(([title, artists]) => (
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
                {artists.map((artist, index) => (
                  <div
                    key={artist.artist_id}
                    ref={(el) =>
                      (artistRefs.current[artist.stage_name.toLowerCase()] = el)
                    }
                    onClick={() => handleProfileClick(artist.artist_id)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                      artistExists &&
                      artistExists.some(
                        (art) =>
                          art.stage_name.toLowerCase() ===
                            artist.stage_name.toLowerCase() ||
                          art.name.toLowerCase() === artist.name.toLowerCase()
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
                          ? `0${artist.rank}`
                          : `${artist.rank}`}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={artist.profile_img_url}
                          alt={artist.stage_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 text-gray-300">
                      {artist.stage_name}
                    </div>
                    <div className="flex-1 text-center text-gray-300">
                      {artist.total_songs}
                    </div>
                    <div className="flex-1 text-center text-gray-300">
                      {formatListeners(artist.total_reach)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            <div className="mb-4">
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
            </div>

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
