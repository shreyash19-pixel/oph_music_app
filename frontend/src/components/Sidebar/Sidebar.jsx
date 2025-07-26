import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useArtist } from "../../pages/auth/API/ArtistContext";
import Elp from "../../../public/assets/images/Ellipse4.png";
import Logo from "../../../public/assets/images/logo.png";
import { TiHome } from "react-icons/ti";
import Calender from "../../../public/assets/images/calender.png";
import SongUp from "../../../public/assets/images/song.png";
import Tv from "../../../public/assets/images/tv.png";
import Spot from "../../../public/assets/images/spotlight.png";
import Anal from "../../../public/assets/images/analytics.png";
import Ticket from "../../../public/assets/images/ticket.png";
import Event from "../../../public/assets/images/event.png";
import Income from "../../../public/assets/images/income.png";
import Key from "../../../public/assets/images/key.png";
import Logout from "../../../public/assets/images/logout.png";
import { X } from "lucide-react";
import axiosApi from "../../conf/axios";

const SidebarNav = ({ onClose }) => {
  const navigate = useNavigate();
  const { logout} = useArtist();
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false); // State to check if screen width is narrow
  const [data, setData] = useState([]);
  
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


  const handleLogout = async () => {
    await logout();
    toast.success("Logged Out Successfully!");
    navigate("/auth/login");
    onClose?.();
  };

  const handleNavigation = (path) => {
    if(path.includes("metadata"))
    {
      navigate(path, {
        state:{
          songName : data.Song_name
        }
      })

      return
    }
    navigate(path);
    onClose?.();
  };

  const menuItems = [
    { icon: <TiHome />, label: "Home", to: "/dashboard" },
    {
      icon: <img src={Calender} className="w-[24px] h-[24px]" />,
      label: "Time Calendar",
      to: "/dashboard/time-calendar",
    },
    {
      icon: <img src={SongUp} className="w-[24px] h-[24px]" />,
      label: "Songs Registration",
      to: '/dashboard/upload-song',
    },
    {
      icon: <img src={Tv} className="w-[24px] h-[24px]" />,
      label: "TV Publishing",
      to: "/dashboard/tv-publishing",
    },
    {
      icon: <img src={Spot} className="w-[24px] h-[24px]" />,
      label: "Artist Spotlight",
      to: "/dashboard/artist-spotlight",
    },
    {
      icon: <img src={Anal} className="w-[24px] h-[24px]" />,
      label: "Analytics",
      to: "/dashboard/analytics",
    },
    {
      icon: <img src={Ticket} className="w-[24px] h-[24px]" />,
      label: "Request Ticket",
      to: "/dashboard/request-ticket",
    },
    {
      icon: <img src={Event} className="w-[24px] h-[24px]" />,
      label: "Event",
      to: "/dashboard/events",
    },
    {
      icon: <img src={Income} className="w-[24px] h-[24px]" />,
      label: "Income",
      to: "/dashboard/income",
    },
    {
      icon: <img src={Key} className="w-[24px] h-[24px]" />,
      label: "Key Performance Indicators",
      to: "/dashboard/key-performance-indicators",
    },
  ];

  return (
    <div className="w-30 lg:w-[300px] fixed top-0 flex flex-col h-full bg-[#181B24] text-gray-300 items-start">
      {/* Only show the X button if it's a mobile screen */}
      {isMobile && (
        <button
          className="absolute top-4 right-4 z-40 text-white p-2"
          onClick={onClose}
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
          {menuItems.map((item, index) => (
            <li key={index}>
              <button
                className={`w-full flex items-center px-4 py-2 hover:bg-gray-800 hover:text-cyan-400 transition-colors duration-200 justify-start text-[#666B76] ${location.pathname === item.to
                    ? "bg-gray-800 text-cyan-400"
                    : ""
                  }`}
                onClick={() => handleNavigation(item.to)}
              >
                <span className="inline-flex items-center justify-center w-6 mr-3">
                  {item.icon}
                </span>
                <span className="text-[14px] font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {userData && (
        <div className="p-4 border-t border-gray-800 w-full">
          <Link
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors duration-200 rounded justify-start w-full"
          >
            <img src={Logout} className="w-[24px] h-[24px]" alt="Logout" />
            <span className="ms-3">Log Out</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SidebarNav;
