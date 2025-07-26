import React, { useState, useEffect } from "react";
import searchIc from "/assets/images/artists/searchIc.svg";
import filters from "/assets/images/filters.png";

const HeroSection = ({ handleSearch, setArtistExists, artistExists, handleFilter }) => {
  const [input, setInput] = useState("");
  const [showNoFound, setShowNoFound] = useState(false);

  useEffect(() => {
    if (!artistExists) {
      setShowNoFound(true);
      const timer = setTimeout(() => {
        setShowNoFound(false);
        setArtistExists(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [artistExists]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch(input);
  };

  return (
    <div className="relative sm:min-h-[70vh] w-full flex flex-col items-center justify-center text-white p-8 pt-20 md:pt-0">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-[url('/assets/images/leaderboard.png')] bg-cover bg-center"
        style={{
          backgroundBlendMode: "overlay",
        }}
        aria-label="Artists Websites"
      />

      {/* Content */}
      <div className="relative z-20 max-w-3xl w-full mt-10 text-center space-y-6">
        <h1 className="text-3xl lg:text-5xl font-bold uppercase">
          Who ranks<span className="text-cyan-400"> top Today</span>
        </h1>

        <h2 className="text-gray-300 text-lg">
          Easily find and explore artists ranked on the leaderboard.
        </h2>

        {/* Search bar */}
        <div className="flex justify-center mt-8">
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center w-[300px] sm:w-[450px] md:w-[600px] bg-gray-100/20 rounded-full backdrop-blur-sm py-2 px-2"
          >
            <input
              type="text"
              placeholder="Search Artists..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleSearch(e.target.value);
              }}
              className="flex-1 px-4 py-3 bg-transparent text-white placeholder-gray-300 focus:outline-none"
            />

            <button
              type="button"
              className="flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors rounded-full w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
              onClick={handleFilter}
            >
              <img
                src={filters}
                alt="Filter Icon"
                className="w-10 h-10 sm:w-6 sm:h-6 md:w-10 md:h-10 object-contain"
              />
            </button>
          </form>
        </div>

        {/* No Found message */}
        <div className="h-6 mt-4">
          {artistExists.length === 0 && input.trim() !== "" && (
            <div className="text-red-500 transition-opacity duration-500">
              This Artist has not been Ranked.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
