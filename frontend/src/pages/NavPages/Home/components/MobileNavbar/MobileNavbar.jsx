import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, Music, BarChart3, Play, Phone } from "lucide-react";

export default function MobileNavbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navItems = [
    { icon: Home, path: "/home", label: "Home" },
    { icon: Trophy, path: "/events/online-music-events", label: "Events" },
    { icon: Music, path: "/find-your-collaborator", label: "Artists" },
    { icon: BarChart3, path: "/leaderboard/top-music-networking-platform-for-creators", label: "Leaderboard" },
    { icon: Play, path: "/resources/music-learning-education", label: "Resources" },
    { icon: Phone, path: "/contact", label: "Contact" },
  ];

  const getOriginDomainFromCookie = () => {
    if (typeof document === "undefined") return null;
    const match = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("oph_origin_domain="));
    if (!match) return null;
    return match.split("=")[1] || null;
  };

  const navigateWithOrigin = (path) => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    console.log("[MobileNavbar] navigateWithOrigin called with:", path, "hostname:", hostname);

    if (hostname.includes("ophcommunity.org")) {
      const originDomain = getOriginDomainFromCookie();
      const targetDomain = originDomain ? originDomain.replace(/^www\./, "") : "ophcommunity.com";
      const targetUrl = `${protocol}//${targetDomain}${path}`;
      console.log("[MobileNavbar] org domain redirecting to:", targetUrl);
      window.location.href = targetUrl;
      return;
    }
    console.log("[MobileNavbar] local/SPA navigate calling:", path);
    navigate(path);
  };

  return (
    <div className="lg:hidden w-full px-6 py-4 flex justify-center bg-black/40 border-y border-gray-800/80 my-4 relative z-50">
      <div className="flex justify-around items-center w-full max-w-md bg-[#13161C] border border-gray-800 rounded-2xl py-4 px-3 shadow-2xl relative z-50">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          // Determine if path is active
          const isActive =
            pathname === item.path ||
            (item.path === "/home" && pathname === "/") ||
            (item.path !== "/home" && pathname.startsWith(item.path.split("?")[0]));

          return (
            <div key={index} className="relative flex flex-col items-center">
              {/* Active text label above the icon */}
              {isActive && (
                <div className="absolute -top-9 bg-black border border-gray-800 text-[#5DC9DE] text-[10px] font-semibold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                  {item.label}
                  {/* Small arrow bubble pointer */}
                  <div className="absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-1.5 h-1.5 bg-black border-r border-b border-gray-800 rotate-45"></div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigateWithOrigin(item.path)}
                className={`p-2.5 rounded-full cursor-pointer pointer-events-auto transition-all duration-300 ${
                  isActive
                    ? "text-[#5DC9DE] bg-[#5DC9DE]/10 border border-[#5DC9DE]/30 shadow-[0_0_12px_rgba(93,201,222,0.2)]"
                    : "text-gray-400 hover:text-white"
                }`}
                aria-label={item.label}
              >
                <Icon size={20} className={isActive ? "scale-110" : "scale-100"} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
