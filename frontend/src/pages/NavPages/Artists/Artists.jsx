import React, { useEffect, useState } from "react";
import HeroSection from "./components/HeroSection";
import MusicPlayerProfile2 from "./components/MusicPlayerProfile2";
import ArtistSlider from "../Home/components/ArtistSlider/ArtistSlider";
import axiosApi from "../../../conf/axios";
import ArtistRankingTable from "./components/ArtistSeacch";
import { Helmet } from "react-helmet";
function Artists() {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);

  const fetchAllArtists = async () => {
    setIsLoading(true);
    try {
      const response = await axiosApi.get("/artists/search");
      setArtists(response.data.data);
    } catch (err) {
      setError("Failed to fetch Artists");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllArtists();
  }, []);

  const formatListeners = (number) => {
    const parsed = Number(number);
    return isNaN(parsed) ? "0" : parsed.toLocaleString();
  };

  return (
    <>
    <Helmet>
        <title>Music Collaboration Network Free Platform - Connect Best Artists</title>
        <meta name="description" content="Explore top listeners, music artists epk, and collaborate with independent musicians. OPH Community—a music networking platform makes it simple and direct." />
      </Helmet>
      {isLoading && (
        <div className="text-center h-[90vh] w-full py-32">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-[#5DC9DE] mx-auto"></div>
          <p className="mt-2 text-[#5DC9DE]">🎶 "Tuning the strings... your music is on its way!" 🎵</p>
        </div>
      )}
      {error && (
        <div className="text-center flex flex-col justify-center items-center h-[80vh] w-full ">
          <h1 className="text-3xl text-red-500">{error}</h1>
        </div>
      )}
      {!isLoading && !error && (
        <div>
          {/* HeroSection will handle search */}
          <HeroSection onSearchResults={setSearchResults} />

          {/* Display search results table like Leaderboard */}
          {searchResults.length > 0 && (
            <ArtistRankingTable title="Search Results" data={searchResults} />
          )}

          <div className="lg:px-10 px-6 xl:px-16">
            <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
          </div>

          <MusicPlayerProfile2 />

          <div className="lg:px-10 px-6 xl:px-16">
            <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
          </div>

          <ArtistSlider />
        </div>
      )}
    </>
  );
}

export default Artists;
