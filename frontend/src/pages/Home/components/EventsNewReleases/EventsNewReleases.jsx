import { FaPlay, FaPause } from "react-icons/fa";
import { formatDateTime } from "../../../../utils/date";
import React, { useEffect, useMemo, useState } from "react";
import RegistrationModal from "../../../../components/registration/Registration";
import { useDispatch, useSelector } from "react-redux";
import { useArtist } from "../../../auth/API/ArtistContext";
import { changeSelectedEvent } from "../../../../slice/events";
import { fetchNewRelease } from "../../../../slice/newRelease";
import { useLocation, useNavigate } from "react-router-dom";
import getToken from "../../../../utils/getToken";
import axiosApi from "../../../../conf/axios";
import ReleaseBlur from "../../../../../public/assets/images/release_blur.png";

const isArtistRegistered = (eventId, artistBookEvents = []) =>
  artistBookEvents.some(
    (e) =>
      Number(e.event_id) === Number(eventId) &&
      (e.status === "under review" || e.status === "accepted"),
  );

const POLL_MS = 45_000;

const EventsNewReleases = ({ upcomingEvent, artistBookEvents = [] }) => {
  const { ophid, headers } = useArtist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audio, setAudio] = useState(null); // State for audio object
  const [playingSongId, setPlayingSongId] = useState(null); // State for currently playing song ID
  const eventID = useSelector((state) => state.event.selectedEvent);
  const location = useLocation();
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  console.log(upcomingEvent);

  const newReleases = useSelector((state) => state.newRelease.newRelease);

  const songsArray = useMemo(() => {
    const list =
      newReleases &&
      typeof newReleases === "object" &&
      !Array.isArray(newReleases)
        ? Object.values(newReleases)
        : [];
    return [...list].sort(
      (a, b) => (b.youtubeViews || 0) - (a.youtubeViews || 0),
    );
  }, [newReleases]);

  const visibleSongs = showAll ? songsArray : songsArray.slice(0, 5);

  useEffect(() => {
    if (!headers?.Authorization) return;
    const tick = () => dispatch(fetchNewRelease(headers));
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [dispatch, headers]);

  const handlePlayPause = (song) => {
    if (audio && playingSongId === song.songId) {
      // Toggle play/pause for the same song
      if (!audio.paused) {
        audio.pause();
        setPlayingSongId(null);
      } else {
        audio.play();
        setPlayingSongId(song.songId);
      }
    } else {
      // New song selected
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(song.audioUrl);
      newAudio.play();
      setAudio(newAudio);
      setPlayingSongId(song.songId);

      // Handle when the song ends
      newAudio.onended = () => {
        setPlayingSongId(null);
      };
    }
  };

  const navigate = useNavigate();

  const handleClick = async (data) => {
    if (!data) return;
    dispatch(changeSelectedEvent({ data }));

    // Navigate to event-specific payment page
    await navigate("/dashboard/payment", {
      state: {
        OPH_ID: ophid,
        amount: data.registrationFee_normal ?? data.fees,
        event_id: data.event_id,
        returnPath: "/dashboard/events",
        heading: "Complete Event Registration",
        from: "Event Registration",
      },
    });
  };

  const createEventReg = async () => {
    const token = getToken();
    if (location.state?.status === "success") {
      console.log("Success");
      console.log("Event ID", eventID);
      const payment_id = location.state.paymentData.newPaymentIds[0];
      console.log("Payment ID", payment_id);
      const response = await axiosApi.post(
        `/events/${eventID}/artist-booking`,
        {
          payment_id: payment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.status == 200) {
        console.log("Booking Successful");
      }
    }
  };

  useEffect(() => {
    createEventReg();
  }, [location.state]);

  return (
    <div className=" text-white overflow-hidden px-8 py-6 sm:my-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Events Section */}
        <div className="flex flex-col min-w-0">
          <h2 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            EVENTS
          </h2>
          {upcomingEvent && (
            <div
              className="relative flex-grow h-[300px] rounded-md shadow-lg before:content-['']
                before:absolute
                before:inset-0
                before:block
                before:bg-gradient-to-b
                before:from-[#00000000]
                before:to-[#000000]
                before:opacity-75
                before:z-5"
            >
              <img
                src={upcomingEvent.image}
                alt="Live event"
                className="rounded-lg w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 p-4">
                <div className="text-xs text-cyan-400 mb-2">
                  {formatDateTime(upcomingEvent.dateTime)} -{" "}
                  {upcomingEvent.location}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {upcomingEvent.EventName}
                </h3>
                {isArtistRegistered(
                  upcomingEvent.event_id ?? upcomingEvent.id,
                  artistBookEvents,
                ) ? (
                  <button
                    disabled={true}
                    className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Registered
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(upcomingEvent)} // Navigate to payment page
                    className="bg-[#6F4FA0] text-white px-4 py-2 rounded-full text-sm font-extrabold"
                  >
                    Book Your Spot Now
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* New Releases Section */}
        <div className="flex relative flex-col min-h-0 min-w-0">
          <h2 className="text-cyan-400 text-xl font-extrabold mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
            NEW RELEASES
          </h2>

          {/* Background blur images */}
          <img src={ReleaseBlur} className="absolute -left-48" alt="" />
          <img
            src={ReleaseBlur}
            className="absolute -right-48 -top-44"
            alt=""
          />

          <div className="z-30 flex flex-col flex-grow min-h-0">
            {/* Header */}
            <div className="flex shrink-0 items-end text-sm text-gray-400 justify-end pb-2">
              <span className="w-8">#</span>
              <span className="flex-grow ms-4">SONG</span>
              <span className="w-24 text-right">PLAY</span>
              <span className="w-24 text-right">LISTEN</span>
            </div>

            {/* Songs List */}
            <div
              className={`space-y-4 pr-1 no-scrollbar ${
                showAll ? "h-[300px] overflow-y-auto" : "h-auto overflow-hidden"
              }`}
            >
              {visibleSongs.length > 0 &&
                visibleSongs.map((song, index) => (
                  <div
                    key={song.songId}
                    onClick={() =>
                      window.open(
                        import.meta.env.VITE_WEBSITE_URL +
                          "artists/" +
                          song.ophid,
                        "_blank",
                      )
                    }
                    className="flex hover:cursor-pointer items-center py-2 border-b border-gray-800"
                  >
                    {/* Index */}
                    <span className="w-8 text-gray-400">{index + 1}</span>

                    {/* Image */}
                    <img
                      src={song.imageUrl?.[0] || ReleaseBlur}
                      className="w-10 h-10 rounded-md shrink-0"
                      alt=""
                    />

                    {/* Song Info */}
                    <div className="flex-grow ms-4 truncate min-w-0">
                      <div className="font-medium truncate">
                        {song.songName}
                      </div>

                      <div className="text-sm text-gray-400 truncate">
                        {song.primaryArtist}
                        {song.secondaryArtist?.length > 0 &&
                          !song.secondaryArtist.includes(null) && (
                            <span>, {song.secondaryArtist.join(", ")}</span>
                          )}
                      </div>
                    </div>

                    {/* Views */}
                    <span className="w-24 text-right text-gray-400 shrink-0">
                      {song.youtubeViews}
                    </span>

                    {/* Play Button */}
                    <span className="w-24 flex items-center justify-end ml-auto shrink-0">
                      <button
                        className="p-2 bg-[#6F4FA0] rounded-full hover:bg-purple-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPause(song);
                        }}
                      >
                        {playingSongId === song.songId && !audio?.paused ? (
                          <FaPause className="w-3 h-3" />
                        ) : (
                          <FaPlay className="w-3 h-3" />
                        )}
                      </button>
                    </span>
                  </div>
                ))}
            </div>

            {/* See More / Less */}
            {songsArray.length > 5 && (
              <div className="mt-3">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="text-cyan-400 hover:underline text-sm"
                >
                  {showAll ? "See Less..." : "See More..."}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <RegistrationModal
          id={upcomingEvent.id}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default EventsNewReleases;
