// components/ArtistRankingTable.jsx
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  navigateToArtistDetail,
  resolveLeaderboardOphId,
} from "../../../../utils/artistHash";

const DEFAULT_AVATAR = "/assets/images/struggleSectionThumbnail.png";

const ArtistRankingTable = ({
  data = [],
  title = "Ranking",
  loading = false,
  page = 1,
  totalPages = 0,
  total = 0,
  perPage = 10,
  onPageChange,
}) => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const skipPageScrollRef = useRef(true);

  useEffect(() => {
    if (skipPageScrollRef.current) {
      skipPageScrollRef.current = false;
      return;
    }
    const id = window.requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [page]);

  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const formatListeners = (views) => {
    const v =
      views == null || views === ""
        ? 0
        : Number(views);
    const n = Number.isFinite(v) ? v : 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M+`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
    return `${n}+`;
  };

  const reachCount = (artist) => {
    const raw =
      artist.total_views ??
      artist.total_reach ??
      artist.totalViews ??
      artist.user_traffic;
    if (raw == null || raw === "") return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const profilePhoto = (artist) =>
    artist.personal_photo ||
    artist.profile_img_url ||
    artist.personalPhoto ||
    "";

  const displayFullName = (artist) => {
    const n = (
      artist.full_name ??
      artist.fullName ??
      artist.name ??
      ""
    );
    const s = String(n).trim();
    return s || "—";
  };

  const displayStageName = (artist) => {
    const s = String(artist.stage_name ?? artist.stageName ?? "").trim();
    return s || "—";
  };

  const handleProfileClick = (e, artistId) => {
    e.preventDefault();
    e.stopPropagation();
    const id = artistId != null ? String(artistId).trim() : "";
    if (!id) return;
    void navigateToArtistDetail(navigate, id);
  };

  return (
    <div
      ref={rootRef}
      className="bg-black text-white p-6 sm:p-10 xl:px-16 mt-10 scroll-mt-24 sm:scroll-mt-28"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-cyan-400 text-2xl font-bold uppercase">
          {title}
        </h2>
      </div>

      {/* Header */}
      <div className="flex items-center text-gray-400 text-xs sm:text-sm uppercase mb-4 px-4 gap-1">
        <div className="flex-1 min-w-0">Artist</div>
        <div className="flex-1 min-w-0">Name</div>
        <div className="flex-1 min-w-0">Stage</div>
        <div className="flex-1 min-w-0 text-center">Reach</div>
        <div className="flex-1 min-w-0 hidden sm:block text-center">
          Profile
        </div>
      </div>

      <div className="space-y-2">
        {loading && data.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Searching…</p>
        ) : data.length > 0 ? (
          data.map((artist, index) => {
            const oid = resolveLeaderboardOphId(artist);
            const photo = profilePhoto(artist);
            return (
            <div
              key={oid || `row-${index}`}
              className="flex items-center px-4 py-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-900/30"
              onClick={(e) => oid && handleProfileClick(e, oid)}
            >
              {/* <div className="flex-1 text-gray-300 font-bold">
                <span
                  className={`${
                    index === 0
                      ? "bg-amber-400 text-black"
                      : index === 1
                      ? "bg-green-400 text-black"
                      : index === 2
                      ? "bg-cyan-400 text-black"
                      : "text-white"
                  } px-3 py-1 rounded-full`}
                >
                  {artist.rank < 10 ? `0${artist.rank}` : artist.rank}
                </span>
              </div> */}

              <div className="flex-1">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800">
                  <img
                    src={photo || DEFAULT_AVATAR}
                    alt={artist.stage_name || "Artist"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0 text-gray-300 truncate text-sm sm:text-base">
                {displayFullName(artist)}
              </div>
              <div className="flex-1 min-w-0 text-gray-300 truncate text-sm sm:text-base">
                {displayStageName(artist)}
              </div>

              <div className="flex-1 min-w-0 text-center text-gray-300">
                {formatListeners(reachCount(artist))}
              </div>
              <div className="flex-1 hidden sm:flex justify-center">
                <button
                  type="button"
                  disabled={!oid}
                  onClick={(e) => handleProfileClick(e, oid)}
                  className="px-4 py-1 text-sm text-cyan-400 border border-cyan-400 rounded-full hover:bg-cyan-400 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  View Profile
                </button>
              </div>
            </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">No artists found.</p>
        )}
      </div>

      {!loading && total > 0 && typeof onPageChange === "function" ? (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 text-sm text-gray-400">
          <span>
            Showing {start}–{end} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-4 py-2 rounded-full border border-gray-600 text-white hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-600 disabled:hover:text-gray-400"
            >
              Previous
            </button>
            <span className="text-gray-300 tabular-nums px-2">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-4 py-2 rounded-full border border-gray-600 text-white hover:border-cyan-400 hover:text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-600 disabled:hover:text-gray-400"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ArtistRankingTable;
