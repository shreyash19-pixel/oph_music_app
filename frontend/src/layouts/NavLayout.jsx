import React from "react";
import { Outlet } from "react-router-dom";
import WebsiteNavbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchSuccessStories, fetchWebsiteConfig } from "../slice/website_config";
import { fetchArtists } from "../slice/artist";
import { fetchTopPicks } from "../slice/top_pick";
import { fetchEvents } from "../slice/event";
import { fetchReels } from "../slice/content";
import { fetchHistoryLeaderboard } from "../slice/leaderboard";

const NavLayout = ({ children }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchWebsiteConfig());
    dispatch(fetchArtists());
    dispatch(fetchTopPicks());
    dispatch(fetchEvents());
    dispatch(fetchReels());
    dispatch(fetchHistoryLeaderboard());
    dispatch(fetchSuccessStories());
  }, [dispatch]);
  return (
    <div>
      <WebsiteNavbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default NavLayout;
