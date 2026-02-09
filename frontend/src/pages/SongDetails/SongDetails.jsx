import React, { useEffect, useState } from "react";
import axiosApi from "../../conf/axios";
import {
  FaShareAlt,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";
import { isTomorrow, differenceInDays } from "date-fns";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useArtist } from "../auth/API/ArtistContext";

const SongDetails = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const song_id = location.state.song_id;
  const { headers, ophid } = useArtist();

  const fetchSongDetails = async () => {
    if (!headers || !headers.Authorization) {
      console.warn("Headers are not ready yet");
      return;
    }

    try {
      const response = await axiosApi.get("/get-artist-song-details", {
        headers: headers,
        params: { ophid, song_id },
      });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ophid) {
      fetchSongDetails();
    }
  }, [ophid, headers]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 0:
        return (
          <span className="flex items-center gap-2 ms-2">
            {" "}
            <FaSpinner className="text-yellow-500 animate-spin" />
            In Progress
          </span>
        );
      case 1:
        return (
          <span className="flex items-center gap-2 ms-2">
            {" "}
            <FaCheckCircle className="text-green-500" /> Completed
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-2 ms-2">
            {" "}
            <FaTimesCircle className="text-red-500" />
          </span>
        );
      default:
        return <span className="text-gray-400">No Status</span>;
    }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
    } catch {
      return "TBD";
    }
  };

  function formatTime(timeString) {
    if (!timeString) return "TBD";

    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // This ensures the time is in IST
    });
  }

  if (loading) {
    return (
      <div className="text-center text-white py-10 text-lg animate-pulse">
        Loading song details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-10 text-lg">{error}</div>
    );
  }

  const { content, secondary_artists, release_details } = data;

  const currentDate = new Date();
  const songReleaseDate = new Date(content?.release_date);

  const getCurrentTime = currentDate.getTime();
  const getUpcomingSongTime = songReleaseDate.getTime();

  const diffInMins = getUpcomingSongTime - getCurrentTime;

  const daysUntilRelease = Math.ceil(diffInMins / (1000 * 60 * 60 * 24));

  const isReleaseTomorrow = daysUntilRelease === 1;
  const bannerMessage = isReleaseTomorrow
    ? "Your Song Is Gonna Release Tomorrow"
    : `Your Song Is Gonna Release In ${daysUntilRelease} Days`;

  return (
    <div className="text-white bg-[#121212] rounded-xl shadow-2xl p-8 sm:p-10 font-sans max-w-5xl mx-auto mt-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#00B8D9] via-[#00B8D9] to-[#008C91] p-4 sm:p-5 rounded-lg mb-8 shadow-lg border-2 border-[#00B8D9]/40">
        <h2 className="text-white text-xl sm:text-2xl font-bold uppercase tracking-wider text-center sm:text-left">
          ⚠️ {bannerMessage} ⚠️
        </h2>
        <p className="text-gray-200 text-sm sm:text-base mt-1 text-center sm:text-left">
          Get ready for the release of{" "}
          <span className="font-semibold text-white">
            {content.song_name.toUpperCase()}
          </span>{" "}
          on{" "}
          <span className="text-[#ffffff]">
            {formatDate(content.release_date)}
          </span>
        </p>
      </div>

      {/* Song Details */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase text-[#00B8D9]">
        Song Details
      </h2>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-6 sm:space-y-0">
        <img
          src={JSON.parse(content.image_url)}
          alt="Album Cover"
          className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-md shadow-xl hover:scale-105 transition-all duration-300 mx-auto sm:mx-0"
        />
        <div className="flex-1 sm:ml-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {/* Title */}
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">Title</h3>
              <p className="text-gray-200">{content.song_name.toUpperCase()}</p>
            </div>

            {/* Primary Artist */}
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">
                Primary Artist
              </h3>
              <p className="text-gray-200">
                {content.stage_name} ({content.full_name})
              </p>
            </div>

            {/* Secondary Artists */}
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">
                Secondary-Artists
              </h3>
              <p className="text-gray-200">
                {secondary_artists
                  ? [...(secondary_artists.featuring || [])]
                      .map((a) => a)
                      .join(", ") || "N/A"
                  : "N/A"}
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">
                Secondary-Lyrics
              </h3>
              <p className="text-gray-200">
                {secondary_artists
                  ? [...(secondary_artists.lyricist || [])]
                      .map((a) => a)
                      .join(", ") || "N/A"
                  : "N/A"}
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">
                Secondary-Composer
              </h3>
              <p className="text-gray-200">
                {secondary_artists
                  ? [...(secondary_artists.composer || [])]
                      .map((a) => a)
                      .join(", ") || "N/A"
                  : "N/A"}
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-[#00B8D9] text-lg">
                Secondary-Producer
              </h3>
              <p className="text-gray-200">
                {secondary_artists
                  ? [...(secondary_artists.producer || [])]
                      .map((a) => a)
                      .join(", ") || "N/A"
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Release Details */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase text-[#00B8D9]">
        Release Details
      </h2>
      <div className="text-gray-400 text-xs sm:text-sm uppercase mb-2 flex border-b border-gray-600 px-4">
        <div className="flex-1 text-center py-2">Platform</div>
        <div className="flex-1 text-center py-2">Release Time</div>
        <div className="flex-1 text-center py-2">Status</div>
        <div className="flex-1 text-center py-2">Share</div>
      </div>

      {release_details?.length > 0 ? (
        release_details.map((detail, idx) => (
          <div
            key={idx}
            className="flex items-center py-3 px-4 border-b border-gray-700 text-center"
          >
            <div className="flex-1 border-r border-gray-600">
              <p className="font-semibold">{detail.stream_name}</p>
            </div>

            <div className="flex-1 border-r border-gray-600">
              <p>
                {detail.release_time ? formatTime(detail.release_time) : "TBD"}
              </p>
            </div>

            <div className="flex-1 border-r border-gray-600">
              {getStatusIcon(detail.status)}
            </div>

            <div className="flex-1">
              <button
                onClick={() => {
                  console.log(detail.link);
                  if (detail.link) {
                    navigator.clipboard.writeText(detail.link);
                    toast.success("Link copied!");
                  }
                }}
                disabled={!detail.link}
                className={`px-4 py-2 rounded-md text-sm flex items-center justify-center mx-auto transition-all duration-300
                  ${
                    detail.link
                      ? "bg-[#00B8D9] hover:bg-[#008C91] text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <FaShareAlt className="mr-2 sm:hidden" />
                <span className="hidden sm:inline-block">Copy Link</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center py-4 text-gray-400">
          No release details available.
        </p>
      )}
    </div>
  );
};

export default SongDetails;
