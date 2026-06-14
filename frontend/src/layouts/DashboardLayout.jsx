import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchAPI } from "../slice/test";
import { fetchBlockedDates } from "../slice/blockedDate";
import {
  fetchContentTypes,
  fetchPaymentPlans,
} from "../slice/song_registration";
import { fetchLeaderboard, fetchNewRelease } from "../slice/newRelease";
import { fetchTicketCategories } from "../slice/ticket";
import { getProfile } from "../slice/profile";
import { fetchNotifications } from "../slice/notification";
import { fetchIncome } from "../slice/income";
import { useArtist } from "../pages/auth/API/ArtistContext";
import React from "react";

const ArtistLayout = () => {
  const { headers } = useArtist();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const [contents, setContents] = useState([]);
  const [showNav, setShowNav] = useState(false);

  // Add effect to handle body scrolling
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    // dispatch(fetchBlockedDates());
    // dispatch(fetchContentTypes());
    // dispatch(fetchPaymentPlans());
    dispatch(fetchNewRelease(headers));
    dispatch(fetchLeaderboard(headers));
    // dispatch(fetchTicketCategories());
    // dispatch(getProfile());
    // dispatch(fetchNotifications());
    // dispatch(fetchIncome(headers));
  }, [headers]);

  return (
    <div className="flex relative">
      <div className="fixed -top-10 right-0 w-[400px] h-[400px] -z-10">
        <img
          src="/assets/images/purpleEclipse.png"
          alt="purple eclipse"
          className="w-full h-full object-contain object-bottom z-0"
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 bg-transparent z-50 transition-transform duration-300 overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          contents={contents}
          setContents={setContents}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Backdrop - only shows when mobile sidebar is open */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[300px] md:relative">
        <Sidebar
          contents={contents}
          setContents={setContents}
          showNav={showNav}
          setShowNav={setShowNav}
        />
      </div>

      {/* Mobile Sidebar */}
      {showNav && (
        <div className="lg:hidden w-[300px] md:relative">
          <Sidebar
            contents={contents}
            setContents={setContents}
            showNav={showNav}
            setShowNav={setShowNav}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* <Navbar onMenuClick={() => setIsSidebarOpen(true)} /> */}
        <main>
          <Outlet context={{ contents, setContents, showNav, setShowNav }} />
        </main>
      </div>
    </div>
  );
};
export default ArtistLayout;
