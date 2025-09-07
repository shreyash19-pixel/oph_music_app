import React, { useEffect, useState } from "react";
import { Bell, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArtist } from "../../pages/auth/API/ArtistContext";
import axiosApi from "../../conf/axios";

const NavbarRight = () => {
  const navigate = useNavigate();
  const { ophid, headers } = useArtist(); // get ophid + headers
  const [artist, setArtist] = useState(null);

  // Fetch artist details (for personal_photo & stage_name)
  const fetchArtist = async () => {
    try {
      if (!ophid || !headers) return;
      const response = await axiosApi.get("/artist-spotlight/artist-info", {
        headers,
        params: { ophid },
      });

        if (response.data.success) {
        
        setArtist(response.data.data[0]); // first artist record
      }
    } catch (error) {
      console.error("Failed to fetch artist data:", error);
    }
  };

  useEffect(() => {
    fetchArtist();
  }, [ophid, headers]);

  return (
    <div className="flex items-center space-x-4">
      {/* Docs Button */}
      <button
        onClick={() => navigate("/dashboard/learnings")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        title="Docs"
      >
        <FileText className="text-white w-7 h-7" />
      </button>

      {/* Notifications Button */}
      <button
        onClick={() => navigate("/dashboard/notifications")}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        title="Notifications"
      >
        <Bell className="text-white w-7 h-7" />
      </button>

      {/* Profile Avatar */}
      <button
        onClick={() => navigate(`/dashboard/artist-detail?id=${ophid}`)}
        className="w-10 h-10 rounded-full border-2 border-cyan-400 overflow-hidden"
        title="Profile"
      >
        {artist ? (
          <img
            src={`${artist.personal_photo}?height=40&width=40`}
            alt={artist.stage_name}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <img
            src="/placeholder.svg?height=40&width=40"
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        )}
      </button>
    </div>
  );
};

export default NavbarRight;
