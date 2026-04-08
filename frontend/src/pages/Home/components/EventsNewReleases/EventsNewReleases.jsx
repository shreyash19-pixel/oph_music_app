import { FaPlay, FaPause } from "react-icons/fa";
import { formatDateTime } from "../../../../utils/date";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
      (e.status === "under review" || e.status === "accepted")
  );

const POLL_MS = 45_000;

const formatPlaybackTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

const EventsNewReleases = ({ upcomingEvent, artistBookEvents = [] }) => {
  const { ophid, headers } = useArtist();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioRef = useRef(null);
  const [playingSongId, setPlayingSongId] = useState(null);
  const [playback, setPlayback] = useState({ current: 0, duration: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const eventID = useSelector((state) => state.event.selectedEvent);
  const location = useLocation();
  const dispatch = useDispatch();

  const openModal = () => {
    setIsModalOpen(true);
  };

  console.log(upcomingEvent);
  

  const newReleases = useSelector((state) => state.newRelease.newRelease);

  const songsArray = useMemo(() => {
    const list =
      newReleases && typeof newReleases === "object" && !Array.isArray(newReleases)
        ? Object.values(newReleases)
        : [];
    return [...list].sort(
      (a, b) => (b.youtubeViews || 0) - (a.youtubeViews || 0),
    );
  }, [newReleases]);

  useEffect(() => {
    if (!headers?.Authorization) return;
    const tick = () => dispatch(fetchNewRelease(headers));
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [dispatch, headers]);

  const handlePlayPause = (song) => {
    const a = audioRef.current;
    if (a && playingSongId === song.songId) {
      if (!a.paused) {
        a.pause();
        setIsPlaying(false);
      } else {
        a.play();
        setIsPlaying(true);
      }
      return;
    }

    if (a) {
      a.pause();
      a.src = "";
    }

    const newAudio = new Audio(song.audioUrl);
    audioRef.current = newAudio;

    const syncPlayback = () => {
      setPlayback({
        current: newAudio.currentTime,
        duration: Number.isFinite(newAudio.duration) ? newAudio.duration : 0,
      });
    };

    newAudio.onloadedmetadata = syncPlayback;
    newAudio.ontimeupdate = syncPlayback;
    newAudio.onended = () => {
      setPlayingSongId(null);
      setIsPlaying(false);
      setPlayback({ current: 0, duration: 0 });
      audioRef.current = null;
    };

    setPlayingSongId(song.songId);
    newAudio.play().then(() => setIsPlaying(true)).catch(() => {
      setIsPlaying(false);
      setPlayingSongId(null);
      setPlayback({ current: 0, duration: 0 });
      audioRef.current = null;
    });
  };

  const handleSeek = (e, song) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a || playingSongId !== song.songId || !Number.isFinite(a.duration) || a.duration <= 0)
      return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(
      Math.max((e.clientX - rect.left) / rect.width, 0),
      1,
    );
    a.currentTime = pct * a.duration;
    setPlayback({
      current: a.currentTime,
      duration: a.duration,
    });
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

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
        }
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
                {isArtistRegistered(upcomingEvent.event_id ?? upcomingEvent.id, artistBookEvents) ? (
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

          <img src={ReleaseBlur} className="absolute -left-48" alt="" />
          <img
            src={ReleaseBlur}
            className="absolute -right-48 -top-44"
            alt=""
          />

          <div className="z-30 flex min-h-0 flex-grow flex-col">
            <div
              className="max-h-[300px] min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] [scrollbar-color:rgba(107,70,160,0.6)_transparent] [scrollbar-width:thin]"
            >
              <div className="sticky top-0 z-10 mb-2 grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_2.75rem] gap-x-3 items-center border-b border-gray-800/90 bg-black pb-2 pt-0.5 text-sm text-gray-400">
                <span className="w-8 shrink-0">#</span>
                <span className="min-w-0">SONG</span>
                <span className="text-center">LISTEN</span>
                <span className="text-center">PLAY</span>
              </div>
              {songsArray.length > 0 &&
                songsArray.map((song) => (
                  <div
                    key={song.songId}
                    onClick={() =>
                      window.open(
                        import.meta.env.VITE_WEBSITE_URL +
                          "artists" +
                          `/${song.ophid}`,
                        "_blank"
                      )
                    }
                    className="hover:cursor-pointer border-b border-gray-800 py-2"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_2.75rem] gap-x-3 items-center">
                        <img
                          src={song.imageUrl?.[0] || ReleaseBlur}
                          className="col-start-1 h-10 w-10 shrink-0 rounded-md"
                          alt=""
                        />
                        <div className="col-start-2 min-w-0">
                          <div className="font-medium">
                            <span className="hidden sm:block">{song.songName}</span>
                            <div className="max-w-full truncate overflow-hidden whitespace-nowrap text-sm text-gray-400">
                              {song.primaryArtist}
                              {song.secondaryArtist?.length > 0 &&
                                !song.secondaryArtist.includes(null) && (
                                  <span>, {song.secondaryArtist.join(", ")}</span>
                                )}
                            </div>
                          </div>
                        </div>

                        <span className="col-start-3 text-center text-sm tabular-nums text-gray-400">
                          {song.youtubeViews}
                        </span>

                        <div className="col-start-4 flex justify-center">
                          <button
                            type="button"
                            className="rounded-full bg-[#6F4FA0] p-2 transition-colors hover:bg-purple-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPause(song);
                            }}
                            aria-label={
                              playingSongId === song.songId && isPlaying
                                ? "Pause"
                                : "Play"
                            }
                          >
                            {playingSongId === song.songId && isPlaying ? (
                              <FaPause className="h-3 w-3" />
                            ) : (
                              <FaPlay className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {playingSongId === song.songId && (
                        <div
                          className="w-full min-w-0 pl-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            role="presentation"
                            className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-gray-700/90"
                            onClick={(e) => handleSeek(e, song)}
                          >
                            <div
                              className="pointer-events-none h-full rounded-full bg-[#5DC9DE]"
                              style={{
                                width: `${playback.duration > 0 ? (playback.current / playback.duration) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <div className="mt-0.5 flex w-full justify-between text-[10px] tabular-nums text-gray-500">
                            <span>{formatPlaybackTime(playback.current)}</span>
                            <span>{formatPlaybackTime(playback.duration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
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
