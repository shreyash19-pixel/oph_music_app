import React, { createContext, useEffect, useState } from "react";
export const NavbarContext = createContext();
import logo from "/logo.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useArtist } from "../pages/auth/API/ArtistContext";

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const { headers, logout, login } = useArtist();

  const isPaymentPage =
    pathname === "/payment" ||
    pathname === "/auth/payment" ||
    pathname === "/dashboard/payment" ||
    pathname === "/song-payment" ||
    pathname.endsWith("/payment");
  const [reload, setReload] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const openSignup = () => setShowSignup(true);
  const closeSignup = () => setShowSignup(false);

  // Helper to read origin domain from cookie set by nginx / index.html
  const getOriginDomainFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("oph_origin_domain="));
    if (!match) return null;
    return match.split("=")[1] || null;
  };

  // Helper function to navigate - on .org, sends to origin (or .com by default)
  const navigateWithOrigin = (path) => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    if (hostname.includes("ophcommunity.org")) {
      // If user has an origin cookie (came from .com or .in), go back there.
      // Otherwise, default to .com for normal nav from .org.
      const originDomain = getOriginDomainFromCookie();
      // Normalize domain (remove www. if present)
      const targetDomain = originDomain ? originDomain.replace(/^www\./, '') : "ophcommunity.com";
      console.log('[Navbar] Navigating with origin:', { originDomain, targetDomain, path });
      window.location.href = `${protocol}//${targetDomain}${path}`;
      return;
    }

    // On .com / .in or any other domain, use client-side navigation
    navigate(path);
  };

  useEffect(() => {
    if (!headers || !headers.Authorization) {
      setVerified(false);
    } else {
      setVerified(true);
    }
  }, [useArtist, login]);

  return (
    <nav className="absolute w-full top-0 left-0 z-[99999]">
      <div className="container mx-auto px-4 lg:px-6 xl:px-16 pt-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold text-gray-800">
          <a href={import.meta.env.VITE_WEBSITE_URL}>
            <img src={logo} alt="Logo" className="w-16" />
          </a>
        </div>

        {/* Desktop Nav Links */}
        <ul className="hidden lg:flex space-x-12 text-cyan-400">
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/home")}
          >
            Home
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/events/online-music-events")}
          >
            Events
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/find-your-collaborator")}
          >
            Artists
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/leaderboard/top-music-networking-platform-for-creators/")}
          >
            Leaderboard
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/resources/music-learning-education")}
          >
            Resources
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/contact")}
          >
            Contact
          </li>
        </ul>

        {/* Desktop Login/Signup Buttons */}
        <div className="hidden lg:flex space-x-4">
          {verified && !isPaymentPage ? (
            <button
              className="px-4 py-2 text-red-500 font-bold uppercase"
              onClick={logout}
            >
              Logout
            </button>
          ) : !verified ? (
            <div>
              <button 
                className="px-4 py-2 text-primary font-bold uppercase"
                onClick={() => {
                  const hostname = window.location.hostname;
                  
                  // For .org, stay on .org and use SPA navigation
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/login");
                  } else {
                    // For .com / .in, hit local /auth/login so nginx can
                    // redirect to .org with ?origin= and set the cookie.
                    window.location.href = "/auth/login";
                  }
                }}
              >
                Login
              </button>
              <button 
                className="px-4 py-2 bg-primary text-[#181B24] font-bold uppercase rounded-full"
                onClick={() => {
                  const hostname = window.location.hostname;

                  // For .org, stay on .org and use SPA navigation
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/signup");
                  } else {
                    // For .com / .in, hit local /auth/signup so nginx can
                    // redirect to .org with ?origin= and set the cookie.
                    window.location.href = "/auth/signup";
                  }
                }}
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile Login/Signup Buttons */}
        <div className="lg:hidden flex items-center space-x-2">
          {verified && !isPaymentPage ? (
            <button
              className="px-3 py-1.5 text-red-500 font-bold uppercase text-xs"
              onClick={logout}
            >
              Logout
            </button>
          ) : !verified ? (
            <div className="flex items-center space-x-2">
              <button 
                className="px-3 py-1.5 text-primary font-bold uppercase text-xs"
                onClick={() => {
                  const hostname = window.location.hostname;
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/login");
                  } else {
                    window.location.href = "/auth/login";
                  }
                }}
              >
                Login
              </button>
              <button 
                className="px-4 py-1.5 bg-primary text-[#181B24] font-bold uppercase text-xs rounded-full"
                onClick={() => {
                  const hostname = window.location.hostname;
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/signup");
                  } else {
                    window.location.href = "/auth/signup";
                  }
                }}
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Menu Sidebar */}
      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 !w-40 text-cyan-400 transition-transform duration-300 transform ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } !w-1/2 max-w-[300px] overflow-y-auto`} // Ensures max width for better UI on larger screens
      >
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-lg font-bold">Menu</h2>
          <button
            className="text-gray-400 hover:text-cyan-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <ul className="flex flex-col space-y-4 p-4">
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/home")}
          >
            Home
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/events/online-music-events")}
          >
            Events
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/find-your-collaborator")}
          >
            Artists
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/leaderboard/top-music-networking-platform-for-creators/")}
          >
            Leaderboard
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/resources/music-learning-education")}
          >
            Resources
          </li>
          <li
            className="font-semibold uppercase hover:text-[#22D3EE] hover:cursor-pointer"
            onClick={() => navigateWithOrigin("/contact")}
          >
            Contact
          </li>
        </ul>

        {/* Keep Logout Always Visible at Bottom */}
        <div className="absolute bottom-4 left-0 px-4 w-full border-t border-gray-700">
          {verified && !isPaymentPage ? (
            <button
              className="w-full text-red-500 font-bold uppercase"
              onClick={logout}
            >
              Logout
            </button>
          ) : !verified ? (
            <div className="flex flex-col space-y-2">
              <button 
                className="w-full text-primary font-bold uppercase"
                onClick={() => {
                  const hostname = window.location.hostname;

                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/login");
                  } else {
                    window.location.href = "/auth/login";
                  }
                }}
              >
                Login
              </button>
              <button
                id="signup-btn"
                className="px-4 py-2 bg-primary text-[#181B24] font-bold uppercase rounded-full"
                onClick={() => {
                  const hostname = window.location.hostname;

                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/signup");
                  } else {
                    window.location.href = "/auth/signup";
                  }
                }}
              >
                Sign Up
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
