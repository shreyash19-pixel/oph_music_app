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
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
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
    <div className="text-white mt-[14px] mt-[14px] px-4 py-4 sm:px-5 sm:py-5 ml-[16px] mr-[16px]  p-8 sm:p-12 max-w-[1500px]">
      {/* SONG DETAILS */}

      <h2 className="text-3xl mb-8 font-bold text-cyan-300 font-extrabold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
        SONG DETAILS
      </h2>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT SECTION */}
        <div className="flex gap-8 items-start">
          <img
            src={JSON.parse(content.image_url)}
            alt="Album"
            className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-md shadow-lg"
          />

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {content.song_name.toUpperCase()}
            </h1>

            <div className="space-y-2 text-gray-300 text-base">
              <p>
                <span className="text-gray-400">Artist Name:</span>{" "}
                {content.stage_name}
              </p>
              <p>
                <span className="text-gray-400">Lyrics:</span>{" "}
                {content.stage_name}
              </p>
              <p>
                <span className="text-gray-400">Music:</span>{" "}
                {content.stage_name}
              </p>
              <p>
                <span className="text-gray-400">Produced By:</span>{" "}
                {secondary_artists?.producer?.join(", ") || "N/A"}
              </p>
              <p>
                <span className="text-gray-400">Secondary Artist:</span>{" "}
                {secondary_artists?.featuring?.join(", ") || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RELEASE DETAILS */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-8 text-cyan-300 font-extrabold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
          RELEASE DETAILS:
        </h2>

        {/* HEADER */}
        <div className="grid grid-cols-3 text-gray-500 text-sm uppercase border-b border-gray-600">
          <div className="py-3 px-2 border-r border-gray-700">Details</div>
          <div className="py-3 px-2 text-center border-r border-gray-700">
            Status
          </div>
          <div className="py-3 px-2 text-center border-r border-gray-700">
            Share
          </div>
        </div>

        {/* ROWS */}
        {release_details?.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-3 items-center text-base border-b border-gray-800"
          >
            {/* DETAILS */}
            <div className="py-4 px-2 border-r border-gray-700">
              <p className="text-gray-300">
                {item.stream_name} Timing:{" "}
                <span className="text-white font-semibold">
                  {item.release_time ? formatTime(item.release_time) : "TBD"}
                </span>
              </p>
            </div>

            {/* STATUS */}
            <div className="py-4 px-2 text-center border-r border-gray-700">
              <span
                className={`font-medium ${
                  item.status === 1
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              >
                {item.status === 1 ? "Completed" : "In-Progress"}
              </span>
            </div>

            {/* SHARE */}
            <div className="py-4 px-2 text-center border-r border-gray-700">
              <button
                onClick={() => {
                  if (item.link) {
                    navigator.clipboard.writeText(item.link);
                    toast.success("Link copied!!!");
                  }
                }}
                className="text-gray-300 hover:text-white transition flex items-center justify-center gap-2 mx-auto"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                >
                  <path
                    d="M21.4354 2.58198C20.9352 2.0686 20.1949 1.87734 19.5046 2.07866L3.408 6.75952C2.6797 6.96186 2.16349 7.54269 2.02443 8.28055C1.88237 9.0315 2.37858 9.98479 3.02684 10.3834L8.0599 13.4768C8.57611 13.7939 9.24238 13.7144 9.66956 13.2835L15.4329 7.4843C15.723 7.18231 16.2032 7.18231 16.4934 7.4843C16.7835 7.77623 16.7835 8.24935 16.4934 8.55134L10.72 14.3516C10.2918 14.7814 10.2118 15.4508 10.5269 15.9702L13.6022 21.0538C13.9623 21.6577 14.5826 22 15.2628 22C15.3429 22 15.4329 22 15.513 21.9899C16.2933 21.8893 16.9135 21.3558 17.1436 20.6008L21.9156 4.52479C22.1257 3.84028 21.9356 3.09537 21.4354 2.58198Z"
                    fill="#9BA3B7"
                  />
                </svg>

                <span className="whitespace-nowrap">Share Link</span>
              </button>
            </div>

            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongDetails;
