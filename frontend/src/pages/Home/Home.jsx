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
  const [upcomingSong, setUpcomingSong] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState(false);
  const [error, setError] = useState(null);
  const { headers, ophid } = useArtist();

  const fetchUpcomingSong = async () => {
    if (!headers || !headers.Authorization) {
      console.warn("Headers not ready yet");
      return;
    }
    try {
      const response = await axiosApi.get("/get-upcoming-event", {
        headers: headers,
        params: {ophid}
      });

      if (response.data.success) {
        setUpcomingSong(response.data.data);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to Load Data. Try Again Later");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingEvent = async () => {
    setIsLoading(true);

    if (!headers || !headers.Authorization) {
      console.warn("Headers are not ready yet");
      return;
    }

    try {
      const response = await axiosApi.get("/events", {
        headers: headers,
      });

      if (response.data.success) {
        setUpcomingEvent(response.data.data[0]);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to Load Data. Try Again Later");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvent();
  }, [headers]);

  useEffect(() => {
    if (ophid) {
      fetchUpcomingSong();
    }
  }, [headers, ophid]);

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
      {!isLoading && !error && upcomingSong && (
        <>
          <HeroSection
            upcomingSong={upcomingSong}
            upcomingEvent={upcomingEvent}
          />
          <EventsNewReleases upcomingEvent={upcomingEvent} />
          <ArtistRankingSection data={artistsdata} selectedMonth={"January"} />
        </>
      )}
    </div>
  );
}

export default Home;
