import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useArtist } from "../../pages/auth/API/ArtistContext";
import { TiHome } from "react-icons/ti";

/** Public dir is served at site root; do not import from `public/` (breaks Rollup on Linux). */
const pubImg = (file) => `${import.meta.env.BASE_URL}assets/images/${file}`;
const Elp = pubImg("Ellipse4.png");
const Logo = pubImg("logo.png");
const Calender = pubImg("calender.png");
const EPK = pubImg("my-epk.png");
const SongUp = pubImg("song.png");
const Tv = pubImg("tv.png");
const Spot = pubImg("spotlight.png");
const Anal = pubImg("analytics.png");
const Ticket = pubImg("ticket.png");
const Event = pubImg("event.png");
const Income = pubImg("income.png");
const Key = pubImg("key.png");
const Logout = pubImg("logout.png");
const LockIcon = pubImg("lock.png");
import { X } from "lucide-react";
import axiosApi from "../../conf/axios";

const SidebarNav = ({ onClose, contents, setContents, showNav, setShowNav }) => {
  const navigate = useNavigate();
  const { logout } = useArtist();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false); // State to check if screen width is narrow
  const [data, setData] = useState([]);
  const { ophid, headers } = useArtist();
  const [artistType, setArtistType] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      console.log("[TVPublishing] ophid:", ophid);
      if (!ophid) return;
      try {
        const response = await axiosApi.get(`/TvUser?OPH_ID=${ophid}`);
        console.log("[TVPublishing] API response:", response.data);
        console.log("[TVPublishing] contents array:", response.data.data);
        console.log(
          "[TVPublishing] contents array:",
          response.data.data.length,
        );

        setContents(response.data.data);

        // Filter only Open and Rejected status items
        const availableContents = response.data.data.filter((content) => {
          const status = content.status?.toLowerCase();
          return status === "open" || status === "rejected";
        });

        if (availableContents.length > 0) {
          const first = availableContents[0];
          console.log("[TVPublishing] first item keys:", Object.keys(first));
          console.log("[TVPublishing] first item:", first);
          console.log(
            "[TVPublishing] first.id:",
            first.id,
            "| first.song_id:",
            first.song_id,
            "| first.status:",
            first.status,
          );
          console.log("[TVPublishing] first.reason:", first.reason);
        } else {
          console.warn(
            "[TVPublishing] No Open or Rejected status contents available",
          );
        }
      } catch (error) {
        console.error("[TVPublishing] Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [ophid]);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }

    // Function to check screen size
    const checkMobileScreen = () => {
      setIsMobile(window.innerWidth < 1024); // For example, if the screen width is less than 1024px, consider it mobile
    };

    // Check screen size on load
    checkMobileScreen();

    // Add resize event listener
    window.addEventListener("resize", checkMobileScreen);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkMobileScreen);
    };
  }, []);

  const getArtistType = async () => {
    if (!headers || !headers.Authorization) {
      console.warn("Headers are not ready yet");
      return;
    }
    try {
      const response = await axiosApi.get("/get-artist-type", {
        headers: headers,
        params: { ophid },
      });

      if (response.data.success) {
        setArtistType(response.data.data[0].artist_type);
      }
    } catch (err) {
      // Axios error structure: err.response.data.message
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch artist type";
      console.error("Error fetching artist type:", errorMessage);
    }
  };

  useEffect(() => {
    getArtistType();
  }, [headers, ophid]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged Out Successfully!");
    navigate("/auth/login");
    onClose?.();
  };

  const handleNavigation = (path) => {
    if (path.includes("metadata")) {
      navigate(path, {
        state: {
          songName: data.Song_name,
        },
      });

      return;
    }
    navigate(path);
    onClose?.();
  };

  /** DB may use "Independent Artist"; menu CSV uses "Independent artist" — match case-insensitively. */
  function menuItemMatchesArtistType(menuTypeCsv, userArtistType) {
    const u = (userArtistType || "").trim().toLowerCase();
    if (!u) return false;
    return menuTypeCsv
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .some((t) => t === u);
  }

  const menuItems = [
    {
      icon: <TiHome />,
      label: "Home",
      to: "/dashboard",
      type: "Independent artist, Special artist",
    },
    {
      icon: <img src={EPK} className="w-[24px] h-[24px]" />,
      label: "MY EPK",
      to: "/dashboard/my-epk",
      type: "Special artist",
    },
    {
      icon: <img src={Calender} className="w-[24px] h-[24px]" />,
      label: "Time Calendar",
      to: "/dashboard/time-calendar",
      type: "Independent artist",
    },
    {
      icon: <img src={SongUp} className="w-[24px] h-[24px]" />,
      label: "Songs Registration",
      to: "/dashboard/upload-song",
      type: "Independent artist",
    },
    {
      icon: <img src={Tv} className="w-[24px] h-[24px]" />,
      label: "TV Publishing",
      to: "/dashboard/tv-publishing",
      type: "Independent artist",
      lock: (
        <img
          src={LockIcon}
          className="w-[24px] h-[24px] shrink-0"
          alt=""
          aria-hidden
        />
      ),
    },
    {
      icon: <img src={Spot} className="w-[24px] h-[24px]" />,
      label: "Artist Spotlight",
      to: "/dashboard/artist-spotlight",
      type: "Independent artist",
    },
    {
      icon: <img src={Anal} className="w-[24px] h-[24px]" />,
      label: "Analytics",
      to: "/dashboard/analytics",
      type: "Independent artist",
    },
    {
      icon: <img src={Ticket} className="w-[24px] h-[24px]" />,
      label: "Request Ticket",
      to: "/dashboard/request-ticket",
      type: "Independent artist, Special artist",
    },
    {
      icon: <img src={Event} className="w-[24px] h-[24px]" />,
      label: "Events",
      to: "/dashboard/events",
      type: "Independent artist, Special artist",
    },
    {
      icon: <img src={Income} className="w-[24px] h-[24px]" />,
      label: "Income",
      to: "/dashboard/income",
      type: "Independent artist, Special artist",
    },
    {
      icon: <img src={Key} className="w-[24px] h-[24px]" />,
      label: "Key Performance Indicators",
      to: "/dashboard/key-performance-indicators",
      type: "Independent artist, Special artist",
    },
  ];

  console.log(contents);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#181B24] text-gray-300 flex flex-col items-start
    w-[300px] z-50 transition-transform duration-300 ease-in-out
    ${showNav ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
  `}
    >
      {/* Only show the X button if it's a mobile screen */}
      {isMobile && (
        <button
          className="absolute top-4 right-4 z-40 text-white p-2"
          onClick={() => setShowNav(false)}
        >
          <X className="w-6 h-6" />
        </button>
      )}
      <img
        src={Elp}
        className="lg:block lg:absolute hidden lg:top-0 lg:right-0"
        alt=""
      />
      <div className="p-4 mb-3">
        <div className="flex mt-3 lg:items-center justify-start space-x-2">
          <img
            src={Logo}
            className="px-1"
            width="60px"
            height="60px"
            alt="Logo"
          />
        </div>
      </div>

      <nav className="flex-1 z-50 w-full">
        <ul className="space-y-1 w-full">
          {artistType !== "" &&
            menuItems
              .filter((item) =>
                menuItemMatchesArtistType(item.type, artistType),
              )
              .map((item, index) => (
                <li key={index}>
                  <button
                    className={`w-full flex items-center px-4 py-2 hover:bg-gray-800 hover:text-cyan-400 transition-colors duration-200 justify-start text-[#666B76] ${
                      location.pathname === item.to
                        ? "bg-gray-800 text-cyan-400"
                        : ""
                    }`}
                    onClick={() => handleNavigation(item.to)}
                  >
                    <span className="inline-flex items-center justify-center w-6 mr-3">
                      {item.icon}
                    </span>
                    <span className="text-[14px] font-medium">
                      {item.label}
                    </span>

                    {contents?.length === 0 && (
                      <span className="ml-auto">{item.lock}</span>
                    )}
                  </button>
                </li>
              ))}
        </ul>
      </nav>

      {
        <div className="p-4 border-t border-gray-800 w-full">
          <Link
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200 rounded justify-start w-full"
          >
            <img src={Logout} className="w-[24px] h-[24px]" alt="Logout" />
            <span className="ms-3">Log Out</span>
          </Link>
        </div>
      }
    </div>
  );
};

export default SidebarNav;
