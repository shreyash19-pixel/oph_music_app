import React, { useState, useEffect, useRef, useMemo } from "react";
import Slider from "react-slick";
import arrowRightIc from "/assets/images/arrowRightIc.svg";
import arrowLeftIc from "/assets/images/arrowLeftIc.svg";
import axiosApi from "../../../../../conf/axios";
import MusicBg from "../../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../../public/assets/images/elipse2.png";
import { Image, Shimmer } from "react-shimmer";
import ArtistProfile from "./ArtistProfile";

/** Max per_page allowed by /get-top-artist (see admin kpi controller). */
const TOP_ARTIST_PAGE_SIZE = 100;

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

    const fetchAllTopArtists = async () => {
      const merged = [];
      const seen = new Set();
      let totalFromApi = null;
      let page = 1;

      try {
        while (page <= 50) {
          const response = await axiosApi.get(
            `/get-top-artist?page=${page}&per_page=${TOP_ARTIST_PAGE_SIZE}`,
          );
          if (cancelled) return;

          const list = Array.isArray(response.data?.data)
            ? response.data.data
            : [];
          const total = response.data?.total;
          if (typeof total === "number" && Number.isFinite(total)) {
            totalFromApi = total;
          }

          for (const row of list) {
            const oid = String(row.oph_id ?? row.OPH_ID ?? "").trim();
            if (!oid || seen.has(oid)) continue;
            seen.add(oid);
            merged.push(row);
          }

          const gotAll =
            list.length < TOP_ARTIST_PAGE_SIZE ||
            (totalFromApi != null && merged.length >= totalFromApi);
          if (gotAll) break;
          page += 1;
        }

        if (cancelled) return;
        setAllArtists(merged);

        if (import.meta.env.DEV) {
          console.groupCollapsed("[ArtistSlider] get-top-artist (all pages)");
          console.log("total from API", totalFromApi);
          console.log("unique loaded", merged.length);
          console.table(
            merged.map((a) => ({
              oph_id: a.oph_id ?? a.OPH_ID,
              stage_name: a.stage_name,
              total_views: a.total_views,
            })),
          );
          console.groupEnd();
        }
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    fetchAllTopArtists();
    return () => {
      cancelled = true;
    };
  }, []);

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
      if (direction === 'next') {
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
    <div className="bg-black relative px-4 lg:px-16 xl:px-16 text-white py-10 w-full">
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
      <div className="relative container mx-auto">
        {/* Header Section */}
        <div className="flex justify-between">
          <div className="mb-16 relative p-4 lg:px-6">
            <h2 className="text-2xl lg:text-5xl font-bold mb-2 uppercase mt-2">
              <div className="text-[#5DC9DE] drop-shadow-[0_0_15px_rgba(34,211,238,1)] mt-2">
                REAL ARTISTS. REAL TRUSTS. REAL RESULTS
              </div>
              {/* <h1 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)] lg:px-0 px-6 lg:py-0 pt-6">ARTIST SPOTLIGHT</h1> */}
            </h2>
            <p className="text-gray-400 max-w-2xl">
              Artists trusting us to support their Music Career. Their success
              stories are just the beginning.
            </p>
            {/* Leaderboard total line — restore useState(totalArtistCount) + setTotalArtistCount in fetch if re-enabled:
            <p className="mt-3 text-sm font-medium text-[#5DC9DE] tabular-nums">
              …
            </p> */}
          </div>
          <div className="pe-4 py-4 lg:py-0 sm:mt-16 lg:pe-6 xl:pe-16 relative z-50">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSliderNav('prev');
              }}
              className="bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors mr-2 cursor-pointer"
            >
              <img
                src={arrowLeftIc}
                alt="Previous"
                className="w-[20px] h-[20px] pointer-events-none"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSliderNav('next');
              }}
              className="bg-[#6F4FA0] p-3 rounded-full hover:bg-[#5a3f80] transition-colors cursor-pointer"
            >
              <img
                src={arrowRightIc}
                alt="Next"
                className="w-[20px] h-[20px] pointer-events-none"
              />
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative">
          <Slider
            key={artists.length ? `artists-${artists.length}` : "artists-empty"}
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
                    centerMode: false, // Disable centering
                    centerPadding: "0%",
                  },
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 2.6,
                    slidesToScroll: 1,
                    centerMode: false, // Disable centering
                    centerPadding: "0%",
                  },
                },
                {
                  breakpoint: 480,
                  settings: {
                    slidesToShow: 1.6,
                    slidesToScroll: 1,
                    centerMode: false, // Disable centering
                    centerPadding: "0%",
                  },
                },
              ],
            }}
          >
            {artists.map((artist, index) => {
              const id = artist.oph_id ?? artist.OPH_ID;
              return (
              <div key={id ?? `artist-slide-${index}`} className="px-4 cursor-pointer mb-10">
                <div
                  className="group relative pointer-events-auto"
                  onTouchEnd={(e) => {
                    //  e.preventDefault();
                    handleArtistClick(id, index);
                  }}
                >
                  <div className="flex justify-center overflow-hidden">
                    <Image
                      src={artist.personal_photo}
                      fallback={
                        <Shimmer
                          width={200}
                          height={200}
                          className="rounded-full"
                        />
                      }
                      alt={artist.stage_name}
                      NativeImgProps={{
                        className: `
      w-[200px] h-[200px] 
      rounded-full 
      object-cover 
      ${id === currArtist ? "border-4 border-primary" : ""}
    `,
                      }}
                    />
                  </div>
                  <div
                    className="flex flex-col text-center items-center justify-end p-4"
                    onMouseUp={(e) => {
                      if (e.button === 0)
                        handleArtistClick(id, index);
                    }}
                  >
                    <a
                      className={`text-lg font-semibold ${
                        id === currArtist
                          ? "text-[#5DC9DE]"
                          : "text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleArtistClick(id, index);
                      }}
                    >
                      {artist.stage_name}
                    </a>
                    <p
                      className={`text-sm ${
                        id === currArtist
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {artist.total_views >= 1000000
                        ? `${(artist.total_views / 1000000).toFixed(1)}M`
                        : artist.total_views >= 1000
                        ? `${(artist.total_views / 1000).toFixed(1)}K`
                        : artist.total_views}{" "}
                      + Listeners
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </Slider>
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
