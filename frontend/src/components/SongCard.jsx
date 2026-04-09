import React from "react";
import { useNavigate } from "react-router-dom";
import formatDateAndAdjustMonth from "../utils/date";

const DEFAULT_THUMB = "/logo.svg";

function parseReleaseInstant(raw) {
  if (raw == null || raw === "") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/** DB may store MySQL TIME (HH:MM:SS), ISO string, or empty. */
function formatReleaseTiming(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!s || s.toLowerCase() === "null") return null;
  const timeOnly = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeOnly) {
    let h = parseInt(timeOnly[1], 10);
    const min = parseInt(timeOnly[2], 10);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${String(min).padStart(2, "0")} ${period} IST`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return (
      d.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }) + " IST"
    );
  }
  return s;
}

function pickThumbnailUrl(image) {
  if (image == null) return DEFAULT_THUMB;
  if (typeof image === "string") {
    const s = image.trim();
    return s === "" || s.toLowerCase() === "null" ? DEFAULT_THUMB : s;
  }
  if (Array.isArray(image)) {
    const first = image[0];
    if (typeof first === "string") return first || DEFAULT_THUMB;
    if (first && typeof first === "object") {
      return first.url || first.src || first.href || DEFAULT_THUMB;
    }
    return DEFAULT_THUMB;
  }
  if (typeof image === "object") {
    return image.url || image.src || image.href || DEFAULT_THUMB;
  }
  return DEFAULT_THUMB;
}

const SongCard = ({ releaseData }) => {
  const navigate = useNavigate();

  const rawDate =
    releaseData?.dateTime ??
    releaseData?.release_date ??
    releaseData?.releaseDate;
  const songReleaseDate = parseReleaseInstant(rawDate);

  const title =
    releaseData?.EventName ??
    releaseData?.song_name ??
    releaseData?.Song_name ??
    "Upcoming release";

  const thumbnailUrl = pickThumbnailUrl(releaseData?.image);
  const thumbnailAlt = `${title} thumbnail`;

  let bannerMessage = "Your upcoming release";
  if (songReleaseDate) {
    const diffMs = songReleaseDate.getTime() - Date.now();
    const daysUntilRelease = Math.max(
      0,
      Math.ceil(diffMs / (1000 * 60 * 60 * 24)),
    );
    if (daysUntilRelease === 0) {
      bannerMessage = "Your song releases today";
    } else if (daysUntilRelease === 1) {
      bannerMessage = "Your Song Is Gonna Release Tomorrow";
    } else {
      bannerMessage = `Your Song Is Gonna Release In ${daysUntilRelease} Days`;
    }
  }

  const releaseLabel =
    formatDateAndAdjustMonth(rawDate) ||
    (songReleaseDate
      ? songReleaseDate.toLocaleDateString("en-GB", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "TBA");

  const rawTiming =
    releaseData?.release_time ?? releaseData?.releaseTime ?? null;
  const timingLabel = formatReleaseTiming(rawTiming);

  return (
    <div
      onClick={() => navigate("/dashboard/song-details", {
        state: {
          song_id : releaseData?.song_id
        }
      })}
      style={{
        backgroundImage: "url('/assets/images/songUploadCardBg.png')",
      }}
      className="p-10 mt-8 rounded-lg hover:cursor-pointer flex flex-col md:flex-row md:justify-between md:items-center gap-6"
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-base sm:text-xl font-bold uppercase tracking-wide text-[#5DC9DE]">
            {bannerMessage}
          </h2>
          <h2 className="text-white text-2xl md:text-xl font-extrabold mt-1">
            {title}
          </h2>
        </div>

        <div className="space-y-2 text-slate-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-400">Release Date:</span>
            <span className="font-medium text-white">{releaseLabel}</span>
          </div>
          {timingLabel && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">
                Song release timing:
              </span>
              <span className="font-medium text-white">{timingLabel}</span>
            </div>
          )}
        </div>

        <button className="bg-[#5DC9DE] text-black rounded-full shadow-[inset_0_-25px_18px_-14px_rgba(93,201,222,0.2),0_1px_2px_rgba(93,201,222,0.15),0_2px_4px_rgba(93,201,222,0.15),0_4px_8px_rgba(93,201,222,0.15),0_8px_16px_rgba(93,201,222,0.15),0_16px_32px_rgba(93,201,222,0.15)]
cursor-pointer inline-block font-sans px-8 py-2 text-center text-base
transition-all duration-250 border-0 select-none hover:shadow-[inset_0_-25px_18px_-14px_rgba(93,201,222,0.35),0_1px_2px_rgba(93,201,222,0.25),0_2px_4px_rgba(93,201,222,0.25),0_4px_8px_rgba(93,201,222,0.25),0_8px_16px_rgba(93,201,222,0.25),0_16px_32px_rgba(93,201,222,0.25)]">
          Get Details
        </button>
      </div>

      <div className="w-48 h-48 rounded-lg overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={thumbnailAlt}
          className="w-full h-full object-cover bg-gray-800"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = DEFAULT_THUMB;
          }}
        />
      </div>
    </div>
  );
};

export default SongCard;
