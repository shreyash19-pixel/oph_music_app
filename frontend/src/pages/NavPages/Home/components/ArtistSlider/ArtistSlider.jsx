import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import arrowRightIc from "/assets/images/arrowRightIc.svg";
import arrowLeftIc from "/assets/images/arrowLeftIc.svg";
import { useSelector } from "react-redux";
import axiosApi from "../../../../../conf/axios";
import MusicBg from "../../../../../../public/assets/images/music_bg.png";
import Elipse from "../../../../../../public/assets/images/elipse2.png";
import { Image, Shimmer } from "react-shimmer";
import ArtistProfile from "./ArtistProfile";

const ArtistSlider = ({ rows = 1 }) => {
  const sliderRef = useRef(null);
  const artistProfileRef = useRef(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artists, setArtists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [autoplay, setAutoplay] = useState(true);
  const perPage = 6;

  const [currArtist, setCurrentArtist] = useState(null);
  const artistsFromRedux = useSelector((state) => state.artist.artists);

  useEffect(() => {
    const fetchArtists = async (page = 1) => {
      try {
        const response = await axiosApi.get(
          `/leaderboard/ranked-artists?page=${page}&per_page=${perPage}`
        );
        setArtists(response.data.data);
        setTotalPages(response.data.pagination.total_pages);
      } catch (error) {
        console.error("Error fetching artists:", error);
      }
    };

    fetchArtists(currentPage);
  }, [currentPage]);

  const handleArtistClick = (id, index) => {
    setCurrentArtist(id);
    setSelectedArtist(id);
    setAutoplay(false);

    // Move the clicked slide to center
    if (sliderRef.current) {
      const centerIndex = Math.floor(artists.length / 2);
      sliderRef.current.slickGoTo(index - centerIndex);
    }

    // Scroll to ArtistProfile section
    if (artistProfileRef.current) {
      artistProfileRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
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
          </div>
          <div className="pe-4 py-4 lg:py-0 sm:mt-16 lg:pe-6 xl:pe-16">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="z-10 bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors mr-2"
              disabled={currentPage === 1}
            >
              <img
                src={arrowLeftIc}
                alt="Previous"
                className="w-[20px] h-[20px]"
              />
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="z-10 bg-[#6F4FA0] mt-3 lg:mt-0 p-2 rounded-full hover:bg-[#6F4FA0] transition-colors"
              disabled={currentPage === totalPages}
            >
              <img
                src={arrowRightIc}
                alt="Next"
                className="w-[20px] h-[20px]"
              />
            </button>
          </div>
        </div>

        {/* Slider Section */}
        <div className="relative">
          <Slider
            ref={sliderRef}
            {...{
              dots: false,
              speed: 500,
              autoplay: autoplay,
              infinite: true,
              slidesToShow: 5.6,
              slidesToScroll: 1,
              arrows: false,
              rows: rows,
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
            {artists.map((artist, index) => (
              <div key={artist.id} className="px-4 cursor-pointer mb-10">
                <div
                  className="group relative pointer-events-auto"
                  onTouchEnd={(e) => {
                    //  e.preventDefault();
                    //  handleArtistClick(artist.id, index);
                  }}
                >
                  <div className="flex justify-center overflow-hidden">
                    <Image
                      src={artist.profile_img_url}
                      fallback={
                        <Shimmer
                          width={200}
                          height={200}
                          className="rounded-full"
                        />
                      }
                      alt={artist.stage_name}
                      NativeImgProps={{
                        className: ` w-[200px] md:w rounded-full h-[200px] md:h-full object-cover ${
                          artist.id === currArtist
                            ? "border-4 border-primary"
                            : ""
                        }`,
                      }}
                    />
                  </div>
                  <div
                    className="flex flex-col text-center items-center justify-end p-4"
                    onMouseUp={(e) => {
                      if (e.button === 0) handleArtistClick(artist.id, index);
                    }}
                  >
                    <a
                      className={`text-lg font-semibold ${
                        artist.id === currArtist
                          ? "text-[#5DC9DE]"
                          : "text-white"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleArtistClick(artist.id, index);
                      }}
                    >
                      {artist.stage_name}
                    </a>
                    <p
                      className={`text-sm ${
                        artist.id === currArtist
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
            ))}
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
