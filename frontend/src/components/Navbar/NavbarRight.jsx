import React, { useEffect, useState } from "react";
import { Bell, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useArtist } from "../../pages/auth/API/ArtistContext";
import axiosApi from "../../conf/axios";

/** In-repo asset (public/) — avoid /placeholder.svg which is not shipped. */
const FALLBACK_AVATAR = "/logo.svg";

/** Gray circle — always loads; used when remote URL 404s or API missing. */
const FALLBACK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#374151"/><circle cx="20" cy="16" r="6" fill="#9ca3af"/></svg>',
)}`;

function pickPhotoUrl(row) {
  if (!row) return "";
  const raw =
    row.personal_photo ??
    row.personalPhoto ??
    row.profile_img_url ??
    row.PERSONAL_PHOTO;
  if (raw == null) return "";
  const s = String(raw).trim();
  if (s === "" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") {
    return "";
  }
  /* Do not append ?height= — breaks many S3 / signed URLs */
  return s;
}

const NavbarRight = () => {
  const navigate = useNavigate();
  const { ophid, headers, hasNewNotification, setHasNewNotification } = useArtist(); // get ophid + headers + notif flag
  const [artist, setArtist] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        if (!ophid || !headers) return;
        const response = await axiosApi.get("/artist-spotlight/artist-info", {
          headers,
          params: { ophid },
        });
        if (response.data.success) {
          const payload = response.data.data;
          const row = Array.isArray(payload)
            ? payload[0]
            : payload && typeof payload === "object"
              ? payload
              : null;
          setArtist(row ?? null);
        }
      } catch (error) {
        console.error("Failed to fetch artist data:", error);
      }
    };
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
        onClick={() => {
          setHasNewNotification(false);
          localStorage.removeItem("hasNewNotification");
          navigate("/dashboard/notifications");
        }}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        title="Notifications"
      >
        <Bell className="text-white w-7 h-7" />
        {hasNewNotification ? (
          <span className="absolute top-1.5 right-1.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
        ) : null}
      </button>

      {/* Profile Avatar */}
      <button
        onClick={() => navigate(`/dashboard/artist-detail?id=${ophid}`)}
        className="w-10 h-10 rounded-full border-2 border-cyan-400 overflow-hidden"
        title="Profile"
      >
        <img
          src={pickPhotoUrl(artist) || FALLBACK_AVATAR}
          alt={artist?.stage_name || "Profile"}
          className="w-10 h-10 rounded-full object-cover bg-gray-700"
          onError={(e) => {
            e.currentTarget.onerror = null;
            if (e.currentTarget.src !== FALLBACK_DATA_URI) {
              e.currentTarget.src = FALLBACK_DATA_URI;
            }
          }}
        />
      </button>
    </div>
  );
};

export default NavbarRight;
