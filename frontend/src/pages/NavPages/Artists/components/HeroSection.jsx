import React, { useState, useEffect } from "react";
import searchIc from "/assets/images/artists/searchIc.svg";
import { ChevronDown } from "lucide-react";

const selectClass =
  "w-full sm:flex-1 min-w-[140px] appearance-none rounded-full border border-white/20 bg-gray-100/20 backdrop-blur-sm py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#5DC9DE]/60 cursor-pointer";

const HeroSection = ({
  onSearchQueryChange,
  profession,
  location,
  professionOptions = [],
  locationOptions = [],
  onProfessionChange,
  onLocationChange,
}) => {
  const [inputName, setInputName] = useState("");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearchQueryChange?.(inputName.trim());
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputName, onSearchQueryChange]);

  const handleSearchClick = () => {
    onSearchQueryChange?.(inputName.trim());
  };

  return (
    <div className="relative sm:min-h-[70vh] min-h-[40vh] w-full flex flex-col items-center justify-center text-white pt-[100px] sm:pt-[140px]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10" />
      <div
        className="absolute inset-0 bg-[url('/assets/images/artists/artistHeroBg.png')] bg-cover bg-center"
        style={{ backgroundBlendMode: "overlay" }}
        aria-label="Artists EPK"
      />
      <div className="relative z-20 max-w-5xl w-full text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold">
          FIND YOUR <span className="text-[#5DC9DE]">COLLABORATOR</span>
        </h1>
        <p className="text-gray-300 px-4 sm:text-base lg:text-lg">
          No need to look anywhere else—every music artist you seek is right
          here.
        </p>

        <div className="flex flex-col items-center gap-4 mt-8 relative px-4">
          <div className="relative flex w-full max-w-[600px] bg-gray-100/20 rounded-full backdrop-blur-sm py-2">
            <input
              type="text"
              placeholder="Search Artists..."
              value={inputName}
              className="flex-1 px-6 py-3 bg-transparent text-white placeholder-gray-300 focus:outline-none min-w-0"
              onChange={(e) => setInputName(e.target.value)}
            />
            <button
              type="button"
              className="px-4 sm:px-8 py-3 bg-[#5DC9DE] hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors ml-2 mr-2 min-w-[44px] shrink-0"
              onClick={handleSearchClick}
            >
              <img
                src={searchIc}
                alt="Search Icon"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <span className="ml-2 text-gray-800 font-medium hidden sm:inline">
                Search
              </span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row w-full max-w-[600px] gap-3 justify-center">
            <div className="relative w-full sm:flex-1">
              <select
                className={selectClass}
                value={profession}
                onChange={(e) => onProfessionChange?.(e.target.value)}
                aria-label="Filter by profession"
              >
                <option value="" className="bg-gray-900 text-white">
                  All professions
                </option>
                {professionOptions.map((p) => (
                  <option key={p} value={p} className="bg-gray-900 text-white">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                aria-hidden
              />
            </div>
            <div className="relative w-full sm:flex-1">
              <select
                className={selectClass}
                value={location}
                onChange={(e) => onLocationChange?.(e.target.value)}
                aria-label="Filter by location"
              >
                <option value="" className="bg-gray-900 text-white">
                  All locations
                </option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc} className="bg-gray-900 text-white">
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
