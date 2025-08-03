import HeroSection from "./components/HeroSection/HeroSection";
import EventsNewReleases from "./components/EventsNewReleases/EventsNewReleases";
import ArtistRankingSection from "./components/ArtistRankingSection/ArtistRankingSection";
import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import getToken from "../../utils/getToken";
import { useArtist } from "../auth/API/ArtistContext";

function Home() {
  const artistsdata = {};
  const [isLoading, setIsLoading] = useState(true);
  const [firstEvent, setFirstEvent] = useState([]);
  const [secondEvent, setSecondEvent] = useState(false);
  const [error, setError] = useState(null);
  const {headers} = useArtist()

  const fetchFirstEvent = async () => {
    setIsLoading(true);

    if(!headers || !headers.Authorization)
    {
      console.warn("Headers are not ready yet")
      return
    }

    try {
      const response = await axiosApi.get("/events", {
        headers: headers,
      });
      console.log(response);
      
      if (response.data.success) {
        setFirstEvent(response.data.data[0]);
        setSecondEvent(response.data.data[1]);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to Load Data. Try Again Later");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFirstEvent();
  }, [headers]);

  return (
    <div>
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-2 text-cyan-400">Loading data...</p>
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
      {!isLoading && !error && firstEvent && (
        <>
          <HeroSection firstEvent={firstEvent} />
          <EventsNewReleases secondEvent={secondEvent} />
          <ArtistRankingSection data={artistsdata} selectedMonth={"January"} />
        </>
      )}
    </div>
  );
}

export default Home;
