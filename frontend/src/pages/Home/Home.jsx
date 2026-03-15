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

      if (response.data.success && Array.isArray(response.data.data)) {
        const events = response.data.data;
        const sorted = [...events].sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || 0);
          const dateB = new Date(b.created_at || b.createdAt || 0);
          return dateB - dateA; // newest first by created_at
        });
        // HeroSection: prefer event with registration open, else first (previous logic)
        const withActiveReg = sorted.find(isRegistrationOpen);
        setUpcomingEventHero(withActiveReg || sorted[0] || false);
        // EventsNewReleases: show second event (by created_at) when 2+; else first
        setUpcomingEventNewReleases(sorted.length >= 2 ? sorted[1] : sorted[0] || false);
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
      {/* ✅ Navbar placed at the top */}
      <div className="flex justify-end items-center p-4">
        <NavbarRight
          profileImage="/images/profile.png" // replace with your image path
          onDocsClick={() => console.log("Docs clicked")}
          onBellClick={() => console.log("Notifications clicked")}
          onProfileClick={() => console.log("Profile clicked")}
        />
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
      {!isLoading && !error && upcomingSong && (
        <>
          <HeroSection
            upcomingSong={upcomingSong}
            upcomingEvent={upcomingEventHero}
          />
          <EventsNewReleases upcomingEvent={upcomingEventNewReleases} />
          <ArtistRankingSection data={artistsdata} selectedMonth={"January"} />
        </>
      )}
    </div>
  );
}

export default Home;
