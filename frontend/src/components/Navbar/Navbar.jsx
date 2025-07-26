import { Search, Bell, AlignJustify, Menu } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchContent } from "./content";
import { IoBookOutline } from "react-icons/io5";


export default function Navbar({ onMenuClick }) {
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const countNoti = useSelector((state) => state.notification.countNewNotifications);
  const currentPage = useLocation().pathname;

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 1) {
      try {
        const results = await searchContent(query);
        setSearchResults(results.data);
        setShowDropdown(true);
      }
      catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <nav className="px-4 lg:px-8 py-2">
      <div className="flex items-center justify-between gap-4">
        {/* Hamburger Menu - Only shows on mobile */}
        <button
          className="lg:hidden p-2 text-gray-300"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </button>
        {currentPage !== "/dashboard/learnings" && (
          <div className="flex-1 max-w-2xl  relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full bg-gray-800/50 text-gray-300 pl-10 pr-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-gray-600 placeholder-gray-500"
            />
            {showDropdown && (
              <div className="absolute mt-2 w-full bg-gray-800 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        window.open(`${import.meta.env.VITE_WEBSITE_URL}content/${result.id}`, '_blank');
                        setShowDropdown(false);
                      }}

                    >
                      <div className="flex justify-between items-center gap-2">

                        <div className="flex flex-col items-start gap-2">
                          <div className="text-sm text-cyan-400">{result.artist_name}</div>
                          <div className="text-sm text-gray-400">{result.name}</div>
                        </div>
                        <div className="text-sm text-gray-400">{result.total_views} Views {'->'}</div>
                      </div>
                    </div>

                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">No results found</div>
                )}
              </div>
            )}
          </div>
        )}


        <div className="flex items-center gap-3">
          {userData ? (
            <>
              <Link to={'/dashboard/learnings'}>
                <button className="p-2  bg-gray-800 z-50 rounded-full hover:bg-gray-700 transition-colors">
                  {/* <AlignJustify className="w-5 h-5 text-gray-300" /> */}
                  <svg width="25" height="25" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="68" height="68" rx="34" fill="url(#paint0_linear_91_2845)" fillOpacity="0.2" />
                    <rect x="1" y="1" width="20" height="20" rx="33" stroke="url(#paint1_linear_91_2845)" strokeOpacity="0.2" strokeWidth="2" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M28.4133 20.668H39.588C43.7067 20.668 46 23.0413 46 27.108V40.8813C46 45.0146 43.7067 47.3346 39.588 47.3346H28.4133C24.36 47.3346 22 45.0146 22 40.8813V27.108C22 23.0413 24.36 20.668 28.4133 20.668ZM28.7737 26.8818V26.8685H32.7591C33.3337 26.8685 33.8004 27.3352 33.8004 27.9072C33.8004 28.4952 33.3337 28.9618 32.7591 28.9618H28.7737C28.1991 28.9618 27.7337 28.4952 27.7337 27.9218C27.7337 27.3485 28.1991 26.8818 28.7737 26.8818ZM28.7737 34.9889H39.2271C39.8004 34.9889 40.2671 34.5222 40.2671 33.9489C40.2671 33.3756 39.8004 32.9076 39.2271 32.9076H28.7737C28.1991 32.9076 27.7337 33.3756 27.7337 33.9489C27.7337 34.5222 28.1991 34.9889 28.7737 34.9889ZM28.7739 41.0817H39.2273C39.7593 41.0284 40.1606 40.5737 40.1606 40.0417C40.1606 39.4951 39.7593 39.0417 39.2273 38.9884H28.7739C28.3739 38.9484 27.9873 39.1351 27.7739 39.4817C27.5606 39.8151 27.5606 40.2551 27.7739 40.6017C27.9873 40.9351 28.3739 41.1351 28.7739 41.0817Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_91_2845" x1="34" y1="0" x2="34" y2="68" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_91_2845" x1="34" y1="0" x2="34" y2="68" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                </button>
              </Link>
              <Link className="z-20" to={'/dashboard/notifications'}>
                <button className="p-2 relative bg-gray-800 z-20 rounded-full hover:bg-gray-700 transition-colors">
                  <svg width="25" height="25" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="68" height="68" rx="34" fill="url(#paint0_linear_91_2848)" fillOpacity="0.2" />
                    <rect x="1" y="1" width="66" height="66" rx="33" stroke="url(#paint1_linear_91_2848)" strokeOpacity="0.2" strokeWidth="2" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M42.9441 29.7297C42.9441 31.4043 43.3867 32.3913 44.3607 33.5288C45.0988 34.3667 45.3346 35.4424 45.3346 36.6093C45.3346 37.775 44.9517 38.8815 44.1844 39.7799C43.1799 40.8569 41.7634 41.5444 40.3176 41.6639C38.2226 41.8425 36.1262 41.9929 34.002 41.9929C31.8764 41.9929 29.7814 41.903 27.6863 41.6639C26.2392 41.5444 24.8227 40.8569 23.8195 39.7799C23.0523 38.8815 22.668 37.775 22.668 36.6093C22.668 35.4424 22.9052 34.3667 23.642 33.5288C24.6464 32.3913 25.0599 31.4043 25.0599 29.7297V29.1617C25.0599 26.9191 25.6191 25.4527 26.7706 24.0171C28.4827 21.9236 31.2271 20.668 33.9423 20.668H34.0616C36.8351 20.668 39.6683 21.984 41.3512 24.1675C42.4432 25.5735 42.9441 26.9782 42.9441 29.1617V29.7297ZM30.1003 44.7489C30.1003 44.0774 30.7165 43.7699 31.2863 43.6383C31.9528 43.4973 36.0144 43.4973 36.6809 43.6383C37.2508 43.7699 37.867 44.0774 37.867 44.7489C37.8338 45.3881 37.4588 45.9548 36.9407 46.3147C36.2688 46.8384 35.4804 47.1701 34.6561 47.2896C34.2003 47.3487 33.7524 47.35 33.3124 47.2896C32.4869 47.1701 31.6984 46.8384 31.0279 46.3133C30.5084 45.9548 30.1334 45.3881 30.1003 44.7489Z" fill="white" />
                    <defs>
                      <linearGradient id="paint0_linear_91_2848" x1="34" y1="0" x2="34" y2="68" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="paint1_linear_91_2848" x1="34" y1="0" x2="34" y2="68" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {countNoti != 0 && (
                    <p className="absolute w-[10px] h-[10px] right-0 top-0 bg-red-400 p-1 rounded-[50%]"></p>
                  )}
                </button>
              </Link>
              <button className="w-9 h-9 lg:w-10 lg:h-10 z-20 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-600 transition-colors">
                <div>
                  <Link to={'/dashboard/profile'}>
                    <FaRegUserCircle className="w-8 h-8 lg:w-9 lg:h-9" />
                  </Link>
                </div>
              </button>
            </>
          ) : (
            <div className="hidden lg:flex space-x-4">
              <button
                className="px-4 z-50 py-2 text-primary font-bold uppercase"
                onClick={() => navigate("/auth/signin")}
              >
                Login
              </button>
              <button
                className="px-4 z-50 py-2 bg-primary text-[#181B24] font-bold uppercase rounded-full"
                onClick={() => navigate("/auth/signup")}
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