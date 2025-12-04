import React, { createContext, useEffect, useState } from "react";
export const NavbarContext = createContext();
import logo from "/logo.svg";
import { Link, useNavigate } from "react-router-dom";
import { useArtist } from "../pages/auth/API/ArtistContext";

function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const { headers, logout, login } = useArtist();
  const [reload, setReload] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const openSignup = () => setShowSignup(true);
  const closeSignup = () => setShowSignup(false);

  // Helper function to navigate - redirects to origin domain if on .org
  const navigateWithOrigin = (path) => {
    const originDomain = localStorage.getItem('oph_origin_domain');
    if (originDomain && window.location.hostname.includes('ophcommunity.org')) {
      const protocol = window.location.protocol;
      window.location.href = `${protocol}//${originDomain}${path}`;
    } else {
      navigate(path);
    }
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
          {verified ? (
            <button
              className="px-4 py-2 text-red-500 font-bold uppercase"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <div>
              <button 
                className="px-4 py-2 text-primary font-bold uppercase"
                onClick={() => {
                  const hostname = window.location.hostname;
                  const pathname = window.location.pathname;
                  
                  // Store origin domain before redirecting
                  if (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in')) {
                    try {
                      localStorage.setItem('oph_origin_domain', hostname);
                      // Store current path (if not already an auth route)
                      if (!pathname.startsWith('/auth')) {
                        localStorage.setItem('oph_origin_path', pathname);
                      }
                    } catch (e) {
                      console.warn('Could not store origin domain:', e);
                    }
                  }
                  
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/login");
                  } else {
                    window.location.href = "https://ophcommunity.org/auth/login";
                  }
                }}
              >
                Login
              </button>
              <button 
                className="px-4 py-2 bg-primary text-[#181B24] font-bold uppercase rounded-full"
                onClick={() => {
                  const hostname = window.location.hostname;
                  const pathname = window.location.pathname;
                  
                  // Store origin domain before redirecting
                  if (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in')) {
                    try {
                      localStorage.setItem('oph_origin_domain', hostname);
                      // Store current path (if not already an auth route)
                      if (!pathname.startsWith('/auth')) {
                        localStorage.setItem('oph_origin_path', pathname);
                      }
                    } catch (e) {
                      console.warn('Could not store origin domain:', e);
                    }
                  }
                  
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/signup");
                  } else {
                    window.location.href = "https://ophcommunity.org/auth/signup";
                  }
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center">
          <button
            className="text-cyan-400 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
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
          {verified ? (
            <button
              className="w-full text-red-500 font-bold uppercase"
              onClick={logout}
            >
              Logout
            </button>
          ) : (
            <div className="flex flex-col space-y-2">
              <button 
                className="w-full text-primary font-bold uppercase"
                onClick={() => {
                  const hostname = window.location.hostname;
                  const pathname = window.location.pathname;
                  
                  // Store origin domain before redirecting
                  if (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in')) {
                    try {
                      localStorage.setItem('oph_origin_domain', hostname);
                      // Store current path (if not already an auth route)
                      if (!pathname.startsWith('/auth')) {
                        localStorage.setItem('oph_origin_path', pathname);
                      }
                    } catch (e) {
                      console.warn('Could not store origin domain:', e);
                    }
                  }
                  
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/login");
                  } else {
                    window.location.href = "https://ophcommunity.org/auth/login";
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
                  const pathname = window.location.pathname;
                  
                  // Store origin domain before redirecting
                  if (hostname.includes('ophcommunity.com') || hostname.includes('ophcommunity.in')) {
                    try {
                      localStorage.setItem('oph_origin_domain', hostname);
                      // Store current path (if not already an auth route)
                      if (!pathname.startsWith('/auth')) {
                        localStorage.setItem('oph_origin_path', pathname);
                      }
                    } catch (e) {
                      console.warn('Could not store origin domain:', e);
                    }
                  }
                  
                  if (hostname.includes('ophcommunity.org')) {
                    navigate("/auth/signup");
                  } else {
                    window.location.href = "https://ophcommunity.org/auth/signup";
                  }
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
