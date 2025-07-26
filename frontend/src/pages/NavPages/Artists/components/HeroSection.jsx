import React, { useState, useEffect, useRef } from "react";
import searchIc from "/assets/images/artists/searchIc.svg";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../../../conf/axios";

const HeroSection = ({ onSearchResults }) => {
  const [inputName, setInputName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      onSearchResults([]); // Clear search results in parent
      return;
    }

    setLoading(true);
    try {
      const response = await axiosApi.get(`/artists/search?q=${query}`);
      setSearchResults(response.data.data);
      onSearchResults(response.data.data); // Send search results to parent
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArtist = (artist) => {
    navigate(`/artists/${artist.id}`);
    setIsDropdownOpen(false);
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputName) {
        handleSearch(inputName);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [inputName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative sm:min-h-[70vh] min-h-[40vh] w-full flex flex-col items-center justify-center text-white pt-[100px] sm:pt-[140px]">

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10" />
      <div className="absolute inset-0 bg-[url('/assets/images/artists/artistHeroBg.png')] bg-cover bg-center" style={{ backgroundBlendMode: "overlay" }} aria-label="Artists EPK" />
      <div className="relative z-20 max-w-5xl w-full text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-bold">
          FIND YOUR <span className="text-[#5DC9DE]">COLLABORATOR</span>
        </h1>
        <p className="text-gray-300 px-4 sm:text-base lg:text-lg">No need to look anywhere else—every music artist you seek is right here.</p>

        <div className="flex justify-center mt-8 relative" ref={searchContainerRef}>
          <div className="relative flex w-[90%] sm:w-[600px] bg-gray-100/20 rounded-full backdrop-blur-sm py-2">
            <input
              type="text"
              placeholder="Search Artists..."
              value={inputName}
              className="flex-1 px-6 py-3 bg-transparent text-white placeholder-gray-300 focus:outline-none"
              onChange={(e) => setInputName(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
            />
            <button
  className="px-4 sm:px-8 py-3 bg-[#5DC9DE] hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors ml-2 mr-2 min-w-[44px]"
  onClick={() => handleSearch(inputName)}
>
  <img
    src={searchIc}
    alt="Search Icon"
    className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
  />
  <span className="ml-2 text-gray-800 font-medium hidden sm:block">Search</span>
</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
