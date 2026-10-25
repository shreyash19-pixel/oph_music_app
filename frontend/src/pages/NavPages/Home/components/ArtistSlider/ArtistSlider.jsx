import React, { useState, useEffect, useRef, useMemo } from "react";
import Slider from "react-slick";
import arrowRightIc from "/assets/images/arrowRightIc.svg";
import arrowLeftIc from "/assets/images/arrowLeftIc.svg";
import axiosApi from "../../../../../conf/axios";
import MusicBg from "../../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../../public/assets/images/elipse2.png";
import { Shimmer } from "react-shimmer";
import ArtistProfile from "./ArtistProfile";

const DEFAULT_ARTIST_PHOTO = "/assets/images/pfp.png";

function resolveArtistPhoto(photo) {
  const url = typeof photo === "string" ? photo.trim() : "";
  return url || DEFAULT_ARTIST_PHOTO;
}

/** Keep the <img> mounted so carousel slides actually load (react-shimmer unmounts it). */
function ArtistSlidePhoto({ src, alt, selected }) {
  const photoSrc = resolveArtistPhoto(src);
  const [status, setStatus] = useState(photoSrc === DEFAULT_ARTIST_PHOTO ? "ready" : "loading");
  const [displaySrc, setDisplaySrc] = useState(photoSrc);

  useEffect(() => {
    const next = resolveArtistPhoto(src);
    setDisplaySrc(next);
    setStatus(next === DEFAULT_ARTIST_PHOTO ? "ready" : "loading");
  }, [src]);

  const showShimmer = status === "loading";

  return (
    <div className="relative w-[120px] sm:w-[150px] lg:w-[180px] aspect-square flex-shrink-0">
      {showShimmer && (
        <div className="absolute inset-0 z-10 overflow-hidden rounded-full">
          <Shimmer width={180} height={180} className="rounded-full !w-full !h-full" />
        </div>
      )}
      <img
        src={displaySrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus("ready")}
        onError={() => {
          setStatus("ready");
          setDisplaySrc((current) =>
            current === DEFAULT_ARTIST_PHOTO ? current : DEFAULT_ARTIST_PHOTO,
          );
        }}
        className={`
          w-full h-full
          rounded-full
          object-cover
          transition-all duration-300
          border-2
          ${showShimmer ? "opacity-0" : "opacity-100"}
          ${selected ? "border-[#5DC9DE] shadow-[0_0_15px_rgba(93,201,222,0.4)]" : "border-[#6F4FA0] shadow-[0_0_15px_rgba(111,79,160,0.3)]"}
        `}
      />
    </div>
  );
}

/** Page size for /get-top-artist (max 100 on the API). */
const TOP_ARTIST_PAGE_SIZE = 36;
/** Cap slides so home/artists do not download hundreds of S3 photos. */
const DEFAULT_MAX_ARTISTS = 36;

/** After exclude filter: KPI-scored artists first, then everyone else (stable tie-breakers). */
function sortArtistsScoredFirst(list) {
  if (!Array.isArray(list) || list.length <= 1) return list;
  const scoreOf = (a) => Number(a.kpi_score ?? a.score ?? 0);
  const viewsOf = (a) => Number(a.total_views ?? 0);
  const scored = [];
  const rest = [];
  for (const row of list) {
    if (scoreOf(row) > 0) scored.push(row);
    else rest.push(row);
  }
  const byScoreThenViews = (a, b) => {
    const ds = scoreOf(b) - scoreOf(a);
    if (ds !== 0) return ds;
    const dv = viewsOf(b) - viewsOf(a);
    if (dv !== 0) return dv;
    return String(a.stage_name ?? "").localeCompare(
      String(b.stage_name ?? ""),
      undefined,
      { sensitivity: "base" },
    );
  };
  const byViewsThenName = (a, b) => {
    const dv = viewsOf(b) - viewsOf(a);
    if (dv !== 0) return dv;
    return String(a.stage_name ?? "").localeCompare(
      String(b.stage_name ?? ""),
      undefined,
      { sensitivity: "base" },
    );
  };
  scored.sort(byScoreThenViews);
  rest.sort(byViewsThenName);
  return [...scored, ...rest];
}

