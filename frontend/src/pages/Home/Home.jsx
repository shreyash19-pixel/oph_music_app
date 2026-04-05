import HeroSection from "./components/HeroSection/HeroSection";
import EventsNewReleases from "./components/EventsNewReleases/EventsNewReleases";
import ArtistRankingSection from "./components/ArtistRankingSection/ArtistRankingSection";
import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import { isRegistrationOpen } from "../../utils/date";
import { useArtist } from "../auth/API/ArtistContext";
import NavbarRight from "../../components/Navbar/NavbarRight";

function Home() {
  const artistsdata = {};
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingSong, setUpcomingSong] = useState([]);
  const [upcomingEventHero, setUpcomingEventHero] = useState(false);
  const [upcomingEventNewReleases, setUpcomingEventNewReleases] = useState(false);
  const [artistBookEvents, setArtistBookEvents] = useState([]);
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
        params: { ophid },
      });

      if (response.data.success) {
        const d = response.data.data;
        setUpcomingSong(
          Array.isArray(d) ? d : d != null && d !== "" ? [d] : [],
        );
      } else {
        setUpcomingSong([]);
      }
    } catch (err) {
      console.log(err);
      setError("Failed to Load Data. Try Again Later");
      setUpcomingSong([]);
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

      if (response.data.success && Array.isArray(response.data.data)) {
        const now = new Date();
        const events = response.data.data;
        // Only future events — otherwise sort position [1] is a past event, not "2nd upcoming"
        const upcomingSorted = [...events]
          .filter((e) => new Date(e.dateTime || 0) > now)
          .sort((a, b) => {
            const dateA = new Date(a.dateTime || 0);
            const dateB = new Date(b.dateTime || 0);
            return dateA - dateB; // soonest upcoming first
          });
        // Only events whose registration window is active (IST day bounds, same as HeroSection buttons)
        const registrationOpenSorted = upcomingSorted.filter(isRegistrationOpen);
        const heroEvent = registrationOpenSorted[0] || false;
        const secondSlotEvent =
          registrationOpenSorted.length >= 2
            ? registrationOpenSorted[1]
            : registrationOpenSorted[0] || false;
        setUpcomingEventHero(heroEvent);
        setUpcomingEventNewReleases(secondSlotEvent);
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

  useEffect(() => {
    if (!ophid || !headers?.Authorization) return;
    const fetchArtistBookEvents = async () => {
      try {
        const response = await axiosApi.get(`/event_part/${ophid}`, { headers });
        const data = response.data;
        const normalized = Array.isArray(data) ? data : data ? [data] : [];
        setArtistBookEvents(normalized);
      } catch (err) {
        console.error("Error fetching event participations:", err);
        setArtistBookEvents([]);
      }
    };
    fetchArtistBookEvents();
  }, [ophid, headers]);

  return (
    <div>
      {/* ✅ Navbar placed at the top */}
      <div className="flex justify-end items-center p-4">
        <NavbarRight />
      </div>

      {/* ✅ Page content */}
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
      {!isLoading && !error && (
        <>
          <HeroSection
            upcomingSong={
              Array.isArray(upcomingSong)
                ? upcomingSong
                : upcomingSong != null && upcomingSong !== ""
                  ? [upcomingSong]
                  : []
            }
            upcomingEvent={upcomingEventHero}
            artistBookEvents={artistBookEvents}
          />
          <EventsNewReleases
            upcomingEvent={upcomingEventNewReleases}
            artistBookEvents={artistBookEvents}
          />
          <ArtistRankingSection data={artistsdata} selectedMonth={"January"} />
        </>
      )}
    </div>
  );
}

export default Home;
