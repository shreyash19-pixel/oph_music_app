import React, { useCallback, useEffect, useState } from "react";
import HeroSection from "./components/HeroSection";
import MusicPlayerProfile2 from "./components/MusicPlayerProfile2";
import ArtistSlider from "../Home/components/ArtistSlider/ArtistSlider";
import axiosApi from "../../../conf/axios";
import ArtistRankingTable from "./components/ArtistSeacch";
import { Helmet } from "react-helmet";

const SEARCH_PER_PAGE = 10;

function Artists() {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProfession, setFilterProfession] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [professionOptions, setProfessionOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [artistSliderProfileOpen, setArtistSliderProfileOpen] = useState(false);
  const [spotlightOphIds, setSpotlightOphIds] = useState([]);

  const handleSearchQueryChange = useCallback((q) => {
    setSearchQuery(q);
    setSearchPage(1);
  }, []);

  const handleProfessionChange = useCallback((value) => {
    setFilterProfession(value);
    setSearchPage(1);
  }, []);

  const handleLocationChange = useCallback((value) => {
    setFilterLocation(value);
    setSearchPage(1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosApi.get("/artist-search-filters");
        if (cancelled) return;
        const data = res.data?.data;
        setProfessionOptions(
          Array.isArray(data?.professions) ? data.professions : [],
        );
        setLocationOptions(
          Array.isArray(data?.locations) ? data.locations : [],
        );
      } catch (err) {
        console.warn("Artist filter options failed:", err?.response?.data ?? err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const hasSearchOrFilters =
    Boolean(searchQuery.trim()) ||
    Boolean(filterProfession) ||
    Boolean(filterLocation);

  useEffect(() => {
    if (!hasSearchOrFilters) {
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(0);
      setSearchLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setSearchLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (filterProfession) {
          params.set("profession", filterProfession);
        }
        if (filterLocation) {
          params.set("location", filterLocation);
        }
        params.set("page", String(searchPage));
        params.set("per_page", String(SEARCH_PER_PAGE));

        const res = await axiosApi.get(
          `/get-top-searched-artist?${params.toString()}`,
        );
        if (cancelled) return;
        const body = res.data;
        const tp = Number(body.totalPages) || 0;
        const list = body.data;
        setSearchResults(Array.isArray(list) ? list : []);
        setSearchTotal(Number(body.total) || 0);
        setSearchTotalPages(tp);
        if (tp > 0 && searchPage > tp) {
          setSearchPage(tp);
        }
      } catch (err) {
        console.error("Artist search failed:", err?.response?.data ?? err);
        if (!cancelled) {
          setSearchResults([]);
          setSearchTotal(0);
          setSearchTotalPages(0);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    searchQuery,
    searchPage,
    filterProfession,
    filterLocation,
    hasSearchOrFilters,
  ]);

  // const fetchAllArtists = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axiosApi.get("/artists/search");
  //     setArtists(response.data.data);
  //   } catch (err) {
  //     setError("Failed to fetch Artists");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllArtists();
  // }, []);

  // const formatListeners = (number) => {
  //   const parsed = Number(number);
  //   return isNaN(parsed) ? "0" : parsed.toLocaleString();
  // };

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
          <HeroSection
            onSearchQueryChange={handleSearchQueryChange}
            profession={filterProfession}
            location={filterLocation}
            professionOptions={professionOptions}
            locationOptions={locationOptions}
            onProfessionChange={handleProfessionChange}
            onLocationChange={handleLocationChange}
          />

          {hasSearchOrFilters ? (
            <ArtistRankingTable
              title="Search Results"
              data={searchResults}
              loading={searchLoading}
              page={searchPage}
              totalPages={searchTotalPages}
              total={searchTotal}
              perPage={SEARCH_PER_PAGE}
              onPageChange={setSearchPage}
            />
          ) : null}

          {!artistSliderProfileOpen ? (
            <>
              <div className="lg:px-10 px-6 xl:px-16">
                <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
              </div>
              <MusicPlayerProfile2
                spotlightArtistLimit={10}
                onSpotlightOphOrder={setSpotlightOphIds}
              />
              <div className="lg:px-10 px-6 xl:px-16">
                <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
              </div>
            </>
          ) : (
            <div className="lg:px-10 px-6 xl:px-16">
              <div className="container w-full h-[1px] mx-auto bg-gray-400 opacity-30 relative"></div>
            </div>
          )}

          <ArtistSlider
            onListedProfileOpenChange={setArtistSliderProfileOpen}
            excludeOphIds={spotlightOphIds}
          />
        </div>
      )}
    </>
  );
}

export default Artists;