const sumOfPlays = (songs) => {
  if (!Array.isArray(songs)) return 0;
  return songs.reduce((sum, song) => {
    const n = Number(
      song?.total_views ?? song?.youtube_views ?? song?.total_song_views ?? 0,
    );
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
};

function listenerCount(artist) {
  return sumOfPlays(artist?.songs);
}

function formatListeners(count) {
  const n = Number(count) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Left-edge slide index so `clickedIndex` sits near the middle of the viewport.
 * Matches react-slick non-centerMode behavior (clicked slide visible and centered when possible).
 */
function alignedSlideIndex(clickedIndex, slideCount, slidesToShow) {
  if (slideCount <= 0) return 0;
  const st = Number(slidesToShow) || 1;
  const maxSlide = Math.max(0, Math.floor(slideCount - st));
  if (maxSlide <= 0) return 0;
  const ideal = clickedIndex - Math.floor(st / 2);
  return Math.max(0, Math.min(ideal, maxSlide));
}

const ArtistSlider = ({
  rows = 1,
  onListedProfileOpenChange,
  excludeOphIds = [],
  maxArtists = DEFAULT_MAX_ARTISTS,
}) => {
  const sliderRef = useRef(null);
  const artistProfileRef = useRef(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [allArtists, setAllArtists] = useState([]);

  const [currArtist, setCurrentArtist] = useState(null);

  useEffect(() => {
    onListedProfileOpenChange?.(Boolean(selectedArtist));
  }, [selectedArtist, onListedProfileOpenChange]);

  useEffect(() => {
    let cancelled = false;

    const fetchTopArtists = async () => {
      try {
        const cap = Math.max(1, Number(maxArtists) || DEFAULT_MAX_ARTISTS);
        const perPage = Math.min(TOP_ARTIST_PAGE_SIZE, cap);
        // Light list: photos + KPI only (songs load on profile click).
        const response = await axiosApi.get(
          `/get-top-artist?page=1&per_page=${perPage}&include_songs=1`,
        );
        if (cancelled) return;

        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setAllArtists(list.slice(0, cap));
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    fetchTopArtists();
    return () => {
      cancelled = true;
    };
  }, [maxArtists]);

  const excludeSet = useMemo(
    () => new Set(excludeOphIds.map((id) => String(id).trim()).filter(Boolean)),
    [excludeOphIds],
  );

  const artists = useMemo(() => {
    const filtered = allArtists.filter((row) => {
      const oid = String(row.oph_id ?? row.OPH_ID ?? "").trim();
      return oid && !excludeSet.has(oid);
    });
    return sortArtistsScoredFirst(filtered);
  }, [allArtists, excludeSet]);

  /** Slick infinite mode clones slides; disable when too few unique slides vs slidesToShow (~6). */
  const useInfiniteCarousel = artists.length >= 12;

  const handleSliderNav = (direction) => {
    if (sliderRef.current) {
      if (direction === "next") {
        sliderRef.current.slickNext();
      } else {
        sliderRef.current.slickPrev();
      }
    }
  };

  const handleArtistClick = (id, index) => {
    setCurrentArtist(id);
    setSelectedArtist(id);
    const root = sliderRef.current;
    root?.slickPause?.();

    // Align carousel so the clicked artist is near the center (uses live slidesToShow from slick)
    if (root?.slickGoTo) {
      const inner = root.innerSlider;
      const slideCount = inner?.state?.slideCount ?? artists.length;
      const slidesToShow = Number(inner?.props?.slidesToShow) || 5.6;
      const target = alignedSlideIndex(index, slideCount, slidesToShow);
      root.slickGoTo(target);
    }

    // Nudge scroll only slightly toward the profile (capped — full scrollIntoView felt excessive)
    const scrollProfileNudge = () => {
      const el = artistProfileRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const marginFromTop = 72;
      if (rect.top >= marginFromTop) return;
      const neededDown = marginFromTop - rect.top;
      const maxPx = 100;
      const delta = Math.min(neededDown, maxPx);
      if (delta > 0) {
        window.scrollBy({ top: delta, behavior: "smooth" });
      }
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollProfileNudge);
    });
  };

  return (
    <div className="bg-black relative px-[12px] lg:px-16 text-white py-[20px] lg:py-10 w-full">
      <img
        src={MusicBg}
        className="absolute sm:h-[500px] object-cover w-full -top-[150px] sm:-top-[20px] z-0"
        alt=""
      />
      <img
        src={Elipse}
        className="absolute h-[600px] object-cover left-[0] -top-[150px] z-0"
        alt=""
      />
      <div className="relative lg:container lg:mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-8 sm:mb-16">
          <div className="text-left px-3 sm:text-center p-0 lg:max-w-xl">
            <h2 className="text-2xl lg:text-5xl font-black mb-3 uppercase tracking-tight text-white leading-tight">
              THESE ARTISTS ARE{" "}
              <span className="text-[#5DC9DE]">INDUSTRY BANGERS.</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took
            </p>
          </div>
          <div className="hidden sm:flex pe-0 py-4 lg:py-0 sm:mt-8 lg:pe-6 xl:pe-16 relative z-50 items-center gap-2">
            {/* Prev Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSliderNav("prev");
              }}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <img
                src={arrowLeftIc}
                alt="Previous"
                className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none"
              />
            </button>

            {/* Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSliderNav("next");
              }}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#6F4FA0] rounded-full hover:bg-[#5a3f80] transition-colors cursor-pointer"
            >
              <img
                src={arrowRightIc}
                alt="Next"
                className="w-4 h-4 sm:w-5 sm:h-5 pointer-events-none"
              />
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative">
          {artists.length > 0 && (
          <Slider
            key={`artists-${artists.length}`}
            ref={sliderRef}
            {...{
              dots: false,
              speed: 300,
              autoplay: artists.length > 0 && selectedArtist == null,
              autoplaySpeed: 3000,
              pauseOnHover: true,
              infinite: useInfiniteCarousel,
              slidesToShow: 5.6,
              slidesToScroll: 1,
              arrows: false,
              rows: rows,
              swipeToSlide: true,
              touchThreshold: 10,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 4.6,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: "0%",
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 3.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: "0%",
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 2.8,
                    slidesToScroll: 1,
                    centerMode: false,
                    centerPadding: "0%",
                  },
                },
              ],
            }}
          >
            {artists.map((artist, index) => {
              const id = artist.oph_id ?? artist.OPH_ID;
              return (
                <div
                  key={id ?? `artist-slide-${index}`}
                  className="px-2 cursor-pointer mb-10"
                >
                  <div
                    className="group relative pointer-events-auto"
                    onTouchEnd={(e) => {
                      handleArtistClick(id, index);
                    }}
                  >
                    <div className="flex justify-center overflow-hidden">
                      <ArtistSlidePhoto
                        src={artist.personal_photo}
                        alt={artist.stage_name}
                        selected={id === currArtist}
                      />
                    </div>
                    <div
                      className="flex flex-col text-center items-center justify-end p-4"
                      onMouseUp={(e) => {
                        if (e.button === 0) handleArtistClick(id, index);
                      }}
                    >
                      <a
                        className={`text-base sm:text-lg font-semibold tracking-tight transition-colors duration-300 ${
                          id === currArtist ? "text-[#5DC9DE]" : "text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleArtistClick(id, index);
                        }}
                      >
                        {artist.stage_name}
                      </a>
                      <p
                        className={`text-xs sm:text-sm transition-colors duration-300 ${
                          id === currArtist ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {formatListeners(listenerCount(artist))} Listeners
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
          )}
        </div>

        {/* Mobile Arrow buttons (below the slider) */}
        <div className="flex sm:hidden justify-center items-center gap-4 lg:mb-8 relative z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSliderNav("prev");
            }}
            className="flex items-center justify-center w-10 h-10 bg-gray-800 border border-gray-700 rounded-full hover:bg-gray-700 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <img
              src={arrowLeftIc}
              alt="Previous"
              className="w-4 h-4 pointer-events-none"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSliderNav("next");
            }}
            className="flex items-center justify-center w-10 h-10 bg-[#6F4FA0] rounded-full hover:bg-[#5a3f80] transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <img
              src={arrowRightIc}
              alt="Next"
              className="w-4 h-4 pointer-events-none"
            />
          </button>
        </div>
      </div>

      {/* Artist Profile Section */}
      {selectedArtist && (
        <div ref={artistProfileRef} className="mt-10">
          <ArtistProfile id={selectedArtist} />
        </div>
      )}
    </div>
  );
};

export default ArtistSlider;
